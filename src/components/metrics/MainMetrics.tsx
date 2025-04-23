
import { DollarSign, Hourglass, Percent, Activity } from "lucide-react";
import MetricCard from "./MetricCard";

interface MainMetricsProps {
  totalStakedBalance: number;
  activeStakeBalance: number;
}

const MainMetrics = ({ totalStakedBalance, activeStakeBalance }: MainMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total SOL Balance"
        value={`${(totalStakedBalance / 1e9).toFixed(2)} SOL`}
        icon={<DollarSign className="text-purple-400" size={20} />}
      />
      <MetricCard
        title="Active Stake"
        value={`${(activeStakeBalance / 1e9).toFixed(2)} SOL`}
        icon={<Activity className="text-blue-400" size={20} />}
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
    </div>
  );
};

export default MainMetrics;

