# Git history: `apps/mobile` in this repo

## Verified facts (run locally to re-check)

From repository root:

```bash
git log -5 --oneline
git ls-tree -r --name-only fd49531 -- apps/mobile | wc -l
```

Expected:

-   History is shallow: **`2533c47`** (workspace sources) and **`fd49531`** (Initial commit) on the current branch.
-   **`git ls-tree fd49531 -- apps/mobile`** returns **no paths** (count **0**): the initial commit has **no** `apps/mobile` tree. The mobile app appears only in the later commit.

So **`git checkout HEAD~1` cannot restore a prior `apps/mobile`** in this clone; there is no older mobile snapshot in local history.

## If `git fetch` fails

SSH or network errors (e.g. `Permission denied (publickey)`) mean you cannot compare to `origin` until remotes are fixed. Use one of the baselines below instead.

## Baselines outside this repo

1. **Another checkout on your machine** – If Metro reported port **8081** in use by another Troott app (e.g. `ProjectStudy/troott-mobile-app`), diff that tree against this repo’s `apps/mobile`:

    ```bash
    diff -ru /path/to/repo-a/apps/mobile /path/to/repo-b/apps/mobile | less
    ```

2. **Remote after fetch works**

    ```bash
    git fetch origin
    git log -10 --oneline origin/main -- apps/mobile
    ```

3. **Reflog** – Only if you had more commits locally and rewrote history: `git reflog`.
