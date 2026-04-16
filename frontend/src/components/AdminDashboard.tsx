type AdminDashboardProps = {
  isLoading: boolean;
  isAdmin: boolean;
  admin: string;
  configuredAdmin: string;
  expenseDescription: string;
  expenseAmount: string;
  expenseRecipient: string;
  expenseToPayId: string;
  onExpenseDescriptionChange: (value: string) => void;
  onExpenseAmountChange: (value: string) => void;
  onExpenseRecipientChange: (value: string) => void;
  onExpenseToPayIdChange: (value: string) => void;
  onCreateExpense: () => void;
  onPayExpense: () => void;
};

export default function AdminDashboard({
  isLoading,
  isAdmin,
  admin,
  configuredAdmin,
  expenseDescription,
  expenseAmount,
  expenseRecipient,
  expenseToPayId,
  onExpenseDescriptionChange,
  onExpenseAmountChange,
  onExpenseRecipientChange,
  onExpenseToPayIdChange,
  onCreateExpense,
  onPayExpense,
}: AdminDashboardProps) {
  return (
    <>
      <div className="card">
        <h3>Charity Funds Admin</h3>
        <p>Only admin wallet can create and pay expenses.</p>
        <p>Admin wallet: {admin || configuredAdmin || "Not loaded yet"}</p>
      </div>

      <div className="card">
        <h3>Create Expense</h3>
        <input
          type="text"
          placeholder="Description (e.g. Buy food)"
          value={expenseDescription}
          onChange={(event) => onExpenseDescriptionChange(event.target.value)}
        />
        <input
          type="number"
          min="100"
          step="100"
          placeholder="Amount in RWF"
          value={expenseAmount}
          onChange={(event) => onExpenseAmountChange(event.target.value)}
        />
        <input
          type="text"
          placeholder="Recipient wallet address"
          value={expenseRecipient}
          onChange={(event) => onExpenseRecipientChange(event.target.value)}
        />
        <button onClick={onCreateExpense} disabled={isLoading || !isAdmin}>
          {isLoading ? "Processing..." : "Create Expense"}
        </button>
      </div>

      <div className="card">
        <h3>Pay Expense</h3>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Expense ID"
          value={expenseToPayId}
          onChange={(event) => onExpenseToPayIdChange(event.target.value)}
        />
        <button onClick={onPayExpense} disabled={isLoading || !isAdmin}>
          {isLoading ? "Processing..." : "Pay Expense"}
        </button>
      </div>
    </>
  );
}
