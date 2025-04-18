
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
}

const StakeAccountsTable = ({ stakeAccounts, isLoading }: StakeAccountsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof StakeAccount | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const itemsPerPage = 10;
  
  // Filter accounts based on search term
  const filteredAccounts = stakeAccounts.filter(account => 
    account.stake_account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort accounts
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

  // Calculate pagination
  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = sortedAccounts.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort toggle
  const handleSort = (field: keyof StakeAccount) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="1">
        <PaginationLink
          onClick={() => setCurrentPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ending ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
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
            {paginatedAccounts.length === 0 ? (
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
              paginatedAccounts.map((account) => (
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
      {sortedAccounts.length > itemsPerPage && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {generatePaginationItems()}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default StakeAccountsTable;
