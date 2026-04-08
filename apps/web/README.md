## Troott ( Client-side: web )

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

- **TypeScript**
- **Vite**
- **TanStack Query**
- **React Router**

## Getting Started

To get it up and running on your local machine, follow the steps below:

1. **Clone the repo**  
   ```bash
   git clone https://github.com/thebuildershq/troott-client-web.git
   cd troott-client-web
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**  
   Ensure you have a `.env` file with the necessary environment variables for your app. 
    ```bash
   VITE_API_BASE_URL=https://api.example.com
   ```

4. **Run the app in development mode**
   Start the web app:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Run the app in production mode**
   Start the web app:
   ```bash
   npm run build
   # or
   yarn build
   ```

6. **Run the app to preview development build**  
   Start the web app:
   ```bash
  npm run preview
   ```

## Branch Structure

| Branch               | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `master`             | Production-ready code. Always stable. Protected.                        |
| `staging`            | QA/testing branch for integrating all features before a release.        |
| `release/vX.Y.Z`     | Pre-production branch used for final testing before going live.         |
| `@username/feature-*`| Feature branches under a personal namespace.                            |
| `@username/fix-*`    | Bugfix branches under a personal namespace.                             |

### Example of Branch Naming Conventions


| Type | Pattern | Example |
|------|---------|---------|
| Feature | `@username/feature-<short-desc>` | `@topeokuselu/feature-user-invitation-card` |
| Bug Fix | `@username/fix-<short-desc>` | `@damolaoladipo/fix-email-validation-bug` |
| Release | `release/v<semver>` | `release/v1.0.2` |

> Use lowercase and hyphens in branch names. Be concise and descriptive.


## Development Workflow

### 1. Clone the Repository (if you haven't)

```bash
git clone https://github.com/thebuildershq/troott-client-web.git
cd troott-client-web
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

Final QA and bug-fixing happen on this release/* branch before production deployment.

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


| Command            | Description                                   |
|--------------------|-----------------------------------------------|
| `npm run dev`      | Starts the app in development mode.           |
| `npm run build`    | Build app for production                      |
| `npm run preview`    | Preview production build locally              |

## Pull Request Notes

- PRs should target the `staging` branch.
- Reference issues using `Closes #issue-number`.
- Add context and screenshots/logs when helpful.
- Request reviewers before merging.