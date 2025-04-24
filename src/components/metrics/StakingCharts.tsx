
import RewardsHistoryChart from './RewardsHistoryChart';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';

const StakingCharts = () => {
  const { allStakeAccounts } = useStakeAccounts();

  return (
    <div className="grid grid-cols-1 gap-6">
      <RewardsHistoryChart stakeAccounts={allStakeAccounts} />
    </div>
  );
};

export default StakingCharts;
