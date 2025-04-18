
import { Trophy, DollarSign, Calendar } from "lucide-react";
import MetricCard from "./MetricCard";
import { useState, useEffect } from "react";

interface SecondaryMetricsProps {
  lifetimeRewards: number;
}

const SecondaryMetrics = ({ lifetimeRewards }: SecondaryMetricsProps) => {
  const [stakeDate, setStakeDate] = useState<string>("Not started");
  
  // Ensure lifetimeRewards is a valid number and console log for debugging
  console.log("Lifetime rewards received:", lifetimeRewards);
  
  const numericLifetimeRewards = typeof lifetimeRewards === 'number' && !isNaN(lifetimeRewards) 
    ? lifetimeRewards 
    : 0;
  
  console.log("Numeric lifetime rewards after validation:", numericLifetimeRewards);
    
  const formattedRewards = (numericLifetimeRewards / 1e9).toFixed(2);
  const feeAmount = (numericLifetimeRewards * 0.05 / 1e9).toFixed(2);

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
        title="Staking Since"
        value={stakeDate}
        subtitle="First staking activity date"
        icon={<Calendar className="text-blue-400" size={20} />}
      />
    </div>
  );
};

export default SecondaryMetrics;
