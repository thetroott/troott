import FullPlayerScreen, {
    type FullPlayerTrackDetailsProps,
} from '@/components/features/player/full-player/full-player-screen';

const FullPlayerTrackDetails: React.FC<FullPlayerTrackDetailsProps> = (
    props,
) => <FullPlayerScreen {...props} />;

export type { FullPlayerTrackDetailsProps };
export default FullPlayerTrackDetails;
