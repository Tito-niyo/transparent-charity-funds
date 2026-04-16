import { useMemo, useState } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import contractAbi from "../abi/TransparentCharityFund.json";

const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();
const configuredAdmin = (import.meta.env.VITE_ADMIN_WALLET || "").trim();
const rwfPerEth = Number((import.meta.env.VITE_RWF_PER_ETH || "4000000").trim());
const SEPOLIA_CHAIN_ID = 11155111n;

export type ExpenseItem = {
  id: bigint;
  description: string;
  amount: bigint;
  recipient: string;
  paid: boolean;
  timestamp: bigint;
};

export function useCharityFund() {
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [admin, setAdmin] = useState("");
  const [totalDonated, setTotalDonated] = useState<bigint>(0n);
  const [totalSpent, setTotalSpent] = useState<bigint>(0n);
  const [contractBalance, setContractBalance] = useState<bigint>(0n);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const canUseApp = useMemo(() => contractAddress.length > 0, []);
  const isAdmin = useMemo(() => {
    if (!account || !admin) return false;
    return account.toLowerCase() === admin.toLowerCase();
  }, [account, admin]);

  function formatRwf(value: bigint) {
    const ethValue = Number(ethers.formatEther(value));
    const rwfValue = ethValue * rwfPerEth;
    return `${Math.round(rwfValue).toLocaleString()} RWF`;
  }

  function parseRwfToWei(amountInRwf: string) {
    const numeric = Number(amountInRwf);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new Error("INVALID_AMOUNT");
    }
    const ethAmount = numeric / rwfPerEth;
    return ethers.parseEther(ethAmount.toFixed(18));
  }

  async function ensureSepolia(provider: BrowserProvider) {
    const network = await provider.getNetwork();
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error("WRONG_NETWORK");
    }
  }

  async function getReadContract() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new BrowserProvider(window.ethereum);
    return new Contract(contractAddress, contractAbi, provider);
  }

  async function getWriteContract() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new BrowserProvider(window.ethereum);
    await ensureSepolia(provider);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractAbi, signer);
  }

  async function refreshData() {
    if (!canUseApp) return;
    try {
      const contract = await getReadContract();
      const [adminAddress, raised, spent, balance, expenseRows] = await Promise.all([
        contract.admin(),
        contract.totalDonated(),
        contract.totalSpent(),
        contract.getContractBalance(),
        contract.getAllExpenses(),
      ]);
      setAdmin(adminAddress);
      setTotalDonated(raised);
      setTotalSpent(spent);
      setContractBalance(balance);
      setExpenses(expenseRows as ExpenseItem[]);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load contract data.");
    }
  }

  async function connectWallet() {
    if (!window.ethereum) return setMessage("MetaMask not detected. Please install MetaMask.");
    try {
      const provider = new BrowserProvider(window.ethereum);
      await ensureSepolia(provider);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await refreshData();
      setMessage("Wallet connected.");
    } catch (error) {
      console.error(error);
      const maybeCode = (error as { code?: number }).code;
      if (maybeCode === -32002) {
        setMessage("MetaMask request already pending. Open MetaMask and approve it.");
      } else if ((error as Error).message === "WRONG_NETWORK") {
        setMessage("Wrong network. Switch MetaMask to Sepolia.");
      } else {
        setMessage("Failed to connect wallet.");
      }
    }
  }

  async function donate(donationAmountInRwf: string) {
    if (!account) return setMessage("Connect wallet first.");
    if (!canUseApp) return setMessage("Set VITE_CONTRACT_ADDRESS in .env first.");
    try {
      setIsLoading(true);
      const contract = await getWriteContract();
      const tx = await contract.donate({ value: parseRwfToWei(donationAmountInRwf) });
      await tx.wait();
      await refreshData();
      setMessage(`Donation sent successfully. Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      if ((error as Error).message === "INVALID_AMOUNT") {
        setMessage("Invalid amount. Enter donation in RWF greater than 0.");
      } else {
        setMessage("Donation failed. Check Sepolia network, amount, and gas balance.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function createExpense(description: string, amountInRwf: string, recipient: string) {
    if (!account) return setMessage("Connect wallet first.");
    if (!isAdmin) return setMessage("Only admin wallet can create expenses.");
    try {
      setIsLoading(true);
      const contract = await getWriteContract();
      const tx = await contract.createExpense(description, parseRwfToWei(amountInRwf), recipient);
      await tx.wait();
      await refreshData();
      setMessage(`Expense created successfully. Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to create expense.");
    } finally {
      setIsLoading(false);
    }
  }

  async function payExpense(expenseId: string) {
    if (!account) return setMessage("Connect wallet first.");
    if (!isAdmin) return setMessage("Only admin wallet can pay expenses.");
    try {
      setIsLoading(true);
      const contract = await getWriteContract();
      const tx = await contract.payExpense(Number(expenseId));
      await tx.wait();
      await refreshData();
      setMessage(`Expense paid successfully. Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to pay expense. Check expense ID and contract balance.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    account,
    isLoading,
    message,
    setMessage,
    admin,
    totalDonated,
    totalSpent,
    contractBalance,
    expenses,
    canUseApp,
    configuredAdmin,
    rwfPerEth,
    formatRwf,
    contractAddress,
    isAdmin,
    connectWallet,
    refreshData,
    donate,
    createExpense,
    payExpense,
  };
}
