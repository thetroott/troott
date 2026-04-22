import { CastState, useCastState } from 'react-native-google-cast';

import { pauseLocalPlayback } from '@/engine/player/pause-local-playback';

import usePlayerEngineStore, {
    PlayerEngine,
} from '@/engine/state/player-engine-store';

export const useSelectPlayerEngine = () => {
    const setPlayerEngineData = usePlayerEngineStore(
        (state) => state.setPlayerEngineData,
    );

    const castState = useCastState();

    if (castState === CastState.CONNECTED) {
        setPlayerEngineData(PlayerEngine.GOOGLE_CAST);
        void pauseLocalPlayback();
        return;
    }

    setPlayerEngineData(PlayerEngine.REACT_NATIVE_TRACK_PLAYER);
};
