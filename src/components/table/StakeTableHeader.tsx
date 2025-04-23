
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StakeAccount } from "@/types/solana";

interface StakeTableHeaderProps {
  sortField: keyof StakeAccount | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof StakeAccount) => void;
}

export const StakeTableHeader = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: StakeTableHeaderProps) => {
  const renderSortIndicator = (field: keyof StakeAccount) => {
    return sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '';
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-1/8" onClick={() => onSort('stake_account')}>
          Stake Account {renderSortIndicator('stake_account')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('sol_balance')}>
          SOL Balance {renderSortIndicator('sol_balance')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('status')}>
          Status {renderSortIndicator('status')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('delegated_stake_amount')}>
          Delegated Stake {renderSortIndicator('delegated_stake_amount')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('total_reward')}>
          Rewards {renderSortIndicator('total_reward')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('voter')}>
          Validator {renderSortIndicator('voter')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('type')}>
          Type {renderSortIndicator('type')}
        </TableHead>
        <TableHead className="w-1/8" onClick={() => onSort('role')}>
          Role {renderSortIndicator('role')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
