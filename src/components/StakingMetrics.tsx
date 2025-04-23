
import { useState, useEffect } from 'react';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import DashboardHeader from './metrics/DashboardHeader';
import MainMetrics from './metrics/MainMetrics';
import SecondaryMetrics from './metrics/SecondaryMetrics';
import StakeAccountsTable from './StakeAccountsTable';

const StakingMetrics = () => {
  const [walletAddress, setWalletAddress] = useState('CFATy5hmHLpiEdy9HgHFGzUPYFckQgBdwAUrP6xc3jKq');
  const { 
    stakeAccounts,
    allStakeAccounts,
    isLoading, 
    currentPage,
    hasNextPage,
    fetchAllStakeAccounts,
    handlePageChange,
    getTotalStakedBalance,
    getLifetimeRewards,
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

  const getActiveStakeBalance = () => {
    const totalActiveStake = allStakeAccounts.reduce((sum, account) => {
      const activeStake = Number(account.active_stake_amount || 0);
      return sum + activeStake;
    }, 0);
    
    return totalActiveStake;
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-8">
      <DashboardHeader
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
        onTrack={handleTrack}
        isLoading={isLoading}
      />
      <MainMetrics 
        totalStakedBalance={getTotalStakedBalance()} 
        activeStakeBalance={getActiveStakeBalance()}
      />
      <SecondaryMetrics lifetimeRewards={getLifetimeRewards()} />
      {/* Charts have been removed as per user request */}
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
