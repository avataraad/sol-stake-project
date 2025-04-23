
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
    console.log("Calculating active stake balance from", stakeAccounts.length, "accounts");
    
    const totalActiveStake = stakeAccounts.reduce((sum, account, index) => {
      // Log each account's active stake for debugging
      console.log(
        `Account #${index + 1} (${account.stake_account.substring(0, 8)}...): ` +
        `active_stake_amount=${account.active_stake_amount}, ` +
        `type=${typeof account.active_stake_amount}`
      );
      
      // Explicitly convert to number and handle potential undefined or null values
      const activeStake = Number(account.active_stake_amount || 0);
      
      console.log(`Converted active stake: ${activeStake}`);
      
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
