export type HeadlineSegment =
    | { type: 'text'; value: string }
    | {
          type: 'image';
          src: string;
          alt: string;
          width?: number;
          height?: number;
      }
    | { type: 'emoji'; value: string };

export type AudienceStoryContent = {
    id: 'audience-story';
    headline: HeadlineSegment[];
    subtext: string;
    audienceTags: string[];
};

export const audienceStoryContent: AudienceStoryContent = {
    id: 'audience-story',
    headline: [
        { type: 'text', value: 'Stay rooted in ' },
        {
            type: 'image',
            src: '/images/troott-mobile-app.png',
            alt: 'Listener using Troott on mobile',
            width: 112,
            height: 48,
        },
        {
            type: 'text',
            value:
                ' sermons with an app that keeps your ministers, playlists, ',
        },
        { type: 'emoji', value: '🎧' },
        { type: 'text', value: ' and daily listening simple to follow.' },
    ],
    subtext: "Used by listeners to grow in God's Word.",
    audienceTags: ['#Listeners', '#Students', '#Families', '#Small groups'],
};
