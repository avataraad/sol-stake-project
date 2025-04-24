
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

  useEffect(() => {
    if (walletAddress) {
      console.log(`Initial load - fetching stake accounts for wallet: ${walletAddress}`);
      fetchAllStakeAccounts(walletAddress, 1);
    }
  }, []);

  const handleTrack = () => {
    if (!walletAddress) {
      console.error("Cannot track: wallet address is empty");
      return;
    }
    console.log(`Track button clicked - fetching stake accounts for: ${walletAddress}`);
    fetchAllStakeAccounts(walletAddress, 1);
  };

  const getActiveStakeBalance = () => {
    console.log("Calculating active stake balance from", allStakeAccounts.length, "accounts");
    
    // If no accounts are loaded yet, return 0
    if (!allStakeAccounts || allStakeAccounts.length === 0) {
      console.log("No stake accounts available, returning 0 for active stake");
      return 0;
    }
    
    let totalActiveStake = 0;
    let validAccountsCount = 0;
    let invalidAccountsCount = 0;
    
    allStakeAccounts.forEach((account, index) => {
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
      
      // Handle different data formats and potential undefined values
      if (account.active_stake_amount !== undefined && account.active_stake_amount !== null) {
        // Convert string to number if needed
        const activeStake = typeof account.active_stake_amount === 'string' 
          ? parseFloat(account.active_stake_amount)
          : Number(account.active_stake_amount);
        
        // Only add valid numbers
        if (!isNaN(activeStake)) {
          totalActiveStake += activeStake;
          validAccountsCount++;
        } else {
          invalidAccountsCount++;
        }
      } else {
        invalidAccountsCount++;
      }
    });
    
    console.log(`Active stake calculation complete: Total=${totalActiveStake}, Valid Accounts=${validAccountsCount}, Invalid Accounts=${invalidAccountsCount}`);
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
    </div>
  );
};

export default StakingMetrics;
