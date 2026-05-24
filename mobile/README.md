# Matcher Mobile (Expo)

This is a React Native mobile client for the existing `matcher-clean` backend.

## 1) Configure API URL

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL`:

- iOS simulator: `http://127.0.0.1:3001`
- Android emulator: `http://10.0.2.2:3001`
- Physical phone: `http://YOUR_LOCAL_IP:3001`

## 2) Run backend

From repo root:

```bash
npm run dev
```

## 3) Run mobile app

From `mobile/`:

```bash
npm start
```

Then open on iOS, Android, or Expo Go.

## Notes

- The starter app supports Login and Register against:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- Session cookies from web APIs may not behave exactly the same in React Native as in browser.
