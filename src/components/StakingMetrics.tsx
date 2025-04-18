
import { useState } from 'react';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import DashboardHeader from './metrics/DashboardHeader';
import MainMetrics from './metrics/MainMetrics';
import SecondaryMetrics from './metrics/SecondaryMetrics';
import StakingCharts from './metrics/StakingCharts';
import StakeAccountsTable from './StakeAccountsTable';

const StakingMetrics = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const { stakeAccounts, isLoading, fetchAllStakeAccounts } = useStakeAccounts();

  const totalStakedBalance = stakeAccounts.reduce(
    (sum, account) => sum + account.delegated_stake_amount,
    0
  );

  const handleTrack = () => {
    if (!walletAddress) return;
    fetchAllStakeAccounts(walletAddress);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <DashboardHeader
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
        onTrack={handleTrack}
        isLoading={isLoading}
      />
      <MainMetrics totalStakedBalance={totalStakedBalance} />
      <SecondaryMetrics />
      <StakingCharts />
      <StakeAccountsTable 
        stakeAccounts={stakeAccounts}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StakingMetrics;
