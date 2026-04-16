import { useMemo, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import { useCharityFund } from "../hooks/useCharityFund";

export default function AdminPage() {
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("5000");
  const [expenseRecipient, setExpenseRecipient] = useState("");
  const [expenseToPayId, setExpenseToPayId] = useState("0");
  const [expenseFilter, setExpenseFilter] = useState<"all" | "paid" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");

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
    createExpense,
    payExpense,
  } = useCharityFund();

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const statusMatch =
        expenseFilter === "all" ||
        (expenseFilter === "paid" && expense.paid) ||
        (expenseFilter === "pending" && !expense.paid);
      const search = searchTerm.trim().toLowerCase();
      const textMatch =
        search.length === 0 ||
        expense.description.toLowerCase().includes(search) ||
        expense.recipient.toLowerCase().includes(search) ||
        expense.id.toString().includes(search);
      return statusMatch && textMatch;
    });
  }, [expenses, expenseFilter, searchTerm]);

  const paidCount = expenses.filter((expense) => expense.paid).length;
  const pendingCount = expenses.length - paidCount;

  return (
    <main className="container">
      <section className="page-header">
        <h1>A Blockchain-Based Transparent Charity Fund for Tracking Donations and Expenses</h1>
        <p>Charity Admin Dashboard - manage and disburse funds transparently.</p>
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
        <p>Reference rate: 1 ETH ~= {rwfPerEth.toLocaleString()} RWF</p>
      </div>

      <AdminDashboard
        isLoading={isLoading}
        isAdmin={isAdmin}
        admin={admin}
        configuredAdmin={configuredAdmin}
        expenseDescription={expenseDescription}
        expenseAmount={expenseAmount}
        expenseRecipient={expenseRecipient}
        expenseToPayId={expenseToPayId}
        onExpenseDescriptionChange={setExpenseDescription}
        onExpenseAmountChange={setExpenseAmount}
        onExpenseRecipientChange={setExpenseRecipient}
        onExpenseToPayIdChange={setExpenseToPayId}
        onCreateExpense={() => createExpense(expenseDescription, expenseAmount, expenseRecipient)}
        onPayExpense={() => payExpense(expenseToPayId)}
      />

      <div className="card">
        <h3>Expenses</h3>
        <p>Total expenses created: {expenses.length}</p>
        <div className="summary-row">
          <span className="pill">Paid: {paidCount}</span>
          <span className="pill">Pending: {pendingCount}</span>
        </div>
        <div className="filters-row">
          <select value={expenseFilter} onChange={(event) => setExpenseFilter(event.target.value as "all" | "paid" | "pending")}>
            <option value="all">All expenses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="text"
            placeholder="Search by ID, description, recipient"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {filteredExpenses.length === 0 ? (
          <p>No expenses match this filter.</p>
        ) : (
          <div className="expense-list">
            {filteredExpenses.map((expense) => (
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
                <p>
                  <strong>Recipient:</strong> {expense.recipient}
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
