# Cross-platform validation matrix (smoke)

Run on iOS simulator/device and Android emulator after shipping slices.

## Slice A — Search + Save + Share

| Step | iOS | Android |
|------|-----|---------|
| Search landing shows recent chips when history exists | | |
| Chip navigates to query with `q` | | |
| Save to playlist PATCH succeeds | | |
| Share copy / Instagram / More | | |

## Slice B — Player menu + Queue + Favorites

| Step | iOS | Android |
|------|-----|---------|
| Sermon sheet Like toggles store | | |
| Play next / Add to queue toasts | | |
| Full player heart matches store | | |
| Queue sheet Add opens search | | |

## Slice C — Library tail + downloads stub

| Step | iOS | Android |
|------|-----|---------|
| Download row shows info toast | | |
| Playlist modal uses current track id | | |

Recorder: name / date / commit SHA.
