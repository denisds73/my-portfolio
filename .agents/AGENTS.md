# Agent Rules

- Always request explicit approval before deleting files or removing significant functionality, unless the user explicitly commands a "merge" or "push".
- Always request explicit approval before pushing to the `main` branch, unless the user explicitly commands a "merge" or "push".
- Keep communications clear, concise, and free of clutter.
- When asked to push or merge, always create a new branch first, raise a PR, and then merge and push automatically (no further permission needed).
- Before committing, pushing, or merging, always verify the project builds successfully (e.g., run `npm run build`) to catch any broken imports or type errors.
