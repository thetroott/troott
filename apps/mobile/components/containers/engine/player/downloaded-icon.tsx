

import Icon from './icon'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { memo } from 'react'

import { SermonItemDTO } from '@/dtos/sermon.dto'
import auth from '@/api/auth'
import { Separator } from '@/components/ui/separator'

function DownloadedIcon({ item }: { item: SermonItemDTO }) {
	const isDownloaded = auth
	
	//useIsDownloaded([item.id])

	return isDownloaded ? (
		<Animated.View entering={FadeIn} exiting={FadeOut}>
			<Icon small name='download-circle' color={'$success'} flex={1} />
		</Animated.View>
	) : (
		<Separator className='flex-1' />
	)
}

// Memoize the component to prevent unnecessary re-renders
export default memo(DownloadedIcon, (prevProps, nextProps) => {
	// Only re-render if the item ID changes
	return prevProps.item.id === nextProps.item.id
})
