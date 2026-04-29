import React from 'react';

import { ProfilePublicScreen } from '@/components/features/profile';

export default function UserEmptyRoute() {
    return <ProfilePublicScreen showPlaylists={false} />;
}
