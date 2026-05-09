# Route to action trace (full table)

Convention: **Route** is the Expo Router file path under `apps/mobile/app`. One row per primary user-visible control cluster; drill into linked components for nested actions.

Columns: **Route** | **Visible control** | **Component file** | **Handler / entry** | **Next state / outcome**

---

## Root and gates

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `index.tsx` | Create Account | `app/index.tsx` | `handleCreateAccount` -> `router.push('/enter-email')` | Auth email flow |
| `index.tsx` | Login | `app/index.tsx` | `handleLogin` -> `router.push('/home')` | Tabs home (dev shortcut) |
| `_layout.tsx` | (global) Mini player, share overlay | `app/_layout.tsx` | `MiniPlayer`, `ListenerSharingFlow` | Player modal / share steps |
| `_error.tsx` | Error UI | `app/_error.tsx` | framework | Retry / back per implementation |
| `_not-found.tsx` | Missing route | `app/_not-found.tsx` | framework | Navigate away |

---

## Tabs shell

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(tabs)/_layout.tsx` | Tab bar: Home, Search, Library, Profile | `components/features/navigation/tabbar.tsx` | React Navigation tab switch | Tab routes |
| `(tabs)/_layout.tsx` | Embedded full player (when modal not focused) | `app/sermon/[id].tsx` | `FullPlayerTrackDetails` | In-tab player shell |

---

## Tab: Home

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(tabs)/home/index.tsx` | Welcome, highlights, liked strip | `UserWelcome`, `UserHighlights`, `LikedByUser` | section CTAs | Linked stacks / lists |
| `(tabs)/home/index.tsx` | Sermons for you rows | `SermonsForYou` | row press | Playback / sermon route |
| `(tabs)/home/index.tsx` | More from minister | `MoreFromMinister` | cards | Minister / play |
| `(tabs)/home/index.tsx` | Trending playlists | `TrendingPlaylist` | cards | Playlist / play |
| `(tabs)/home/index.tsx` | Similar ministers | `SimilarMinisters` | cards | Minister profile |

---

## Tab: Search

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(tabs)/search/index.tsx` | Search field | `SearchQueryBarTrigger` | `router.push('/search/query')` | Query screen |
| `(tabs)/search/index.tsx` | Recent search chips | `RecentSearches` | `router.push({ pathname: '/search/query', params: { q } })` | Query with `q` |
| `(tabs)/search/index.tsx` | Recently added | `RecentlyAdded` | row actions | Playback |
| `(tabs)/search/index.tsx` | Browse topics | `BrowseTopicsGrid` | tile press | `topic/[slug]` |
| `(tabs)/search/query.tsx` | Query input, chips, history | `SearchQueryScreen` | `useCommittedSearchTerm`, `useSearchHistory` | Results / empty |
| `(tabs)/search/query.tsx` | Catalog results rows | `SearchCatalogResults` + `SermonCard` | `useLoadNewQueue`, sheet actions | Playback / playlist / share |
| `(tabs)/search/query.tsx` | Clear recents dialog | `ClearRecentSearchesDialog` | `clearAll` | MMKV cleared |
| `(tabs)/search/topic/[slug].tsx` | Topic sermons | route screen + list | navigation | Playback |

---

## Tab: Library

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(tabs)/library/index.tsx` | Category pills / subs | `library/index.tsx` | `setSelectedCategory`, `setSubCategories` | Filter body |
| `(tabs)/library/index.tsx` | Sort sheet | `BottomSheetModal` + `SortItem` | `setSortValue` | Reordered list |
| `(tabs)/library/index.tsx` | Grid/list toggle | header controls | `setDisplayStyle` | Layout |
| `(tabs)/library/index.tsx` | Smart cards / bodies | `LibraryAllSmartCards`, `Library*Category` | row/card press | Sermon play / navigations |
| `(tabs)/library/index.tsx` | Pull refresh | `RefreshControl` | `refetchLibrary`, `refetchPlaylists` | Fresh API data |

---

## Tab: Profile

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(tabs)/profile/index.tsx` | Profile surface | `user-profile-screen.tsx` | menu rows / CTAs | `user/*` modals, settings |

---

## Player and sermon

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `player/index.tsx` | Full player chrome | player stack | RNTP + controls | Play/pause, dismiss |
| `player/_layout.tsx` | Stack options | expo-router | — | Child screens |
| `sermon/[id].tsx` | Track details / actions | full-player components | `TrackActionsController`, etc. | Share, queue, like |
| `sermon/_layout.tsx` | Stack | expo-router | — | — |

---

## Playlist

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `playlist/[id].tsx` | Playlist detail | playlist screen | row play | Queue |
| `playlist/create-playlist.tsx` | Create form | create screen | submit | New playlist / back |
| `playlist/user-playlist-add-track.tsx` | Choose playlist modal | `PlaylistAddTrackContent` | `useAddSermonToPlaylistMutation` | PATCH add + confirmation |

---

## Minister

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `minister/[id].tsx` | Minister hub | minister layout | links | About / lists |
| `minister/[id]/about.tsx` | About + catalog | about screen | sermon rows | Playback |

---

## Series

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `series/[id].tsx` | Series sermons | series screen | row press | Playback |

---

## User (modal stack)

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `user/index.tsx` | Entry | `user/index.tsx` | navigation | Sub-screens |
| `user/edit-profile.tsx` | Form | profile edit | save | Profile updated |
| `user/edit-profile-saved.tsx` | Confirmation | screen | dismiss | Back |
| `user/photo-picker.tsx` | Picker | `profile-photo-picker-screen.tsx` | pick image | Avatar |
| `user/notifications.tsx` | Notifications list | screen | toggles / open | Settings |
| `user/about-troott.tsx` | Static / links | screen | links | External |
| `user/empty.tsx` | Empty state | screen | CTA | Recover |

---

## Auth

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(auth)/login.tsx` | Login form | login screen | auth API | Tabs or error |
| `(auth)/register.tsx` | Register | register screen | auth API | Verify / home |
| `(auth)/enter-email.tsx` | Email | screen | next step | OTP / register |
| `(auth)/verify-email.tsx` | OTP | screen | verify | Active session |
| `(auth)/request-password-otp.tsx` | Request OTP | screen | API | Reset flow |
| `(auth)/reset-password-otp-request.tsx` | OTP | screen | API | New password |
| `(auth)/reset-password.tsx` | New password | screen | API | Login |
| `(auth)/activate-user-account.tsx` | Activation | screen | API | Signed in |

---

## Onboarding

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(onboarding)/select-interests.tsx` | Interest tiles | screen | selection state | Next onboarding |
| `(onboarding)/select-ministers.tsx` | Minister picks | screen | confirm | Home / prefs |

---

## Pickers (modal)

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `(pickers)/pick-ministers.tsx` | Minister list | picker | select / confirm | Caller route |
| `(pickers)/choose-series.tsx` | Series list | picker | select | Caller route |

---

## See more

| Route | Visible control | Component file | Handler / entry | Next state |
|-------|-----------------|----------------|-----------------|------------|
| `see-more/similar-ministers.tsx` | Grid/list | screen | card press | Minister |
| `see-more/minister-seemore.tsx` | More ministers | screen | card press | Minister |
| `see-more/sermons-for-you.tsx` | Sermon list | screen | `SermonCard` / play | Playback |

---

## Bottom sheets / modals tied to actions (cross-route)

| Surface | Parent context | Component file | Trigger | Outcome |
|---------|----------------|----------------|---------|---------|
| Track actions sheet | Search list row | `sermon-card.tsx` | ellipsis | `getTrackListActions` |
| Add to playlist sheet | Stacked over actions | `add-to-playlist-bottom-sheet.tsx` | Save to playlist | PATCH add |
| Playback queue sheet | Full player | `track-actions-controller.tsx` | queue icon | Skip / Add -> search |
| Library sort sheet | Library tab | `library/index.tsx` | sort control | Sort option |
| Share overlay | Any `openShareFlow` | `_layout.tsx` + `ListenerSharingFlow` | Share menu | Copy / IG / native |

---

## Maintenance

When adding a route under `app/`, append a subsection here with at least: primary Pressables, owning component path, and navigation/API outcome.
