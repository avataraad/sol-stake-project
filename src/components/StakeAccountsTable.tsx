import { useState } from 'react';
import { Search, Filter, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { StakeAccount } from '@/types/solana';
import { useToast } from "@/hooks/use-toast";

interface StakeAccountsTableProps {
  stakeAccounts: StakeAccount[];
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  totalPages: number;
}

const TruncatedAddress = ({ address }: { address: string }) => {
  const { toast } = useToast();
  const start = address.slice(0, 5);
  const end = address.slice(-5);
  const middle = address.slice(5, -5);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied to clipboard",
      description: "The address has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <div className="flex items-center">
        <span>{start}</span>
        <span className="text-muted-foreground">{middle}</span>
        <span>{end}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

const StakeAccountsTable = ({ 
  stakeAccounts, 
  isLoading, 
  currentPage,
  onPageChange,
  hasNextPage,
  totalPages 
}: StakeAccountsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof StakeAccount | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const filteredAccounts = stakeAccounts.filter(account => {
    const matchesSearch = account.stake_account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="deactivating">Deactivating</SelectItem>
              <SelectItem value="delegating">Delegating</SelectItem>
            </SelectContent>
          </Select>
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
      </div>
      <p className="text-sm text-gray-400 mb-2">
        All stake accounts associated with this wallet address
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%] cursor-pointer" onClick={() => handleSort('stake_account')}>
                Stake Account {sortField === 'stake_account' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[10%] cursor-pointer" onClick={() => handleSort('sol_balance')}>
                SOL Balance {sortField === 'sol_balance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[10%] cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[12%] cursor-pointer" onClick={() => handleSort('delegated_stake_amount')}>
                Delegated Stake {sortField === 'delegated_stake_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[10%] cursor-pointer" onClick={() => handleSort('total_reward')}>
                Rewards {sortField === 'total_reward' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[20%] cursor-pointer" onClick={() => handleSort('voter')}>
                Validator {sortField === 'voter' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[7%] cursor-pointer" onClick={() => handleSort('type')}>
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="w-[6%] cursor-pointer" onClick={() => handleSort('role')}>
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
                  <TableCell>
                    <TruncatedAddress address={account.stake_account} />
                  </TableCell>
                  <TableCell>{(account.sol_balance / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell>{account.status}</TableCell>
                  <TableCell>{(account.delegated_stake_amount / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell>{(account.total_reward / 1e9).toFixed(2)} SOL</TableCell>
                  <TableCell>
                    <TruncatedAddress address={account.voter} />
                  </TableCell>
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
