
import { Trophy, DollarSign, Gift } from "lucide-react";
import MetricCard from "./MetricCard";

interface SecondaryMetricsProps {
  lifetimeRewards: number;
}

const SecondaryMetrics = ({ lifetimeRewards }: SecondaryMetricsProps) => {
  const formattedRewards = (lifetimeRewards / 1e9).toFixed(2);
  const feeAmount = (lifetimeRewards * 0.05 / 1e9).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Lifetime Rewards"
        value={`${formattedRewards} SOL`}
        subtitle="Total rewards earned"
        icon={<Trophy className="text-amber-400" size={20} />}
      />
      <MetricCard
        title="Accrued Fees (5%)"
        value={`${feeAmount} SOL`}
        subtitle="Based on Lifetime Rewards × 5%"
        icon={<DollarSign className="text-orange-400" size={20} />}
      />
      <MetricCard
        title="Rewards (30d)"
        value="0.00 SOL"
        change="+0.0% from previous 30d"
        icon={<Gift className="text-violet-400" size={20} />}
      />
    </div>
  );
};

export default SecondaryMetrics;
