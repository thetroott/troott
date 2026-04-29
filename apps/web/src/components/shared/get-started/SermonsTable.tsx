import type { Sermon } from '@/_data/dummySermons';
import SharedSermonsTable from '@/components/shared/my-sermons/SermonsTable';

interface SermonsTableProps {
    sermons: Sermon[];
}

/** Get-started demo reuses the dashboard My Sermons chrome (`SermonsTable`). */
const SermonsTable = ({ sermons }: SermonsTableProps) => {
    return <SharedSermonsTable sermons={sermons} />;
};

export default SermonsTable;
