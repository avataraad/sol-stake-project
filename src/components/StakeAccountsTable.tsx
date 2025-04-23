
import { useState } from 'react';
import { StakeAccount } from '@/types/solana';
import { Table } from "@/components/ui/table";
import { StakeTableFilters } from './table/StakeTableFilters';
import { StakeTableHeader } from './table/StakeTableHeader';
import { StakeTableBody } from './table/StakeTableBody';
import { StakeTablePagination } from './table/StakeTablePagination';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof StakeAccount | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const filteredAccounts = stakeAccounts.filter(account => {
    const matchesSearch = account.stake_account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status.toLowerCase() === statusFilter.toLowerCase();
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
        <StakeTableFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
      <p className="text-sm text-gray-400 mb-2">
        All stake accounts associated with this wallet address
      </p>
      <div className="overflow-x-auto table-container">
        <Table className="border border-gray-200/10">
          <StakeTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <StakeTableBody 
            accounts={sortedAccounts}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        </Table>
      </div>
      <StakeTablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default StakeAccountsTable;
