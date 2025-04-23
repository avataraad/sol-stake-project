
import { Activity } from "lucide-react";
import MetricCard from "./MetricCard";

interface ActiveStakeMetricsProps {
  totalStaked: number;
  waitingToBeStaked: number;
  apr: number;
  aprChange: number;
}

const ActiveStakeMetrics = ({ totalStaked, waitingToBeStaked, apr, aprChange }: ActiveStakeMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Staked Balance"
        value={`${(totalStaked / 1e9).toFixed(2)} SOL`}
        icon={<Activity className="text-purple-400" size={20} />}
      />
      <MetricCard
        title="Waiting to be Staked"
        value={`${(waitingToBeStaked / 1e9).toFixed(2)} SOL`}
        subtitle="Activation estimated in 2 epochs"
        icon={<Activity className="text-blue-400" size={20} />}
      />
      <MetricCard
        title="APR % (30d)"
        value={`${apr.toFixed(2)}%`}
        change={`${aprChange >= 0 ? '+' : ''}${aprChange.toFixed(1)}% from previous 30d`}
        icon={<Activity className="text-emerald-400" size={20} />}
      />
    </div>
  );
};

export default ActiveStakeMetrics;
