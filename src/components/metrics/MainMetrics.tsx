
import { DollarSign, Hourglass, Percent, Activity } from "lucide-react";
import MetricCard from "./MetricCard";

interface MainMetricsProps {
  totalStakedBalance: number;
  activeStakeBalance: number;
  nativeBalance: number;
}

const MainMetrics = ({ totalStakedBalance, activeStakeBalance, nativeBalance }: MainMetricsProps) => {
  console.log('MainMetrics component received:', {
    totalStakedBalance: `${totalStakedBalance} (${totalStakedBalance / 1e9} SOL)`,
    activeStakeBalance: `${activeStakeBalance} (${activeStakeBalance / 1e9} SOL)`,
    nativeBalance: `${nativeBalance} (${nativeBalance / 1e9} SOL)`,
  });

  // Ensure all values are valid numbers
  const safeTotal = isNaN(totalStakedBalance) ? 0 : totalStakedBalance;
  const safeActive = isNaN(activeStakeBalance) ? 0 : activeStakeBalance;
  const safeNative = isNaN(nativeBalance) ? 0 : nativeBalance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total SOL Balance"
        value={`${(safeTotal / 1e9).toFixed(2)} SOL`}
        icon={<DollarSign className="text-purple-400" size={20} />}
      />
      <MetricCard
        title="Active Stake"
        value={`${(safeActive / 1e9).toFixed(2)} SOL`}
        icon={<Activity className="text-blue-400" size={20} />}
      />
      <MetricCard
        title="Waiting to be Staked"
        value={`${(safeNative / 1e9).toFixed(2)} SOL`}
        subtitle="Activation estimated in 2 epochs"
        icon={<Hourglass className="text-blue-400" size={20} />}
      />
      <MetricCard
        title="APR % (30d)"
        value="0.00%"
        change="+0.0% from previous 30d"
        icon={<Percent className="text-emerald-400" size={20} />}
      />
    </div>
  );
};

export default MainMetrics;
