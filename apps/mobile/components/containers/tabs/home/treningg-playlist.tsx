import { useLoadNewQueue } from "@/engine/hooks/useControl"
import { useRecentlyPlayedTracks } from "@/engine/hooks/useRecentlyPlayedTracks"
import { useNetworkStatus } from "@/stores/app/network"
import { useCurrentTrack } from "@/stores/player/queue"
import { useRouter } from "expo-router"


const TrendingPlayList = () => {


    const [networkStatus] = useNetworkStatus()

    const nowPlaying = useCurrentTrack()

    const router = useRouter()

    const loadNewQueue = useLoadNewQueue()

	const tracksInfiniteQuery = useRecentlyPlayedTracks()


}

export default TrendingPlayList