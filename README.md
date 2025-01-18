# OHSync

<https://ohsync.me>

**OHSync** is an application that allows UF professors and TAs to publish office
hours in a systematic way, and allows students to view these office hours.

## Getting Started

Install dependencies:

```bash
bun install
```

### Frontend

```bash
bun run frontend
```

### Backend

Copy `.env.template` to a new file `.env` and fill with appropriate values.

Then:

```bash
bun run backend
```

## Repository Organization

### Backend

- The backend is stored in `apps/backend`.
- The entry point is `index.ts`.

### Frontend

- The frontend is stored in `apps/frontend`.
- The entry point is `App.tsx`.

## How to Use Git

1.  **Create a new branch:**

    ```bash
    git checkout -b <new-branch-name>
    ```

2.  **Make changes and commit:**

    ```bash
    git add -A
    git commit -m "Your commit message"
    ```

3.  **Push to remote:**

    ```bash
    git push origin <new-branch-name>
    ```

4.  **Create a Pull Request (PR):**

    Click the link generated in the terminal to make your PR.

5.  **Merge PR into main:**

    Merge your code into main if you think its good and proper, otherwise ask
    team to check.

6.  **Pull the latest changes from main:**

    ```bash
    git checkout main
    git pull origin main
    ```

## Database

Before using the below bun commands, first change to the backend directory:

```bash
cd apps/backend
```

Look in `package.json` for commands.

### Migrate Up

```bash
npx knex migrate:latest
# or
bun mig-up
```

### Migrate down (DELETES ALL OF THE DATA!!!)

```bash
npx knex migrate:rollback
# or
bun mig-down
```

### Seed (DELETES ALL OF THE DATA!!!)

```bash
bun seed
```

### Do All 3

```bash
bun db-reset
```
