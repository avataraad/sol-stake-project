
import { useState, useEffect } from 'react';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import DashboardHeader from './metrics/DashboardHeader';
import MainMetrics from './metrics/MainMetrics';
import SecondaryMetrics from './metrics/SecondaryMetrics';
import StakingCharts from './metrics/StakingCharts';
import StakeAccountsTable from './StakeAccountsTable';

const StakingMetrics = () => {
  const [walletAddress, setWalletAddress] = useState('CFATy5hmHLpiEdy9HgHFGzUPYFckQgBdwAUrP6xc3jKq');
  const { 
    stakeAccounts,
    isLoading, 
    currentPage,
    hasNextPage,
    fetchAllStakeAccounts,
    handlePageChange,
    getTotalStakedBalance,
    getLifetimeRewards,
    getActiveStakesBalance,
    totalPages,
  } = useStakeAccounts();

  useEffect(() => {
    if (walletAddress) {
      fetchAllStakeAccounts(walletAddress, 1);
    }
  }, [walletAddress]);

  const handleTrack = () => {
    if (!walletAddress) return;
    fetchAllStakeAccounts(walletAddress, 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <DashboardHeader
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
        onTrack={handleTrack}
        isLoading={isLoading}
      />
      <MainMetrics 
        totalStakedBalance={getTotalStakedBalance()} 
        activeBalance={getActiveStakesBalance()} 
      />
      <SecondaryMetrics lifetimeRewards={getLifetimeRewards()} />
      <StakingCharts />
      <StakeAccountsTable 
        stakeAccounts={stakeAccounts}
        isLoading={isLoading}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        hasNextPage={hasNextPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default StakingMetrics;
