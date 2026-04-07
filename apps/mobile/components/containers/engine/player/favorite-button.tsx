
import React, { useCallback } from 'react'
import Icon from './icon'
import Animated, { BounceIn, FadeIn, FadeOut } from 'react-native-reanimated'

import { SermonItemDTO, SermonTrackDTO } from '@/dtos/sermon.dto'
import { ActivityIndicator, View } from 'react-native'
import { Pressable } from 'react-native'
import { useRemoveFavorite, useAddFavorite } from "@/hooks/player/use-favourites"
import { useIsFavorite } from "@/hooks/player/use-is-favorite"

interface FavoriteButtonProps {
	item: SermonTrackDTO
	onToggle?: () => void
}

export default function FavoriteButton({ item, onToggle }: FavoriteButtonProps): React.JSX.Element {
	const { data: isFavorite, isPending } = useIsFavorite(item.item)

	if (isPending) {
		return (
		  <View className="w-9 h-4 justify-center items-center">
			<ActivityIndicator size="small" color="#3B82F6" /> {/* Tailwind blue-500 */}
		  </View>
		)
	  }
	
	  return isFavorite ? (
		<RemoveFavoriteButton item={item} onToggle={onToggle} />
	  ) : (
		<AddFavoriteButton item={item} onToggle={onToggle} />
	  )
	}

	function AddFavoriteButton({ item, onToggle }: FavoriteButtonProps) {
		const { mutate, isPending } = useRemoveFavorite()
	  
		if (isPending) {
		  return (
			<View className="w-9 h-4 justify-center items-center">
			  <ActivityIndicator size="small" color="#3B82F6" />
			</View>
		  )
		}
	  
		return (
		  <Animated.View entering={BounceIn} exiting={FadeOut}>
			<Pressable onPress={() => mutate({ item, onToggle })} className="p-1">
			  <Icon name="heart" color="#3B82F6" /> {/* Tailwind blue-500 */}
			</Pressable>
		  </Animated.View>
		)
	  }
	  
	  function RemoveFavoriteButton({ item, onToggle }: FavoriteButtonProps) {
		const { mutate, isPending } = useAddFavorite()
	  
		if (isPending) {
		  return (
			<View className="w-9 h-4 justify-center items-center">
			  <ActivityIndicator size="small" color="#3B82F6" />
			</View>
		  )
		}
	  
		return (
		  <Animated.View entering={FadeIn} exiting={FadeOut}>
			<Pressable onPress={() => mutate({ item, onToggle })} className="p-1">
			  <Icon name="heart-outline" color="#3B82F6" />
			</Pressable>
		  </Animated.View>
		)
	  }