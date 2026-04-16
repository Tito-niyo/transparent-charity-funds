import { useEffect, useMemo, useState } from "react";
import DonorDashboard from "../components/DonorDashboard";
import { useCharityFund } from "../hooks/useCharityFund";

export default function DonorPage() {
  const [donationAmount, setDonationAmount] = useState("5000");
  const {
    account,
    isLoading,
    message,
    admin,
    totalDonated,
    totalSpent,
    contractBalance,
    expenses,
    canUseApp,
    configuredAdmin,
    contractAddress,
    isAdmin,
    rwfPerEth,
    formatRwf,
    connectWallet,
    refreshData,
    donate,
    setMessage,
  } = useCharityFund();

  const donorShareLink = useMemo(() => {
    const shareUrl = new URL(window.location.origin);
    shareUrl.pathname = "/donor";
    shareUrl.searchParams.set("amount", donationAmount || "0.01");
    return shareUrl.toString();
  }, [donationAmount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get("amount");
    if (amount) setDonationAmount(amount);
  }, []);

  async function copyDonorLink() {
    try {
      await navigator.clipboard.writeText(donorShareLink);
      setMessage("Donor link copied. Share it with contributors.");
    } catch {
      setMessage(`Copy failed. Use this link: ${donorShareLink}`);
    }
  }

  return (
    <main className="container">
      <section className="page-header">
        <h1>A Blockchain-Based Transparent Charity Fund for Tracking Donations and Expenses</h1>
        <p>Donor Dashboard - donate securely and track every expense on-chain.</p>
        <p className="project-statement">
          A donation contract where every spent Rwandan Franc is tracked on-chain for donors to see.
        </p>
      </section>

      <div className="card actions-row">
        <button onClick={connectWallet} disabled={isLoading}>
          {account ? `Wallet: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect MetaMask"}
        </button>
        <button onClick={refreshData} disabled={isLoading || !canUseApp}>
          Refresh On-Chain Data
        </button>
      </div>

      <div className="card stat-grid">
        <h3>Live Transparency Stats</h3>
        <p>Admin: {admin || configuredAdmin || "Not loaded yet"}</p>
        <p>Total Donated: {formatRwf(totalDonated)}</p>
        <p>Total Spent: {formatRwf(totalSpent)}</p>
        <p>Contract Balance: {formatRwf(contractBalance)}</p>
      </div>

      <DonorDashboard
        donationAmount={donationAmount}
        isLoading={isLoading}
        donorShareLink={donorShareLink}
        rwfPerEth={rwfPerEth}
        onDonationAmountChange={setDonationAmount}
        onDonate={() => donate(donationAmount)}
        onCopyDonorLink={copyDonorLink}
      />

      <div className="card">
        <h3>Expenses</h3>
        {expenses.length === 0 ? (
          <p>No expenses created yet.</p>
        ) : (
          <div className="expense-list">
            {expenses.map((expense) => (
              <article key={expense.id.toString()} className="expense-item">
                <p>
                  <strong>ID:</strong> {expense.id.toString()} | <strong>Status:</strong>{" "}
                  {expense.paid ? "Paid" : "Pending"}
                </p>
                <p>
                  <strong>Description:</strong> {expense.description}
                </p>
                <p>
                  <strong>Amount:</strong> {formatRwf(expense.amount)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <p>Contract: {canUseApp ? contractAddress : "Not configured"}</p>
        <p className="badge">Current wallet role: {isAdmin ? "Admin" : "Donor / Viewer"}</p>
      </div>
      {message ? <div className="status">{message}</div> : null}
    </main>
  );
}
