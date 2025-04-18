import { useState } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StakeAccount } from '@/types/solana';

interface StakeAccountsTableProps {
  stakeAccounts: StakeAccount[];
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  totalPages: number;
}

const StakeAccountsTable = ({ 
  stakeAccounts, 
  isLoading, 
  currentPage,
  onPageChange,
  hasNextPage,
  totalPages 
}: StakeAccountsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof StakeAccount | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const filteredAccounts = stakeAccounts.filter(account => 
    account.stake_account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === 'asc' ? 
      aStr.localeCompare(bStr) : 
      bStr.localeCompare(aStr);
  });

  const handleSort = (field: keyof StakeAccount) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="chart-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Stake Accounts</h3>
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search by stake account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-2">
        All stake accounts associated with this wallet address
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('stake_account')}>
                Stake Account {sortField === 'stake_account' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('sol_balance')}>
                SOL Balance {sortField === 'sol_balance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('delegated_stake_amount')}>
                Delegated Stake (SOL) {sortField === 'delegated_stake_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('total_reward')}>
                Total Rewards {sortField === 'total_reward' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('voter')}>
                Validator {sortField === 'voter' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  {isLoading 
                    ? 'Loading stake accounts...' 
                    : searchTerm 
                      ? 'No matching stake accounts found.' 
                      : 'No stake accounts found. Enter an address and click "Track" to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              sortedAccounts.map((account) => (
                <TableRow key={account.stake_account}>
                  <TableCell className="font-mono text-sm">{account.stake_account}</TableCell>
                  <TableCell>{(account.sol_balance / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell>{account.status}</TableCell>
                  <TableCell>{(account.delegated_stake_amount / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell>{(account.total_reward / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell className="font-mono text-sm">{account.voter}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell>{account.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages || 1}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive={true}>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => hasNextPage && onPageChange(currentPage + 1)}
                className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default StakeAccountsTable;
