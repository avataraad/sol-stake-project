
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { StakeAccount } from "@/types/solana";
import { TruncatedAddress } from "./TruncatedAddress";

interface StakeTableBodyProps {
  accounts: StakeAccount[];
  isLoading: boolean;
  searchTerm: string;
}

export const StakeTableBody = ({ accounts, isLoading, searchTerm }: StakeTableBodyProps) => {
  return (
    <TableBody>
      {accounts.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
            {isLoading 
              ? 'Loading stake accounts...' 
              : searchTerm 
                ? 'No matching stake accounts found.' 
                : 'No stake accounts found. Enter an address and click "Track" to get started.'}
          </TableCell>
        </TableRow>
      ) : (
        accounts.map((account) => (
          <TableRow key={account.stake_account}>
            <TableCell className="max-w-[150px]">
              <TruncatedAddress address={account.stake_account} />
            </TableCell>
            <TableCell>{(account.sol_balance / 1e9).toFixed(2)} SOL</TableCell>
            <TableCell>{account.status}</TableCell>
            <TableCell>{(account.active_stake_amount / 1e9).toFixed(2)} SOL</TableCell>
            <TableCell>{(account.total_reward / 1e9).toFixed(2)} SOL</TableCell>
            <TableCell className="max-w-[150px]">
              <TruncatedAddress address={account.voter} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );
};

