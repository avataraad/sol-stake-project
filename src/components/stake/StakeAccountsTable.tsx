
import { StakeAccount } from "@/types/solana";

interface StakeAccountsTableProps {
  accounts: StakeAccount[];
  isLoading: boolean;
}

export const StakeAccountsTable = ({ accounts, isLoading }: StakeAccountsTableProps) => {
  return (
    <div className="chart-card">
      <h3 className="font-semibold mb-4">Stake Accounts</h3>
      <p className="text-sm text-gray-400 mb-2">
        All stake accounts associated with this wallet address
      </p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400">
              <th className="py-3 px-4">Stake Account</th>
              <th className="py-3 px-4">SOL Balance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Delegated Stake (SOL)</th>
              <th className="py-3 px-4">Total Rewards</th>
              <th className="py-3 px-4">Validator</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  {isLoading 
                    ? 'Loading stake accounts...' 
                    : 'No stake accounts found. Enter an address and click "Track" to get started.'}
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.stake_account} className="border-t border-gray-800">
                  <td className="py-3 px-4 font-mono text-sm">{account.stake_account}</td>
                  <td className="py-3 px-4">{(account.sol_balance / 1e9).toFixed(2)} SOL</td>
                  <td className="py-3 px-4">{account.status}</td>
                  <td className="py-3 px-4">{(account.delegated_stake_amount / 1e9).toFixed(2)} SOL</td>
                  <td className="py-3 px-4">{(account.total_reward / 1e9).toFixed(2)} SOL</td>
                  <td className="py-3 px-4 font-mono text-sm">{account.voter}</td>
                  <td className="py-3 px-4">{account.type}</td>
                  <td className="py-3 px-4">{account.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
