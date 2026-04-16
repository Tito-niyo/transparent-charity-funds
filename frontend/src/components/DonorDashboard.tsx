type DonorDashboardProps = {
  donationAmount: string;
  isLoading: boolean;
  donorShareLink: string;
  rwfPerEth: number;
  onDonationAmountChange: (value: string) => void;
  onDonate: () => void;
  onCopyDonorLink: () => void;
};

export default function DonorDashboard({
  donationAmount,
  isLoading,
  donorShareLink,
  rwfPerEth,
  onDonationAmountChange,
  onDonate,
  onCopyDonorLink,
}: DonorDashboardProps) {
  return (
    <div className="card">
      <h3>Donor Dashboard</h3>
      <label htmlFor="amount">Donation Amount (RWF)</label>
      <input
        id="amount"
        type="number"
        min="100"
        step="100"
        value={donationAmount}
        onChange={(event) => onDonationAmountChange(event.target.value)}
      />
      <button onClick={onDonate} disabled={isLoading}>
        {isLoading ? "Processing..." : "Donate"}
      </button>
      <button onClick={onCopyDonorLink} disabled={!donorShareLink}>
        Copy Shareable Donor Link
      </button>
      <small className="muted-link">{donorShareLink}</small>
      <p>All expenses below are public for donor transparency.</p>
      <small>Reference rate: 1 ETH ~= {rwfPerEth.toLocaleString()} RWF</small>
    </div>
  );
}
