
import { useState, useEffect } from 'react';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';
import { useRewards } from '@/hooks/useRewards';
import DashboardHeader from './metrics/DashboardHeader';
import MainMetrics from './metrics/MainMetrics';
import SecondaryMetrics from './metrics/SecondaryMetrics';
import StakingCharts from './metrics/StakingCharts';
import StakeAccountsTable from './StakeAccountsTable';
import RewardsTable from './RewardsTable';

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
    nativeBalance,
  } = useStakeAccounts();
  
  const {
    rewards,
    isLoading: isLoadingRewards,
    isRefreshing,
    fetchRewardsForWallet,
    refreshRewardsData
  } = useRewards();

  useEffect(() => {
    if (walletAddress) {
      fetchAllStakeAccounts(walletAddress, 1);
    }
  }, [walletAddress, fetchAllStakeAccounts]);

  useEffect(() => {
    if (allStakeAccounts && allStakeAccounts.length > 0) {
      const stakeAccountAddresses = allStakeAccounts.map(account => account.stake_account);
      fetchRewardsForWallet(stakeAccountAddresses);
    }
  }, [allStakeAccounts, fetchRewardsForWallet]);

  const handleTrack = () => {
    if (!walletAddress) return;
    fetchAllStakeAccounts(walletAddress, 1);
  };

  const getActiveStakeBalance = () => {
    console.log("Calculating active stake balance from", allStakeAccounts.length, "accounts");
    
    const totalActiveStake = allStakeAccounts.reduce((sum, account, index) => {
      // Only log first few accounts for debugging to avoid console flooding
      if (index < 5) {
        console.log(
          `Account #${index + 1} (${account.stake_account.substring(0, 8)}...): ` +
          `active_stake_amount=${account.active_stake_amount}, ` +
          `type=${typeof account.active_stake_amount}`
        );
      } else if (index === 5) {
        console.log("... and more accounts");
      }
      
      // Explicitly convert to number and handle potential undefined or null values
      const activeStake = Number(account.active_stake_amount || 0);
      
      return sum + activeStake;
    }, 0);
    
    console.log("Total calculated active stake:", totalActiveStake);
    return totalActiveStake;
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
        activeStakeBalance={getActiveStakeBalance()}
        nativeBalance={nativeBalance}
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
      <RewardsTable 
        rewards={rewards}
        isLoading={isLoadingRewards || isRefreshing}
        onRefresh={refreshRewardsData}
      />
    </div>
  );
};

export default StakingMetrics;
