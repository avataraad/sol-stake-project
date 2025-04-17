
import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Hourglass, Trophy, DollarSign, PlusCircle, Edit2 } from "lucide-react";
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import { useUserWallet } from '@/hooks/useUserWallet';
import { Button } from "./ui/button";
import { MetricCard } from "./metrics/MetricCard";
import { WalletDialog } from "./wallet/WalletDialog";
import { ChartSection } from "./metrics/ChartSection";
import { StakeAccountsTable } from "./stake/StakeAccountsTable";

const dummyChartData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
  { name: 'Apr', value: 300 },
  { name: 'May', value: 250 },
];

const StakingMetrics = () => {
  const { stakeAccounts, isLoading: isLoadingStakes, fetchAllStakeAccounts } = useStakeAccounts();
  const { walletAddress, updateWallet, isLoading: isUpdatingWallet } = useUserWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchAllStakeAccounts(walletAddress);
    }
  }, [walletAddress]);

  const handleWalletUpdate = async (address: string) => {
    await updateWallet(address);
    if (address) {
      fetchAllStakeAccounts(address);
    }
  };

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
              <code className="px-2 py-1 bg-gray-800 rounded">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </code>
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
          icon={<Trophy className="text-emerald-400" size={20} />}
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
        <ChartSection title="Staked Balance (30 days)" data={dummyChartData} />
        <ChartSection title="Rewards History (30 days)" data={dummyChartData} />
      </div>

      <StakeAccountsTable accounts={stakeAccounts} isLoading={isLoadingStakes} />
    </div>
  );
};

export default StakingMetrics;
