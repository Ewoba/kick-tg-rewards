# Contributing

Thanks for helping! Quick rules to keep the repo healthy.

## Workflow
1. Fork or create a feature branch from `main`.
2. Keep changes focused and small.
3. Run/check what you touch (API: `uvicorn main:app --reload`, front: `python -m http.server 8001 --directory frontend`).
4. Open a Pull Request to `main` with a clear title and summary.
5. Wait for review from code owners (@Eric-Lebedenko @VladLitvinov @tiktak6828).

## Commit & PR
- Commits: short imperative (`feat: ...`, `fix: ...`, `docs: ...`).
- PR description: what/why, how to test, any risks.
- Prefer squash or rebase merges; no direct commits to `main`.

## Style & Secrets
- Python: default formatting (black/ruff style), avoid non-ASCII unless нужно.
- Front: keep existing CSS/HTML style; small, readable JS.
- No secrets in git: keep `.env`, tokens, DB out of commits. Use `.env.example`.

## Issues
- Use templates (bug/feature).
- Add context, steps to reproduce, expected vs actual, logs/screens if relevant.

## Code review tips
- Keep diffs small; add comments if logic is non-obvious.
- Write brief inline comments for complex parts only.
