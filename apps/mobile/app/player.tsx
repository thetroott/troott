import { Redirect } from "expo-router";

/** Alias for the full-player modal (`/track`). */
export default function PlayerRouteAlias() {
	return <Redirect href="/track" />;
}
