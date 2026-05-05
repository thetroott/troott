import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MY_SERMONS_PAGE } from '@/components/shared/my-sermons/my-sermons-ui';

type MySermonsPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (next: number) => void;
};

const MySermonsPagination = ({
    page,
    pageSize,
    total,
    onPageChange,
}: MySermonsPaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, total);

    return (
        <footer
            className={MY_SERMONS_PAGE.paginationBar}
            aria-label="Pagination"
        >
            <div className={MY_SERMONS_PAGE.paginationCluster}>
                <button
                    type="button"
                    className={MY_SERMONS_PAGE.paginationNavBtn}
                    aria-label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => onPageChange(safePage - 1)}
                >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <select
                    className={MY_SERMONS_PAGE.pageSelect}
                    aria-label="Current page"
                    value={String(safePage)}
                    onChange={(e) =>
                        onPageChange(Number.parseInt(e.target.value, 10))
                    }
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (n) => (
                            <option key={n} value={String(n)}>
                                {n}
                            </option>
                        ),
                    )}
                </select>
                <button
                    type="button"
                    className={MY_SERMONS_PAGE.paginationNavBtn}
                    aria-label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() => onPageChange(safePage + 1)}
                >
                    <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
            </div>
            <p className={MY_SERMONS_PAGE.paginationRange}>
                {total === 0 ? '0 of 0' : `${start}-${end} of ${total}`}
            </p>
        </footer>
    );
};

export default MySermonsPagination;
