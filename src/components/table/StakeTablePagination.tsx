
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface StakeTablePaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
}

export const StakeTablePagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  onPageChange,
}: StakeTablePaginationProps) => {
  return (
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
  );
};
