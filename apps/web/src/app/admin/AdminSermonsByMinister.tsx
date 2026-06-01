import { useParams } from 'react-router-dom';

const AdminSermonsByMinister = () => {
    const { ministerId } = useParams<{ ministerId: string }>();
    return (
        <div className="p-8">
            <h1 className="text-xl font-semibold text-[#eaeaea]">
                Sermons by minister
            </h1>
            <p className="mt-2 text-muted-foreground">
                Minister {ministerId ?? '—'} — wire to GET
                /sermon/minister/:ministerId
            </p>
        </div>
    );
};

export default AdminSermonsByMinister;
