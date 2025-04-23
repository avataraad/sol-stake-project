
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StakeTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export const StakeTableFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: StakeTableFiltersProps) => {
  return (
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
  );
};
