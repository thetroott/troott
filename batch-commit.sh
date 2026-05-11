#!/bin/bash
set -e
cd /Users/pro/Documents/ProjectPacepard/troott

# 1 -----------------------------------------------------------------------
git add apps/api/src/types/
git commit -m "$(cat <<'EOF'
chore(api): add shared types and enum definitions

Centralise DbModels, common enums, and shared type aliases into
a dedicated types/ directory.
EOF
)"

# 2 -----------------------------------------------------------------------
git add apps/api/src/utils/role.util.ts \
       apps/api/src/utils/sermon-access.util.ts \
       apps/api/src/utils/sermon-teaser.util.ts \
       apps/api/src/utils/user.http-error.util.ts \
       apps/api/src/utils/enums.util.ts \
       apps/api/src/utils/permission.util.ts \
       apps/api/src/utils/logger.util.ts \
       apps/api/src/modules/authentication/role/role.util.ts \
       apps/api/src/modules/core/sermon/sermon-access.util.ts \
       apps/api/src/modules/core/open/sermon-teaser.util.ts \
       apps/api/src/modules/users/user/user.http-error.util.ts \
       apps/api/src/modules/users/user/user.staff.util.ts \
       apps/api/src/modules/authentication/permission/permission.util.ts \
       apps/api/src/modules/core/preference/preference.util.ts \
       apps/api/src/modules/core/preference/preference.merge.ts \
       apps/api/src/modules/core/processes/audio-processing.ts
git commit -m "$(cat <<'EOF'
refactor(api): relocate utility modules to flat utils directory

Move role, sermon-access, sermon-teaser, and user HTTP error utilities
out of nested module folders. Update remaining util imports.
EOF
)"

# 3 -----------------------------------------------------------------------
git add apps/api/src/interfaces/common.interface.ts \
       apps/api/src/modules/shared/interfaces.util.ts \
       apps/api/src/modules/shared/card.interface.ts \
       apps/api/src/modules/shared/nullable.ts \
       apps/api/src/modules/shared/db-models.enum.ts \
       apps/api/src/modules/shared/file.enums.ts
git commit -m "$(cat <<'EOF'
docs(api): add common.interface.ts with full JSDoc

Consolidate shared types (Upload, IDebitCard, ICountry, IAPIKey, config
interfaces, IResult, IPagination) into a single documented file.
EOF
)"

# 4 -----------------------------------------------------------------------
git add apps/api/src/interfaces/user.interface.ts \
       apps/api/src/interfaces/admin.interface.ts \
       apps/api/src/modules/users/user/user.interface.ts \
       apps/api/src/modules/users/admin/admin.interface.ts \
       apps/api/src/modules/users/admin/admin.enums.ts
git commit -m "$(cat <<'EOF'
docs(api): add user and admin interfaces with JSDoc

Document IUserDoc and IAdminDoc with field-level annotations covering
auth state, onboarding, RBAC, and social login.
EOF
)"

# 5 -----------------------------------------------------------------------
git add apps/api/src/interfaces/listener.interface.ts \
       apps/api/src/interfaces/minister.interface.ts \
       apps/api/src/interfaces/creator.interface.ts \
       apps/api/src/modules/users/listener/listener.interface.ts \
       apps/api/src/modules/users/minister/minister.interface.ts \
       apps/api/src/modules/users/creator/creator.interface.ts
git commit -m "$(cat <<'EOF'
docs(api): add listener, minister, and creator interfaces with JSDoc

Document consumer and producer profile shapes including verification
flow, engagement data, and onboarding state.
EOF
)"

# 6 -----------------------------------------------------------------------
git add apps/api/src/interfaces/sermon.interface.ts \
       apps/api/src/interfaces/series.interface.ts \
       apps/api/src/modules/core/sermon/sermon.interface.ts \
       apps/api/src/modules/core/series/series.interface.ts \
       apps/api/src/modules/core/sermon/sermon.enums.ts
git commit -m "$(cat <<'EOF'
docs(api): add sermon and series interfaces with JSDoc

Document ISermonDoc (delivery, upload, publishing, engagement) and
ISeriesDoc with all streaming protocol and media status enums.
EOF
)"

# 7 -----------------------------------------------------------------------
git add apps/api/src/interfaces/playlist.interface.ts \
       apps/api/src/interfaces/library.interface.ts \
       apps/api/src/interfaces/topic.interface.ts \
       apps/api/src/interfaces/comment.interface.ts \
       apps/api/src/modules/core/playlist/playlist.interface.ts \
       apps/api/src/modules/core/playlist/playlist.enums.ts \
       apps/api/src/modules/core/library/library.interface.ts
git commit -m "$(cat <<'EOF'
docs(api): add playlist, library, topic, and comment interfaces

Document collection types with ownership, collaboration, engagement,
and the unified LibraryItem polymorphic entry shape.
EOF
)"

# 8 -----------------------------------------------------------------------
git add apps/api/src/interfaces/playback.interface.ts \
       apps/api/src/interfaces/playback-session.interface.ts \
       apps/api/src/interfaces/queue.interface.ts \
       apps/api/src/modules/core/playback/playback.interface.ts
git commit -m "$(cat <<'EOF'
docs(api): add playback, session, and queue interfaces with JSDoc

Document the three playback concerns: event recording (IPlaybackDoc),
long-lived session (IPlaybackSessionDoc), and queue management
(IQueueDoc) with all device/network/skip enums.
EOF
)"

# 9 -----------------------------------------------------------------------
git add apps/api/src/interfaces/plan.interface.ts \
       apps/api/src/interfaces/subscription.interface.ts \
       apps/api/src/interfaces/subscriptionIntent.interface.ts \
       apps/api/src/interfaces/transaction.interface.ts \
       apps/api/src/interfaces/payments.interface.ts \
       apps/api/src/modules/payments/plan/plan.interface.ts \
       apps/api/src/modules/payments/subscription/subscription.interface.ts \
       "apps/api/src/modules/payments/subscription/subscription intent/subscriptionIntent.interface.ts" \
       apps/api/src/modules/payments/transaction/transaction.interface.ts \
       apps/api/src/modules/payments/paystack/paystack.interface.ts \
       apps/api/src/modules/payments/payments.enums.ts
git commit -m "$(cat <<'EOF'
docs(api): add payment and subscription interfaces with JSDoc

Document plan pricing, subscription lifecycle, transaction types,
subscription intent state machine, and Paystack DTOs.
EOF
)"

# 10 ----------------------------------------------------------------------
git add apps/api/src/interfaces/role.interface.ts \
       apps/api/src/interfaces/permission.interface.ts \
       apps/api/src/interfaces/invitation.interface.ts \
       apps/api/src/interfaces/shareable-link.interface.ts \
       apps/api/src/modules/authentication/role/role.interface.ts \
       apps/api/src/modules/authentication/permission/permission.interface.ts \
       apps/api/src/modules/platform/Invitation/invitation.interface.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.interface.ts \
       apps/api/src/modules/platform/apikey/apikey.interface.ts \
       apps/api/src/modules/platform/apikey/apikey.enums.ts \
       apps/api/src/modules/platform/referral/referral.interface.ts \
       apps/api/src/modules/notifications/push/push-device.interface.ts \
       apps/api/src/modules/notifications/push/push.interface.ts \
       apps/api/src/modules/core/preference/preference.interface.ts
git commit -m "$(cat <<'EOF'
docs(api): add role, permission, invitation, and shareable-link interfaces

Document RBAC, invitation lifecycle, and token-secured shareable
links with field-level JSDoc annotations.
EOF
)"

# 11 ----------------------------------------------------------------------
git add apps/api/src/models/user.model.ts \
       apps/api/src/models/admin.model.ts \
       apps/api/src/modules/users/user/user.model.ts \
       apps/api/src/modules/users/admin/admin.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move user and admin models to flat structure

Align schemas with new IUserDoc and IAdminDoc interfaces.
EOF
)"

# 12 ----------------------------------------------------------------------
git add apps/api/src/models/listener.model.ts \
       apps/api/src/models/minister.model.ts \
       apps/api/src/models/creator.model.ts \
       apps/api/src/modules/users/listener/listener.model.ts \
       apps/api/src/modules/users/minister/minister.model.ts \
       apps/api/src/modules/users/creator/creator.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move listener, minister, and creator models

Restructure schemas into nested profile/onboarding/verification
subdocuments to match the updated interfaces.
EOF
)"

# 13 ----------------------------------------------------------------------
git add apps/api/src/models/sermon.model.ts \
       apps/api/src/models/series.model.ts \
       apps/api/src/modules/core/sermon/sermon.model.ts \
       apps/api/src/modules/core/series/series.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move sermon and series models to flat structure

Add streaming, engagement, and publishing fields to match interfaces.
EOF
)"

# 14 ----------------------------------------------------------------------
git add apps/api/src/models/playlist.model.ts \
       apps/api/src/models/library.model.ts \
       apps/api/src/modules/core/playlist/playlist.model.ts \
       apps/api/src/modules/core/library/library.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move playlist and library models to flat structure

Restructure playlist items and library entries to match interface shapes.
EOF
)"

# 15 ----------------------------------------------------------------------
git add apps/api/src/models/playback.model.ts \
       apps/api/src/modules/core/playback/playback.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move and rebuild playback model

Expand schema from simple progress tracker to full IPlaybackDoc with
device info, interaction counts, and completion metrics.
EOF
)"

# 16 ----------------------------------------------------------------------
git add apps/api/src/models/playback-session.model.ts \
       apps/api/src/models/queue.model.ts \
       apps/api/src/models/topic.model.ts
git commit -m "$(cat <<'EOF'
feat(api): add playback-session, queue, and topic models

New Mongoose models for long-lived playback sessions, ordered media
queues, and the topic/category taxonomy.
EOF
)"

# 17 ----------------------------------------------------------------------
git add apps/api/src/models/plan.model.ts \
       apps/api/src/models/subscription.model.ts \
       apps/api/src/models/subscriptionIntent.model.ts \
       apps/api/src/models/transaction.model.ts \
       apps/api/src/modules/payments/plan/plan.model.ts \
       apps/api/src/modules/payments/subscription/subscription.model.ts \
       "apps/api/src/modules/payments/subscription/subscription intent/subscriptionIntent.model.ts" \
       apps/api/src/modules/payments/transaction/transaction.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move payment models to flat structure

Align plan, subscription, subscriptionIntent, and transaction schemas
with their updated interface definitions.
EOF
)"

# 18 ----------------------------------------------------------------------
git add apps/api/src/models/role.model.ts \
       apps/api/src/models/permission.model.ts \
       apps/api/src/models/invitation.model.ts \
       apps/api/src/models/shareable-link.model.ts \
       apps/api/src/models/apikey.model.ts \
       apps/api/src/models/preference.model.ts \
       apps/api/src/models/push-device.model.ts \
       apps/api/src/modules/authentication/role/role.model.ts \
       apps/api/src/modules/authentication/permission/permission.model.ts \
       apps/api/src/modules/platform/Invitation/invitation.model.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.model.ts \
       apps/api/src/modules/platform/apikey/apikey.model.ts \
       apps/api/src/modules/core/preference/preference.model.ts \
       apps/api/src/modules/notifications/push/push-device.model.ts
git commit -m "$(cat <<'EOF'
refactor(api): move platform models to flat structure

Relocate role, permission, invitation, shareable-link, apikey,
preference, and push-device models with updated imports.
EOF
)"

# 19 ----------------------------------------------------------------------
git add apps/api/src/controllers/user.controller.ts \
       apps/api/src/controllers/admin.controller.ts \
       apps/api/src/controllers/listener.controller.ts \
       apps/api/src/controllers/minister.controller.ts \
       apps/api/src/controllers/creator.controller.ts \
       apps/api/src/controllers/profile.controller.ts \
       apps/api/src/modules/users/user/user.controller.ts \
       apps/api/src/modules/users/admin/admin.controller.ts \
       apps/api/src/modules/users/listener/listener.controller.ts \
       apps/api/src/modules/users/minister/minister.controller.ts \
       apps/api/src/modules/users/creator/creator.controller.ts \
       apps/api/src/modules/users/profile/profile.controller.ts
git commit -m "$(cat <<'EOF'
refactor(api): move user controllers to flat structure
EOF
)"

# 20 ----------------------------------------------------------------------
git add apps/api/src/controllers/auth.controller.ts \
       apps/api/src/controllers/role.controller.ts \
       apps/api/src/controllers/permission.controller.ts \
       apps/api/src/controllers/sermon.controller.ts \
       apps/api/src/controllers/search.controller.ts \
       apps/api/src/controllers/discovery.controller.ts \
       apps/api/src/controllers/library.controller.ts \
       apps/api/src/controllers/playlist.controller.ts \
       apps/api/src/controllers/playback.controller.ts \
       apps/api/src/controllers/preference.controller.ts \
       apps/api/src/controllers/open.controller.ts \
       apps/api/src/modules/authentication/auth/auth.controller.ts \
       apps/api/src/modules/authentication/role/role.controller.ts \
       apps/api/src/modules/authentication/permission/permission.controller.ts \
       apps/api/src/modules/core/sermon/sermon.controller.ts \
       apps/api/src/modules/core/search/search.controller.ts \
       apps/api/src/modules/core/discovery/discovery.controller.ts \
       apps/api/src/modules/core/library/library.controller.ts \
       apps/api/src/modules/core/playlist/playlist.controller.ts \
       apps/api/src/modules/core/playback/playback.controller.ts \
       apps/api/src/modules/core/preference/preference.controller.ts \
       apps/api/src/modules/core/open/open.controller.ts
git commit -m "$(cat <<'EOF'
refactor(api): move auth and content controllers to flat structure
EOF
)"

# 21 ----------------------------------------------------------------------
git add apps/api/src/controllers/plan.controller.ts \
       apps/api/src/controllers/subscription.controller.ts \
       apps/api/src/controllers/transaction.controller.ts \
       apps/api/src/controllers/invitation.controller.ts \
       apps/api/src/controllers/storage.controller.ts \
       apps/api/src/controllers/shareable-link.controller.ts \
       apps/api/src/controllers/push-device.controller.ts \
       apps/api/src/controllers/system.controller.ts \
       apps/api/src/controllers/referral.controller.ts \
       apps/api/src/modules/payments/plan/plan.controller.ts \
       apps/api/src/modules/payments/subscription/subscription.controller.ts \
       apps/api/src/modules/payments/transaction/transaction.controller.ts \
       apps/api/src/modules/platform/Invitation/invitation.controller.ts \
       apps/api/src/modules/platform/storage/storage.controller.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.controller.ts \
       apps/api/src/modules/notifications/push/push-device.controller.ts \
       apps/api/src/modules/internals/system/system.controller.ts \
       apps/api/src/modules/platform/referral/referral.controller.ts
git commit -m "$(cat <<'EOF'
refactor(api): move payment and platform controllers to flat structure
EOF
)"

# 22 ----------------------------------------------------------------------
git add apps/api/src/dtos/admin.dto.ts \
       apps/api/src/dtos/auth.dto.ts \
       apps/api/src/dtos/billing.dto.ts \
       apps/api/src/dtos/creator.dto.ts \
       apps/api/src/dtos/email.dto.ts \
       apps/api/src/dtos/invitation.dto.ts \
       apps/api/src/dtos/listener.dto.ts \
       apps/api/src/dtos/minister.dto.ts \
       apps/api/src/dtos/paystack.dto.ts \
       apps/api/src/dtos/plan.dto.ts \
       apps/api/src/dtos/preference.dto.ts \
       apps/api/src/dtos/profile.dto.ts \
       apps/api/src/dtos/queue.dto.ts \
       apps/api/src/dtos/role.dto.ts \
       apps/api/src/dtos/sendgrid.dto.ts \
       apps/api/src/dtos/series.dto.ts \
       apps/api/src/dtos/sermon.dto.ts \
       apps/api/src/dtos/shareable-link.dto.ts \
       apps/api/src/dtos/storage.dto.ts \
       apps/api/src/dtos/subscription.dto.ts \
       apps/api/src/dtos/system.dto.ts \
       apps/api/src/dtos/transaction.dto.ts \
       apps/api/src/dtos/user.dto.ts \
       apps/api/src/modules/users/admin/admin.dto.ts \
       apps/api/src/modules/authentication/auth/auth.dto.ts \
       apps/api/src/modules/payments/billing/billing.dto.ts \
       apps/api/src/modules/users/creator/creator.dto.ts \
       apps/api/src/modules/notifications/email/email.dto.ts \
       apps/api/src/modules/platform/Invitation/invitation.dto.ts \
       apps/api/src/modules/users/listener/listener.dto.ts \
       apps/api/src/modules/users/minister/minister.dto.ts \
       apps/api/src/modules/payments/paystack/paystack.dto.ts \
       apps/api/src/modules/payments/plan/plan.dto.ts \
       apps/api/src/modules/core/preference/preference.dto.ts \
       apps/api/src/modules/users/profile/profile.dto.ts \
       apps/api/src/queues/queue.dto.ts \
       apps/api/src/modules/authentication/role/role.dto.ts \
       apps/api/src/modules/notifications/email/sendgrid.dto.ts \
       apps/api/src/modules/core/series/series.dto.ts \
       apps/api/src/modules/core/sermon/sermon.dto.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.dto.ts \
       apps/api/src/modules/platform/storage/storage.dto.ts \
       apps/api/src/modules/payments/subscription/subscription.dto.ts \
       apps/api/src/modules/internals/system/system.dto.ts \
       apps/api/src/modules/payments/transaction/transaction.dto.ts \
       apps/api/src/modules/users/user/user.dto.ts
git commit -m "$(cat <<'EOF'
refactor(api): move DTOs to flat structure
EOF
)"

# 23 ----------------------------------------------------------------------
git add apps/api/src/dtos/playback.dto.ts
git commit -m "$(cat <<'EOF'
docs(api): add playback DTOs with full JSDoc

Add StartSessionDTO, UpdateSessionDTO, TransferSessionDTO,
SessionResponseDTO, RecordPlaybackDTO, PlaybackEventResponseDTO,
PlaybackMediaItemDTO, and PlaybackHistory DTOs with documentation.
EOF
)"

# 24 ----------------------------------------------------------------------
git add apps/api/src/mappers/auth.mapper.ts \
       apps/api/src/mappers/preference.mapper.ts \
       apps/api/src/mappers/profile.mapper.ts \
       apps/api/src/mappers/series.mapper.ts \
       apps/api/src/mappers/sermon.mapper.ts \
       apps/api/src/mappers/user.mapper.ts \
       apps/api/src/modules/authentication/auth/auth.mapper.ts \
       apps/api/src/modules/core/preference/preference.mapper.ts \
       apps/api/src/modules/users/profile/profile.mapper.ts \
       apps/api/src/modules/core/series/series.mapper.ts \
       apps/api/src/modules/core/sermon/sermon.mapper.ts \
       apps/api/src/modules/users/user/user.mapper.ts
git commit -m "$(cat <<'EOF'
refactor(api): move mappers to flat structure
EOF
)"

# 25 ----------------------------------------------------------------------
git add apps/api/src/repository/admin.repository.ts \
       apps/api/src/repository/creator.repository.ts \
       apps/api/src/repository/invitation.repository.ts \
       apps/api/src/repository/library.repository.ts \
       apps/api/src/repository/listener.repository.ts \
       apps/api/src/repository/minister.repository.ts \
       apps/api/src/repository/plan.repository.ts \
       apps/api/src/repository/playback.repository.ts \
       apps/api/src/repository/playlist.repository.ts \
       apps/api/src/repository/preference.repository.ts \
       apps/api/src/repository/push-device.repository.ts \
       apps/api/src/repository/role.repository.ts \
       apps/api/src/repository/series.repository.ts \
       apps/api/src/repository/sermon.repository.ts \
       apps/api/src/repository/shareable-link.repository.ts \
       apps/api/src/repository/subscription.repository.ts \
       apps/api/src/repository/transaction.repository.ts \
       apps/api/src/repository/user.repository.ts \
       apps/api/src/modules/users/admin/admin.repository.ts \
       apps/api/src/modules/users/creator/creator.repository.ts \
       apps/api/src/modules/platform/Invitation/invitation.repository.ts \
       apps/api/src/modules/core/library/library.repository.ts \
       apps/api/src/modules/users/listener/listener.repository.ts \
       apps/api/src/modules/users/minister/minister.repository.ts \
       apps/api/src/modules/payments/plan/plan.repository.ts \
       apps/api/src/modules/core/playback/playback.repository.ts \
       apps/api/src/modules/core/playlist/playlist.repository.ts \
       apps/api/src/modules/core/preference/preference.repository.ts \
       apps/api/src/modules/notifications/push/push-device.repository.ts \
       apps/api/src/modules/authentication/role/role.repository.ts \
       apps/api/src/modules/core/series/series.repository.ts \
       apps/api/src/modules/core/sermon/sermon.repository.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.repository.ts \
       apps/api/src/modules/payments/subscription/subscription.repository.ts \
       apps/api/src/modules/payments/transaction/transaction.repository.ts \
       apps/api/src/modules/users/user/user.repository.ts
git commit -m "$(cat <<'EOF'
refactor(api): move repositories to flat structure
EOF
)"

# 26 ----------------------------------------------------------------------
git add apps/api/src/routes/ \
       apps/api/src/modules/authentication/auth/auth.router.ts \
       apps/api/src/modules/users/creator/creator.router.ts \
       apps/api/src/modules/core/discovery/discovery.router.ts \
       apps/api/src/modules/platform/Invitation/invitation.router.ts \
       apps/api/src/modules/core/library/library.router.ts \
       apps/api/src/modules/users/listener/listener.router.ts \
       apps/api/src/modules/users/minister/minister.router.ts \
       apps/api/src/modules/core/open/open.router.ts \
       apps/api/src/modules/payments/plan/plan.routes.ts \
       apps/api/src/modules/core/playback/playback.router.ts \
       apps/api/src/modules/core/playlist/playlist.router.ts \
       apps/api/src/modules/core/preference/preference.router.ts \
       apps/api/src/modules/users/profile/profile.router.ts \
       apps/api/src/modules/notifications/push/push-device.router.ts \
       apps/api/src/modules/authentication/role/role.router.ts \
       apps/api/src/modules/core/search/search.router.ts \
       apps/api/src/modules/core/sermon/sermon.router.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.router.ts \
       apps/api/src/modules/platform/storage/storage.router.ts \
       apps/api/src/modules/payments/subscription/subscription.routes.ts \
       apps/api/src/modules/users/user/user.router.ts \
       apps/api/src/modules/platform/webhook/webhook.router.ts \
       apps/api/src/modules/users/admin/admin.route.ts
git commit -m "$(cat <<'EOF'
refactor(api): move routes to flat structure and update registry

Relocate all router files and update v1/routes.router.ts imports
to use @/routes/ paths.
EOF
)"

# 27 ----------------------------------------------------------------------
git add apps/api/src/services/user.service.ts \
       apps/api/src/services/auth.service.ts \
       apps/api/src/services/admin.service.ts \
       apps/api/src/services/listener.service.ts \
       apps/api/src/services/minister.service.ts \
       apps/api/src/services/creator.service.ts \
       apps/api/src/services/profile.service.ts \
       apps/api/src/services/role.service.ts \
       apps/api/src/services/permission.service.ts \
       apps/api/src/services/token.service.ts \
       apps/api/src/modules/users/user/user.service.ts \
       apps/api/src/modules/authentication/auth/auth.service.ts \
       apps/api/src/modules/users/admin/admin.service.ts \
       apps/api/src/modules/users/listener/listener.service.ts \
       apps/api/src/modules/users/minister/minister.service.ts \
       apps/api/src/modules/users/creator/creator.service.ts \
       apps/api/src/modules/users/profile/profile.service.ts \
       apps/api/src/modules/authentication/role/role.service.ts \
       apps/api/src/modules/authentication/permission/permission.service.ts \
       apps/api/src/modules/internals/token/token.service.ts
git commit -m "$(cat <<'EOF'
refactor(api): move user and auth services to flat structure
EOF
)"

# 28 ----------------------------------------------------------------------
git add apps/api/src/services/sermon.service.ts \
       apps/api/src/services/discovery.service.ts \
       apps/api/src/services/preference.service.ts \
       apps/api/src/services/email.service.ts \
       apps/api/src/services/cache.service.ts \
       apps/api/src/services/scheduler.service.ts \
       apps/api/src/services/invitation.service.ts \
       apps/api/src/services/shareable-link.service.ts \
       apps/api/src/services/storage.service.ts \
       apps/api/src/services/audio.service.ts \
       apps/api/src/services/system.service.ts \
       apps/api/src/services/repository.service.ts \
       apps/api/src/modules/core/sermon/sermon.service.ts \
       apps/api/src/modules/core/discovery/discovery.service.ts \
       apps/api/src/modules/core/preference/preference.service.ts \
       apps/api/src/modules/notifications/email/email.service.ts \
       apps/api/src/modules/platform/cache/cache.service.ts \
       apps/api/src/modules/internals/scheduler/scheduler.service.ts \
       apps/api/src/modules/platform/Invitation/invitation.service.ts \
       apps/api/src/modules/platform/shareable-link/shareable-link.service.ts \
       apps/api/src/modules/platform/storage/storage.service.ts \
       apps/api/src/modules/internals/system/system.service.ts \
       apps/api/src/modules/internals/repository/repository.service.ts
git commit -m "$(cat <<'EOF'
refactor(api): move content and platform services to flat structure
EOF
)"

# 29 ----------------------------------------------------------------------
git add apps/api/src/services/plan.service.ts \
       apps/api/src/services/subscription.service.ts \
       apps/api/src/services/subscriptionIntent.service.ts \
       apps/api/src/services/transaction.service.ts \
       apps/api/src/services/paystack.service.ts \
       apps/api/src/modules/payments/plan/plan.service.ts \
       apps/api/src/modules/payments/subscription/subscription.service.ts \
       "apps/api/src/modules/payments/subscription/subscription intent/subscriptionIntent.service.ts" \
       apps/api/src/modules/payments/transaction/transaction.service.ts \
       apps/api/src/modules/payments/paystack/paystack.service.ts
git commit -m "$(cat <<'EOF'
refactor(api): move payment services to flat structure
EOF
)"

# 30 ----------------------------------------------------------------------
git add -A
git commit -m "$(cat <<'EOF'
chore(api): update configs, middlewares, tasks, tests, and cleanup

Update import paths in seed files, middleware, task workers/schedulers,
queue processors, and test helpers. Remove deprecated module markdown
docs and empty module directories.
EOF
)"

echo "All 30 commits completed successfully."
