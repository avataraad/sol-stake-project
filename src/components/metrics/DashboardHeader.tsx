
interface DashboardHeaderProps {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  onTrack: () => void;
  isLoading: boolean;
}

const DashboardHeader = ({
  walletAddress,
  setWalletAddress,
  onTrack,
  isLoading,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Solana Staking Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Monitor and track your staking metrics</p>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter Solana wallet address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="glass-card px-4 py-2 w-80 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button 
          className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          onClick={onTrack}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Track'}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
