import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "../ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsCount: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "left-ellipsis" | "right-ellipsis";

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsCount,
  itemsPerPage,
  indexOfFirstItem,
  onPageChange,
}) => {
  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = (): any => {
    const pageNumbers: PageItem[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftBound = Math.max(1, currentPage - 1);
      const rightBound = Math.min(totalPages, currentPage + 1);

      pageNumbers.push(1);

      if (leftBound > 2) {
        pageNumbers.push("left-ellipsis");
      }

      for (let i = leftBound; i <= rightBound; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (rightBound < totalPages - 1) {
        pageNumbers.push("right-ellipsis");
      }

      if (totalPages !== 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) => {
      if (page === "left-ellipsis" || page === "right-ellipsis") {
        return (
          <PaginationItem key={`${page}-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      return (
        <PaginationItem key={page}>
          <PaginationLink
            size="default"
            onClick={() => onPageChange(page)}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="flex items-center justify-between px-4 mt-4 pt-4 border-t">
      <div className="text-sm text-gray-600 w-full">
        Showing {indexOfFirstItem + 1}-
        {Math.min(currentPage * itemsPerPage, itemsCount)} of {itemsCount}{" "}
        assignments
      </div>

      <Pagination className="w-full flex justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              size={"default"}
              onClick={currentPage === 1 ? undefined : handlePrevPage}
              className={
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              size={"default"}
              onClick={currentPage === totalPages ? undefined : handleNextPage}
              className={
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
