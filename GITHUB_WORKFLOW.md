# GITHUB WORKFLOW & VERSION CONTROL POLICY
## Private Repository Governance for IPCR Accomplishment Tracker
**Repository:** `ipcr-accomplishment-tracker` (Private)  
**Organization / Owner:** National Irrigation Administration (NIA) - Regional Office XI

---

## 1. Branching Strategy

The repository strictly enforces a Git-flow derivative tailored for secure single-operator systems with staging verification:

```
[main]          ──*──────────────* (v0.1.0 Tag) ─────────* (v1.0.0 Tag)
                  \              ^                        ^
[development]      *──────*──────/──────────*────────────/
                    \    /                 /
[feature/xxx]        *──*                 /
                                         /
[phase-0-setup]  ───────────────────────*
```

### Branch Definitions
- **`main` (Production Branch):**
  - Represents stable, tested, and deployable code.
  - Direct commits to `main` are strictly forbidden.
  - Changes are merged into `main` only after passing all phase tests and receiving user sign-off.
  - Every release on `main` receives an immutable semantic version tag (e.g. `v0.1.0`, `v1.0.0`).
- **`development` (Integration Branch):**
  - The working baseline for day-to-day development.
  - Aggregates completed and validated phase branches.
- **`feature/*` or `phase-*` (Working Branches):**
  - Branched off `development`.
  - Focused on specific architectural milestones (e.g., `feature/daily-logger`, `feature/excel-import`, `phase-0-initialization`).
  - Merged back into `development` via pull request or rebase commit once verified.

---

## 2. Commit Message Standards

All commits must follow Conventional Commits formatting:

```
<type>(<scope>): <short description in present tense>

[optional body explaining context, rationale, and modifications]

[optional footer referencing issue or phase milestone]
```

### Standard Types:
- `feat`: A new user-facing capability or module.
- `fix`: A bug fix or data correction.
- `docs`: Documentation updates (e.g., architecture, guides).
- `style`: Formatting, whitespace, or visual styling changes.
- `refactor`: Code reorganization without functional alteration.
- `test`: Adding or updating test suites and verification scripts.
- `chore`: Build tooling, dependency management, or repository config.

### Examples:
- `feat(activities): implement daily activity logger form with auto-save`
- `docs(schema): define Firestore collection structures for Phase 1`
- `fix(import): handle merged G:H cell ranges in 2026 IPCR workbook`

---

## 3. Secret Protection & Pre-Commit Audit

### Absolute Exclusions from Git:
1. Firebase client secrets and production configs (`.env`, `.env.local`, `.env.production`).
2. Google Cloud service account keys (`*serviceAccountKey*.json`, `*-adminsdk-*.json`).
3. Actual exported personal records or sensitive government memoranda containing non-public data.
4. Temporary scratch scripts containing hardcoded paths or test tokens.

### Verification Checklist Before Every Push:
```bash
# 1. Check for untracked sensitive files
git status

# 2. Inspect staged diffs for accidental credentials
git diff --cached --name-only
git diff --cached | grep -iE "(api[_-]?key|secret|password|bearer|private_key)"

# 3. Verify clean TypeScript compilation
npm run typecheck

# 4. Verify clean production build
npm run build
```

---

## 4. Release Tagging & Recovery Points

When a phase milestone is signed off, create a signed annotated tag:

```bash
# Switch to main and merge validated development branch
git checkout main
git merge development --ff-only

# Tag the milestone release
git tag -a v0.1.0 -m "Release v0.1.0: Phase 0 Project Initialization and Design System"

# Push to private remote
git push origin main --tags
```

