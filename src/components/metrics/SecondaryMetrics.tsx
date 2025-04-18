
import { Trophy, DollarSign, Calendar } from "lucide-react";
import MetricCard from "./MetricCard";

const SecondaryMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Lifetime Rewards"
        value="0.00 SOL"
        subtitle="No data available"
        icon={<Trophy className="text-amber-400" size={20} />}
      />
      <MetricCard
        title="Accrued Fees (5%)"
        value="0.00 SOL"
        subtitle="Based on Lifetime Rewards × 5%"
        icon={<DollarSign className="text-orange-400" size={20} />}
      />
      <MetricCard
        title="Staking Since"
        value="Not started"
        subtitle="First staking activity date"
        icon={<Calendar className="text-blue-400" size={20} />}
      />
    </div>
  );
};

export default SecondaryMetrics;
