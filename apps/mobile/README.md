## Troott ( Client-side: mobile )

### Stream unlimited sermons and Christian content on the go

> **Troott** provides audio streaming services worldwide, with a premium subscription offering and free ad-supported plan. The Premium segment offers unlimited online and offline streaming access to its catalogue of sermon, and sermon reels without commercial break.

With troott, users can listen to old and new sermons from their favorite ministers, gain control over how they listen to sermons and messages, and share sermons with the people they love!

## Introduction

Christian content lovers often struggle to:

- Access messages from their favorite ministers.
- Discover old sermons without knowing exact titles.
- Organize downloaded sermon files on their devices.

Troott solves these problems with a clean, mobile-first interface that provides:

- Powerful sermon search and discovery.
- Offline streaming options.
- Playlist-style sermon management.
- Quick sharing tools for a shared spiritual experience.

We’re answering key questions to improve user experience:

- How can users find and listen to sermons effortlessly on the go?
- How do we help users stay organized and avoid local storage clutter?
- How can sermons empower users to improve their spiritual lifestyle?
- How can we make sharing sermons as easy as sending a voice note?

## Technologies

- **React Native** (Bare or Expo)
- **TypeScript**
- **TanStack Query**
- **React Navigation**
- **React-native-track-player**
- **React-native-video**
- **EAS (Expo Application Services)**
- **AsyncStorage / MMKV**
- **SVG animations**

## Monorepo (troott workspace)

This app lives under `apps/mobile` in the Troott monorepo. From the repo root, do **not** run Expo at the repository root without a project directory.

### Native projects (Android / iOS)

Generated native trees live **only** under this package: **`apps/mobile/android`** and **`apps/mobile/ios`**. Do **not** run bare `expo prebuild` with the monorepo root as the current working directory and no project path (that can recreate wrong root-level folders or resolve `./assets/...` from the wrong place).

**No backward compatibility:** the monorepo does **not** support repository-root **`android/`** or **`ios/`** for this app. Do not reintroduce them, symlink them, or document workflows that expect native projects outside **`apps/mobile`**.

- **Expo SDK 55** (React 19.2, React Native 0.83). The previous **`@expo/cli` pnpm patch** (simulator open-URL noise) has been **removed**; if the iOS Simulator logs **`LSApplicationWorkspaceErrorDomain` code `115`** after a dev-client deep link, it is usually **harmless**—bring the app to the foreground manually if needed.
- From repo root: **`pnpm prebuild:mobile`** or **`pnpm prebuild:mobile:clean`** (runs `expo prebuild` with **`pnpm --dir apps/mobile`**, so the Expo project root and asset paths are this package).
- From **`apps/mobile`**: **`pnpm prebuild`** / **`pnpm prebuild:clean`** (same output, `expo prebuild .`).

Open **`apps/mobile/ios/*.xcworkspace`** in Xcode and the **`apps/mobile/android`** folder in Android Studio.

**EAS:** `eas.json` lives in this package; run EAS commands with **`apps/mobile`** as the project directory (for example `cd apps/mobile` before `eas build`, or pass your CLI’s equivalent of `--project-dir apps/mobile` from the repo root).

- **Metro (port 8177, matches `expo run:ios`):** `pnpm start:mobile` or `pnpm dev:mobile`, or `pnpm expo:mobile:start`. For ad-hoc Expo CLI subcommands use `pnpm expo:mobile -- <args>` (if you run `start` this way, pass `--port 8177`).
- **iOS native build + install:** `pnpm ios` from the repo root (uses the same Metro port).
- **Use your development build** (bundle id `com.dmlscript.troottclient`), not Expo Go, when the project depends on `expo-dev-client` and custom native modules.

Metro is configured to resolve `react`, `react-native`, and `scheduler` from this package so the bundler does not pick duplicate copies from the hoisted workspace tree. Nested `react-native` pulled in under `react-native-is-edge-to-edge` is rewritten to the app’s canonical `react-native` install (fixes Android parse errors on newer nested sources).

### react-native-track-player and native code

If Metro logs warnings about missing Objective-C methods for sleep timer APIs (`getSleepTimerProgress`, `setSleepTimer`, etc.), the **JavaScript npm version** and the **native module inside your dev client** are out of sync. Fix by aligning the library version with your Expo/RN SDK, then rebuild the development client (`expo prebuild` / `expo run:ios` / EAS dev build) so native code matches the JS package.

## Getting Started

To get it up and running on your local machine, follow the steps below:

1. **Clone the repo**

    ```bash
    git clone https://github.com/thebuildershq/troott-client-mobile.git
    cd troott-client-mobile
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn
    ```

3. **Install Expo CLI (if not already installed)**  
   If you don't have Expo CLI installed globally on your machine, run:

    ```bash
    npm install -g expo-cli
    ```

4. **Install EAS CLI (if you plan to use EAS for builds or submissions)**

    ```bash
    npm install -g eas-cli
    ```

5. **Set up environment variables**  
   Ensure you have a `.env` file with the necessary environment variables for your app.

6. **Using EAS (if needed)**  
   Log into EAS with:

    ```bash
    npx eas login
    ```

7. **Run the app in development mode**  
   Start the app using Expo CLI:

    ```bash
    npx expo start
    # or
    npm start
    ```

8. **Run the app on your device or emulator using Expo client**
    ```bash
    npx expo client
    ```

## Branch Structure

| Branch                | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `master`              | Production-ready code. Always stable. Protected.                 |
| `staging`             | QA/testing branch for integrating all features before a release. |
| `release/vX.Y.Z`      | Pre-production branch used for final testing before going live.  |
| `@username/feature-*` | Feature branches under a personal namespace.                     |
| `@username/fix-*`     | Bugfix branches under a personal namespace.                      |

### Example of Branch Naming Conventions

| Type    | Pattern                          | Example                                     |
| ------- | -------------------------------- | ------------------------------------------- |
| Feature | `@username/feature-<short-desc>` | `@topeokuselu/feature-user-invitation-card` |
| Bug Fix | `@username/fix-<short-desc>`     | `@damolaoladipo/fix-email-validation-bug`   |
| Release | `release/v<semver>`              | `release/v1.0.2`                            |

> Use lowercase and hyphens in branch names. Be concise and descriptive.

## Development Workflow

### 1. Clone the Repository (if you haven't)

```bash
git clone https://github.com/thebuildershq/troott-client-mobile.git
cd troott-client-mobile
```

### 2. Create a Feature Branch

Open a feature branch from the staging branch.

```bash
git checkout staging
git pull origin staging
git checkout -b @username/feature-your-task-name
```

Tip: Use a descriptive and concise name for your branch. Follow this format:

`@username/feature-short-description`

Example: `@damolaoladipo/feature-user-invitation-endpoint`

### 3. Develop Your Feature

Make your changes, test locally, and commit often using clear commit messages.

### 4. Sync with Latest Changes on staging

Before pushing or merging your feature, make sure your branch is up to date.

```bash
git fetch origin
git rebase origin/staging
```

### 5. Push to Remote

```bash
git push origin @username/feature-your-task
```

### 6. Merge into staging (after PR approval)

```bash
git checkout staging
git merge @username/feature-your-task-name
git push origin staging
```

Your pull request (PR) should target `staging` — not master.  
Reference the issue number in the PR description (e.g., Closes #502).

### 7. Create a Release Branch

When ready for deployment, create a release branch from staging.

```bash
git checkout -b release/v1.0.2
git push origin release/v1.0.2
```

Final QA and bug-fixing happen on this release/\* branch before production deployment.

### 8. Merge Release into master and staging

After final QA on the release branch, merge it into both master and staging to complete the release.

```bash
# Merge into master
git checkout master
git merge release/v1.0.2
git push origin master

# Merge back into staging to ensure it stays updated
git checkout staging
git merge release/v1.0.2
git push origin staging
```

### Creating an Issue

If you discover a bug or have a suggestion, raise an issue via the GitHub Issues tab (if you have permission), or notify your team lead for triage and assignment.

## Useful Commands

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Starts the app in development mode.        |
| `npm start`     | Starts the app in production mode.         |
| `npm run build` | Build app for production (EAS or manually) |

## Pull Request Notes

- PRs should target the `staging` branch.
- Reference issues using `Closes #issue-number`.
- Add context and screenshots/logs when helpful.
- Request reviewers before merging.
