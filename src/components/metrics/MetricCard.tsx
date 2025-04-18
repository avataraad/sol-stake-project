
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, subtitle, icon }: MetricCardProps) => (
  <div className="metric-card">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="p-2 rounded-lg bg-white/5">{icon}</div>
    </div>
    {change && (
      <div className="flex items-center text-sm text-emerald-400">
        <ArrowUpRight size={16} />
        <span>{change}</span>
      </div>
    )}
    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

export default MetricCard;
