# Setup Guide — Bot Bu Mobile

## 1. Install dependencies

```bash
cd test
npm install
```

## 2. Get your Mac's local IP address

Run this in your terminal:

```bash
ipconfig getifaddr en0
```

You will get something like `192.168.1.51`. This is the IP your phone will use to reach the API.

Alternatively, when you run `pnpm dev` in the BOT-BU project the terminal prints:

```
- Network:  http://192.168.x.x:3000   ← this is your IP
```

## 3. Set the API URL

Open `constants/Api.js` and update `DEV_API_URL` with your Mac's IP and port (**3000** by default):

```js
// constants/Api.js
const DEV_API_URL = 'http://192.168.x.x:3000';  // ← replace with your IP
```

Make sure `IS_PRODUCTION` is `false` for local dev:

```js
const IS_PRODUCTION = false;
```

> Your phone and Mac must be on the same WiFi network.

## 4. Start the Expo dev server

```bash
npx expo start --lan
```

Scan the QR code with **Expo Go** on your phone.

---

## Running both apps together

Open two terminal tabs:

**Tab 1 — API backend**
```bash
cd BOT-BU
pnpm dev
# or: npm run dev
```

**Tab 2 — Mobile app**
```bash
cd test
npx expo start --lan
```
