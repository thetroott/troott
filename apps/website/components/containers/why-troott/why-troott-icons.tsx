import {
    RiBuildingLine,
    RiHeadphoneLine,
    RiShareForwardLine,
    RiUploadCloud2Line,
} from '@remixicon/react';
import type { RemixiconComponentType } from '@remixicon/react';

import type { WhyTroottIconId } from '@/_data/troott/why-troott';

export const whyTroottIcons: Record<
    WhyTroottIconId,
    RemixiconComponentType
> = {
    headphone: RiHeadphoneLine,
    upload: RiUploadCloud2Line,
    share: RiShareForwardLine,
    building: RiBuildingLine,
};
