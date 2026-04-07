import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export enum PlayerEngine {
	GOOGLE_CAST = "google_cast",
	CARPLAY = "carplay",
	REACT_NATIVE_TRACK_PLAYER = "react_native_track_player",
}

type PlayerEngineStore = {
	playerEngineData: PlayerEngine
	setPlayerEngineData: (data: PlayerEngine) => void
}

const usePlayerEngineStore = create<PlayerEngineStore>()(
	devtools(
		persist(
			(set) => ({
				playerEngineData: PlayerEngine.REACT_NATIVE_TRACK_PLAYER,
				setPlayerEngineData: (data: PlayerEngine) => set({ playerEngineData: data }),
			}),
			{
				name: "player-engine-storage",
			},
		),
	),
)

export default usePlayerEngineStore
