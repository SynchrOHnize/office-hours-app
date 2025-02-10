# OHsync

**OHsync** is an application that allows University of Florida professors and
teaching assistants (TAs) to publish office hours in a systematic way, and
allows students to view these office hours.

This repository contains the backend and the web frontend. The information below
is primarily for developers; information for users is available at the website,
<https://ohsync.me>.

## Getting Started

Install dependencies:

```bash
bun install
```

### Backend

The backend is stored in `apps/backend`. The main entry point is `src/index.ts`,
which mostly delegates to `src/server.ts`. To test the backend, first copy
`.env.template` to a new file `.env` and fill with appropriate values. Then
change to the backend directory and start the server in development mode:

```bash
cd apps/backend
bun run dev
```

### Frontend

The frontend is stored in `apps/frontend`. The main entry point is `src/App.ts`.
To test the frontend, change to the frontend directory and start the dev
server:

```bash
cd apps/frontend
bun run dev
```

## Database

First change to the backend directory:

```bash
cd apps/backend
```

### Initializing the Database

This initializes the tables and other structures in the database schema. This is
safe to run on an existing database.

```bash
bun db:init
```

### Wiping the Database

**THIS WILL DELETE ALL THE DATA ON THE DATABASE AND DESTROY THE SCHEMA!** The
database must be re-initialized after running this command to be usable again.

```bash
bun db:wipe
```

### Resetting the Database

**THIS WILL DELETE ALL THE DATA ON THE DATABASE AND DESTROY THE SCHEMA!** The two
operations above can also be done with a single command:

```bash
bun db:reset
```

## Using Git

It is recommended to set `push.default` to `current` so that `git push` will
automatically use the current branch:

```bash
git config --global push.default current
```

### Creating a Pull Request

 1. **Switch to a new branch:**

    ```bash
    git switch -c <new-branch-name>
    ```

 2. **Commit changes:**

    ```bash
    git add -A
    git commit -m "Your commit message"
    ```

 3. **Push to the central repository:**

    ```bash
    git push origin <new-branch-name>
    ```

 4. **Create a pull request:**

    Click the link generated in the terminal to make your PR.

 5. **Merge PR into main:**

    Merge your code into main if you think its good and proper, otherwise ask
    team to check.

 6. **Pull the latest changes from main:**

    ```bash
    git switch main
    git pull origin main
    ```
