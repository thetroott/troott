import type { IUserPreferencesDoc } from './preference.interface';
import type { PreferenceResponseData } from './preference.dto';

class PreferenceMapper {
    public toResponse(doc: IUserPreferencesDoc): PreferenceResponseData {
        const tasteComplete =
            doc.taste.favoriteTopics.length > 0 ||
            doc.taste.favoriteMinisters.length > 0;
        const listenerTasteOnboardingComplete =
            doc.taste.favoriteTopics.length > 0 &&
            doc.taste.favoriteMinisters.length > 0;
        return {
            userId: doc.user.toString(),
            schemaVersion: doc.schemaVersion,
            taste: {
                favoriteTopics: [...doc.taste.favoriteTopics],
                favoriteMinisters: doc.taste.favoriteMinisters.map((id) =>
                    id.toString(),
                ),
            },
            notifications: { ...doc.notifications },
            playback: { ...(doc.playback as Record<string, unknown>) },
            downloads: { ...(doc.downloads as Record<string, unknown>) },
            privacy: { ...(doc.privacy as Record<string, unknown>) },
            tasteComplete,
            listenerTasteOnboardingComplete,
        };
    }
}

export default new PreferenceMapper();
