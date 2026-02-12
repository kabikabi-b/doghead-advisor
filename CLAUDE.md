# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

狗头军师 (Dog Head Strategist) — a WeChat Mini Program that generates humorous/nonsensical AI replies to user questions. Uses MiniMax API for AI generation and WeChat Cloud Development (CloudBase) for backend.

**Language**: The app UI and user-facing content is in Chinese. Code comments are also in Chinese.

## Architecture

- **Frontend**: WeChat Mini Program (WXML/WXSS/JS, not a web app — no HTML/CSS/npm bundler)
- **Backend**: WeChat CloudBase (cloud functions + cloud database)
- **AI**: MiniMax API (`MiniMax-M2.1`) called from the `generateReply` cloud function
- **Cloud env ID**: `cloud1-8ge51kis0d4af40b`

### Key Flow
1. User enters question on index page → calls `generateReply` cloud function
2. Cloud function sends question to MiniMax API with nonsensical prompt, saves Q&A to `questions` collection
3. Result page displays reply; user can like, copy, or ask again
4. Community page shows public Q&As; Profile page shows user stats

### Pages (in app.json)
- `pages/index/index` — Home, question input + hot questions
- `pages/community/community` — Public Q&A feed
- `pages/profile/profile` — User profile
- `pages/result/result` — AI reply display (navigateTo, not tab)
- `pages/history/history` — User's Q&A history

Tab bar: index, community, profile. Result and history are non-tab pages accessed via `wx.navigateTo`.

### Cloud Database Collections
- `questions` — stores Q&A pairs (question, reply, openid, likes, createTime)
- `users` — user profiles

### Cloud Functions
- `cloudfunctions/generateReply/` — calls MiniMax API, saves to DB, returns reply. API key from `process.env.MINIMAX_API_KEY`.

## Commands

```bash
# Run all tests (Jest + miniprogram-automator E2E)
npm test

# Run specific test file
npx jest --config tests/jest.config.js tests/e2e/result.spec.js

# Deploy cloud functions
npm run deploy

# Deploy via CLI
npm run deploy:cli
```

Tests require WeChat DevTools with service port enabled. Install test deps separately: `cd tests && npm install`.

## WeChat Mini Program Conventions

- Pages use `Page({})` pattern, not ES modules. No import/export — use `require()` or `getApp()`.
- Styles are WXSS (subset of CSS). Templates are WXML (not HTML — uses `<view>`, `<text>`, `<button>`, `wx:if`, `wx:for`, `bindtap`).
- Navigation: `wx.navigateTo` for sub-pages, `wx.switchTab` for tab pages.
- Cloud calls: `wx.cloud.callFunction({ name, data })`.
- No DOM manipulation — all state via `this.setData({})`.
