import sermonsData from '@/_data/sermon.json';
import { ISermonTrack } from '@/api/dtos/sermon.dto';

/**
 * @name loadSermons
 * @description Loads and transforms sermon data into a format compatible with `react-native-track-player`.
 * This function now dynamically loads assets to avoid blocking the app's UI thread on startup.
 * @returns {Promise<ISermonTrack[]>} A promise that resolves to an array of `ISermonTrack` objects.
 */
export async function loadSermons(): Promise<ISermonTrack[]> {
    console.log('loadSermons: Function called');
    console.log('loadSermons: Sermon data length:', sermonsData.length);

    // Statically import all audio assets within the function to avoid blocking the global scope.
    const sermonAudio = {
        'building-your-circle-of-intigators.mp3': require(
            `@/assets/audio/building-your-circle-of-intigators.mp3`,
        ),
        'what-seekest-thou.mp3': require(
            `@/assets/audio/what-seekest-thou.mp3`,
        ),
        'the-seeing-eyes.mp3': require(`@/assets/audio/the-seeing-eyes.mp3`),
        'how_to_ask_god_for_anything_in_prayer_apostle_joshua_selman_apostlejoshuaselman_motivation_pray_aac_58818.mp4': require(
            `@/assets/audio/how_to_ask_god_for_anything_in_prayer_apostle_joshua_selman_apostlejoshuaselman_motivation_pray_aac_58818.mp4`,
        ),
        'fishers-of-men.mp3': require(`@/assets/audio/fishers-of-men.mp3`),
        'seedtime-and-harvest.mp3': require(
            `@/assets/audio/seedtime-and-harvest.mp3`,
        ),
        'hacking-life-through-prayer.mp3': require(
            `@/assets/audio/hacking-life-through-prayer.mp3`,
        ),
        'it_doesn_39_t_matter_what_you_are_going_through_motivational_pastor_chris_aac_58743.mp4': require(
            `@/assets/audio/it_doesn_39_t_matter_what_you_are_going_through_motivational_pastor_chris_aac_58743.mp4`,
        ),
        'life_is_short_live_every_day_for_god_billy_graham_inspirational_amp_motivational_video_aac_58991.mp4': require(
            `@/assets/audio/life_is_short_live_every_day_for_god_billy_graham_inspirational_amp_motivational_video_aac_58991.mp4`,
        ),
        'mastering-language.mp3': require(
            `@/assets/audio/mastering-language.mp3`,
        ),
    };

    // Statically import all image assets within the function.
    const sermonImages = {
        'building-your-circle-of-intigators.jpg': require(
            `@/assets/images/building-your-circle-of-intigators.jpg`,
        ),
        'what-seekest-thou.jpg': require(
            `@/assets/images/what-seekest-thou.jpg`,
        ),
        'the-seeing-eyes.jpg': require(`@/assets/images/the-seeing-eyes.jpg`),
        'cover3.jpg': require(`@/assets/images/cover3.jpg`),
        'fishers-of-men.jpg': require(`@/assets/images/fishers-of-men.jpg`),
        'seedtime-and-harvest.jpg': require(
            `@/assets/images/seedtime-and-harvest.jpg`,
        ),
        'hacking-life-through-prayer.jpg': require(
            `@/assets/images/hacking-life-through-prayer.jpg`,
        ),
        'cover.jpg': require(`@/assets/images/cover.jpg`),
        'cover2.jpg': require(`@/assets/images/cover2.jpg`),
        'mastering-language.jpg': require(
            `@/assets/images/mastering-language.jpg`,
        ),
    };

    const tracks: ISermonTrack[] = sermonsData.map((data) => {
        const audioKey = data.sermon.split('/').pop() ?? '';
        const audioFromMap = sermonAudio[audioKey as keyof typeof sermonAudio];
        const imageKey = data.image.split('/').pop() ?? '';
        const imageFromMap =
            sermonImages[imageKey as keyof typeof sermonImages];
        if (audioFromMap == null) {
            console.warn(
                '[loadSermons] no bundled audio for file',
                audioKey,
                'id',
                data.id,
                '— using what-seekest-thou.mp3',
            );
        }
        if (imageFromMap == null) {
            console.warn(
                '[loadSermons] no bundled image for file',
                imageKey,
                'id',
                data.id,
            );
        }
        const audioModule =
            audioFromMap ?? sermonAudio['what-seekest-thou.mp3'];
        const imageModule =
            imageFromMap ?? sermonImages['what-seekest-thou.jpg'];
        return {
            // These are the REQUIRED keys for native player functionality
            id: data.id,
            sourceType: 'stream',
            url: audioModule,
            /** Same as `url` — mocks use `sermon`; keeps {@link catalogRowToSermonItem} consistent. */
            sermon: audioModule,
            title: data.title,
            artist: data.minister,
            minister: data.minister,
            duration: data.duration,
            artwork: imageModule,
            description: data.description,
            genre: data.topic,
            date: data.releaseDate,

            // These are your custom properties for use in your UI
            topic: data.topic,
            tags: data.tags,
            isSeries: data.isSeries,
            size: data.size,
            releaseYear: data.releaseYear,
        };
    });

    console.log('loadSermons: Tracks mapped, count:', tracks.length);
    console.log('loadSermons: First track sample:', tracks[0]);

    return tracks;
}
