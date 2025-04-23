
import { DollarSign, Hourglass, Percent, Trophy, Gift } from "lucide-react";
import MetricCard from "./MetricCard";

interface MainMetricsProps {
  totalStakedBalance: number;
  activeBalance: number;
}

const MainMetrics = ({ totalStakedBalance, activeBalance }: MainMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Total SOL Balance"
        value={`${(totalStakedBalance / 1e9).toFixed(2)} SOL`}
        icon={<DollarSign className="text-purple-400" size={20} />}
      />
      <MetricCard
        title="Active Balance"
        value={`${(activeBalance / 1e9).toFixed(2)} SOL`}
        icon={<Trophy className="text-green-400" size={20} />}
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
