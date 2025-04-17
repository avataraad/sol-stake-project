import { ArrowUpRight, Calendar, Gift, Clock, Percent, Hourglass, Trophy, DollarSign, PlusCircle, Edit2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, subtitle, icon }: MetricCardProps) => (
  <div className="metric-card">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="p-2 rounded-lg bg-white/5">{icon}</div>
    </div>
    {change && (
      <div className="flex items-center text-sm text-emerald-400">
        <ArrowUpRight size={16} />
        <span>{change}</span>
      </div>
    )}
    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const WalletDialog = ({
  isOpen,
  onOpenChange,
  currentWallet,
  onSubmit,
  isLoading
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentWallet: string | null;
  onSubmit: (address: string) => void;
  isLoading: boolean;
}) => {
  const [newWallet, setNewWallet] = useState(currentWallet || '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentWallet ? 'Update Wallet' : 'Add Wallet'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter Solana wallet address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              onSubmit(newWallet);
              onOpenChange(false);
            }}
            disabled={isLoading || !newWallet}
            className="w-full"
          >
            {isLoading ? 'Processing...' : (currentWallet ? 'Update' : 'Add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StakingMetrics = () => {
  const { stakeAccounts, isLoading: isLoadingStakes, fetchAllStakeAccounts } = useStakeAccounts();
  const { walletAddress, updateWallet, isLoading: isUpdatingWallet } = useUserWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleWalletUpdate = async (address: string) => {
    await updateWallet(address);
    if (address) {
      fetchAllStakeAccounts(address);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchAllStakeAccounts(walletAddress);
    }
  }, [walletAddress]);

  const totalStakedBalance = stakeAccounts.reduce(
    (sum, account) => sum + account.delegated_stake_amount,
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Solana Staking Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Monitor and track your staking metrics</p>
        </div>
        <div className="flex gap-3">
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Wallet:</span>
              <code className="px-2 py-1 bg-gray-800 rounded">{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Wallet
            </Button>
          )}
        </div>
      </div>

      <WalletDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentWallet={walletAddress}
        onSubmit={handleWalletUpdate}
        isLoading={isUpdatingWallet}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Staked Balance"
          value={`${(totalStakedBalance / 1e9).toFixed(2)} SOL`}
          icon={<DollarSign className="text-purple-400" size={20} />}
        />
        <MetricCard
          title="Waiting to be Staked"
          value="0.00 SOL"
          subtitle="Activation estimated in 2 epochs"
          icon={<Hourglass className="text-blue-400" size={20} />}
        />
        <MetricCard
          title="APR % (30d)"
          value="0.00%"
          change="+0.0% from previous 30d"
          icon={<Percent className="text-emerald-400" size={20} />}
        />
        <MetricCard
          title="Rewards (30d)"
          value="0.00 SOL"
          change="+0.0% from previous 30d"
          icon={<Gift className="text-violet-400" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Lifetime Rewards"
          value="0.00 SOL"
          subtitle="No data available"
          icon={<Trophy className="text-amber-400" size={20} />}
        />
        <MetricCard
          title="Accrued Fees (5%)"
          value="0.00 SOL"
          subtitle="Based on Lifetime Rewards × 5%"
          icon={<DollarSign className="text-orange-400" size={20} />}
        />
        <MetricCard
          title="Staking Since"
          value="Not started"
          subtitle="First staking activity date"
          icon={<Calendar className="text-blue-400" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Staked Balance (30 days)</h3>
            <div className="flex gap-2">
              {["1W", "1M", "3M", "1Y"].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm rounded-md hover:bg-white/5"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Rewards History (30 days)</h3>
            <div className="flex gap-2">
              {["1W", "1M", "3M", "1Y"].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm rounded-md hover:bg-white/5"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="font-semibold mb-4">Stake Accounts</h3>
        <p className="text-sm text-gray-400 mb-2">
          All stake accounts associated with this wallet address
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400">
                <th className="py-3 px-4">Stake Account</th>
                <th className="py-3 px-4">SOL Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delegated Stake (SOL)</th>
                <th className="py-3 px-4">Total Rewards</th>
                <th className="py-3 px-4">Validator</th>
                <th className="py-3 px-4">APR</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {stakeAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    {isLoadingStakes 
                      ? 'Loading stake accounts...' 
                      : 'No stake accounts found. Enter an address and click "Track" to get started.'}
                  </td>
                </tr>
              ) : (
                stakeAccounts.map((account) => (
                  <tr key={account.stake_account} className="border-t border-gray-800">
                    <td className="py-3 px-4 font-mono text-sm">{account.stake_account}</td>
                    <td className="py-3 px-4">{(account.sol_balance / 1e9).toFixed(2)} SOL</td>
                    <td className="py-3 px-4">{account.status}</td>
                    <td className="py-3 px-4">{(account.delegated_stake_amount / 1e9).toFixed(2)} SOL</td>
                    <td className="py-3 px-4">{(account.total_reward / 1e9).toFixed(2)} SOL</td>
                    <td className="py-3 px-4 font-mono text-sm">{account.voter}</td>
                    <td className="py-3 px-4">{account.type}</td>
                    <td className="py-3 px-4">{account.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StakingMetrics;
