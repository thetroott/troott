import type { ISermonTrack } from '@/api/dtos/sermon.dto';

export const tracks: Partial<ISermonTrack>[] = [
    {
        id: '001',
        sermon: require('@/assets/audio/building-your-circle-of-intigators.mp3'),
        title: 'Building your circle of intigators',
        minister: 'Jesudamilare Adesegun-David',
        duration: 3506,
        image: require('@/assets/images/building-your-circle-of-intigators.jpg'),
    },
    {
        id: '002',
        sermon: require('@/assets/audio/what-seekest-thou.mp3'),
        title: 'What seekest thou?',
        minister: 'Apostle Joshua Selman',
        duration: 1467,
        image: require('@/assets/images/what-seekest-thou.jpg'),
    },
    {
        id: '003',
        sermon: require('@/assets/audio/the-seeing-eyes.mp3'),
        title: 'The seeing eyes (Accessing the gift of sight))',
        minister: 'Apostle Joshua Selman',
        duration: 1167,
        image: require('@/assets/images/the-seeing-eyes.jpg'),
    },

    {
        id: '004',
        // Mock uses mp3: packaged .mp4s often fail ExoPlayer with generic "network" / source errors in dev
        sermon: require('@/assets/audio/what-seekest-thou.mp3'),
        title: 'How to ask God for anything in prayer',
        minister: 'Apostle Joshua Selman',
        duration: 60,
        image: require('@/assets/images/cover3.jpg'),
    },
    {
        id: '005',
        sermon: require('@/assets/audio/fishers-of-men.mp3'),
        title: 'Fishers of men',
        minister: 'Apostle Joshua Selman',
        duration: 1167,
        image: require('@/assets/images/fishers-of-men.jpg'),
    },
    {
        id: '006',
        sermon: require('@/assets/audio/seedtime-and-harvest.mp3'),
        title: 'Seedtime and harvest (Defining your tomorrow)',
        minister: 'Apostle Joshua Selman',
        duration: 1167,
        image: require('@/assets/images/seedtime-and-harvest.jpg'),
    },

    {
        id: '007',
        sermon: require('@/assets/audio/hacking-life-through-prayer.mp3'),
        title: 'Hacking life through prayer',
        minister: 'Jesudamilare Adesegun-David',
        duration: 1256,
        image: require('@/assets/images/hacking-life-through-prayer.jpg'),
    },

    {
        id: '008',
        sermon: require('@/assets/audio/hacking-life-through-prayer.mp3'),
        title: 'Motivation Quote',
        minister: 'Pst. Chris Oyakhilome',
        duration: 183,
        image: require('@/assets/images/cover.jpg'),
    },
    {
        id: '009',
        sermon: require('@/assets/audio/fishers-of-men.mp3'),
        title: 'Life is very short',
        minister: 'Billy Graham',
        duration: 266,
        image: require('@/assets/images/cover2.jpg'),
    },
    {
        id: '010',
        sermon: require('@/assets/audio/building-your-circle-of-intigators.mp3'),
        title: 'Building your circle of intigators',
        minister: 'Jesudamilare Adesegun-David',
        duration: 5506,
        image: require('@/assets/images/building-your-circle-of-intigators.jpg'),
    },
    {
        id: '011',
        sermon: require('@/assets/audio/mastering-language.mp3'),
        title: 'Mastering Language',
        minister: 'Jesudamilare Adesegun-David',
        duration: 4256,
        image: require('@/assets/images/mastering-language.jpg'),
    },
];
