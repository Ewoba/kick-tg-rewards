# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2026-01-15
### Added
- FastAPI backend with Kick (PKCE) and Twitch OAuth flows; tokens stored in SQLite via SQLModel.
- Steam trade link storage (API + localStorage) and status card on the profile UI.
- Static frontend profile with Kick/Twitch cards, localization (RU/EN/DE), theme switcher, followed streamers list (mock + fallback).
- Telegram bot entrypoint (python-telegram-bot) with links to frontend and Kick auth.
- Roadmap, team/branch guide, OSS meta (LICENSE, CONTRIBUTING, SECURITY, issue/PR templates).

### Notes
- Default ports: API `8000`, frontend `8001`.
- `.env` files are local-only; examples use placeholders.

[v0.1.0]: https://github.com/Eric-Lebedenko/kick-tg-rewards/releases/tag/v0.1.0
