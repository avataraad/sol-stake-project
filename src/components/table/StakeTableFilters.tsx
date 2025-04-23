
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === "all" ? "All Status" : statusFilter}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuItem onClick={() => setStatusFilter("all")}>
            All Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("active")}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
            Inactive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("deactivating")}>
            Deactivating
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter("delegating")}>
            Delegating
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
