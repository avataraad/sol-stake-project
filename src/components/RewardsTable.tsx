
import { useState } from 'react';
import { RewardEntry } from '@/types/solana';
import { Table } from "@/components/ui/table";
import { format } from 'date-fns';

interface RewardsTableProps {
  rewards: RewardEntry[];
  isLoading: boolean;
}

const RewardsTable = ({ rewards, isLoading }: RewardsTableProps) => {
  const formatSOL = (lamports: number) => {
    return (lamports / 1e9).toFixed(4) + ' SOL';
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="chart-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Reward History</h3>
      </div>
      <p className="text-sm text-gray-400 mb-2">
        Recent rewards earned by stake accounts
      </p>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th className="px-4 py-2">Epoch</th>
              <th className="px-4 py-2">Stake Account</th>
              <th className="px-4 py-2">Reward Amount</th>
              <th className="px-4 py-2">Commission</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading rewards data...
                </td>
              </tr>
            ) : rewards.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No rewards data available
                </td>
              </tr>
            ) : (
              rewards.map((reward) => (
                <tr key={`${reward.stake_account}-${reward.epoch}`}>
                  <td className="px-4 py-2">{reward.epoch}</td>
                  <td className="px-4 py-2">
                    {reward.stake_account.substring(0, 4)}...
                    {reward.stake_account.substring(reward.stake_account.length - 4)}
                  </td>
                  <td className="px-4 py-2">{formatSOL(reward.amount)}</td>
                  <td className="px-4 py-2">{reward.commission}%</td>
                  <td className="px-4 py-2">{formatDate(reward.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RewardsTable;
