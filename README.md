# Visitor Database – Mobile (Android / iOS)

React Native (Expo) app that mirrors the web Visitor Database: sign in with email OTP/magic link, view visitors list, and open visitor details. Uses the **same Supabase project** as the web app.

## Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your Android device (or Android emulator)
- Same Supabase project as the web app

## Setup

1. **Copy env from web app**

   Create `.env` in this folder (same values as the web app’s `.env.local`):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_VISITORS_TABLE=visitors
   ```

   Use the same **Supabase URL** and **anon key** as the web app. If your table name is different (e.g. `zoho_visitor_table`), set `EXPO_PUBLIC_VISITORS_TABLE` to that.

2. **Allow mobile to read visitors (RLS)**

   The web app uses the **service role** key on the server to bypass RLS. The mobile app uses the **anon** key and the **logged-in user’s session**, so Supabase will apply RLS.

   In **Supabase Dashboard** → **Authentication** → **Policies** (or **Table Editor** → your visitors table → RLS):

   - Enable RLS on the visitors table if it isn’t already.
   - Add a policy that allows **authenticated** users to **SELECT**:

     - Policy name: e.g. `Allow authenticated read`
     - Allowed operation: **SELECT**
     - Target roles: `authenticated`
     - Using expression: `true` (or a more restrictive condition if you prefer).

   Without this, the visitors list will be empty on mobile after login.

3. **Install and run**

   ```bash
   cd zoho-crm-db-mobile
   npm install
   npx expo start
   ```

4. **Open on Android**

   - Scan the QR code with the Expo Go app, or
   - Press `a` in the terminal to open the Android emulator.

## Features (same as web)

- **Sign in**: Email → request OTP / magic link → enter code or use link. Session is stored securely (Expo SecureStore).
- **Visitors list**: Paginated list (date of visit, name, center, etc.), search, sort by date, pull-to-refresh.
- **Visitor detail**: Tap a row to open full details in the same sections as the web (Visitor Information, Clinical Details, Hearing Aid Sale).

## Build an APK to share and install on phones

Use [EAS Build](https://docs.expo.dev/build/introduction/) to generate an Android APK you can install without Expo Go.

### 1. Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

Create an [Expo account](https://expo.dev/signup) if you don’t have one.

### 2. Set environment variables for the build

The APK needs your Supabase URL and keys at build time. Set them as EAS secrets:

```bash
cd zoho-crm-db-mobile
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL          --value "https://YOUR_PROJECT.supabase.co" --type string
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY     --value "YOUR_ANON_KEY" --type string
eas secret:create --name EXPO_PUBLIC_VISITORS_TABLE       --value "Zoho_Visitor_Table" --type string
```

Use your real Supabase URL, anon key, and table name (e.g. `Zoho_Visitor_Table` or `visitors`).

### 3. Build the APK

```bash
eas build --platform android --profile preview
```

- The **preview** profile is set in `eas.json` to produce an **APK** (not an AAB).
- The build runs in the cloud. When it finishes, you’ll get a **download link** in the terminal and in [expo.dev](https://expo.dev) → your project → Builds.

### 4. Install on your phone

- Download the APK from the link EAS gives you.
- On your Android device, open the APK file and allow “Install from unknown sources” if asked.
- Install and open **Zoho data**; sign in with your allowed email.

### Optional: production build (AAB for Play Store)

For a Play Store bundle instead of a shareable APK:

```bash
eas build --platform android --profile production
```

## Project structure

- `App.tsx` – Auth check, navigation (Login ↔ Visitors ↔ Visitor detail).
- `src/lib/supabase.ts` – Supabase client with SecureStore for session.
- `src/lib/format.ts` – Date/value formatting (same logic as web).
- `src/lib/visitorFields.ts` – Section/field definitions for detail screen.
- `src/screens/LoginScreen.tsx` – Email OTP / magic link sign-in.
- `src/screens/VisitorsListScreen.tsx` – List with search and sort.
- `src/screens/VisitorDetailScreen.tsx` – Full visitor details by section.

## Troubleshooting

- **“No visitors” after login**  
  Add an RLS policy that allows `authenticated` users to `SELECT` from the visitors table (see step 2 above).

- **“Failed to send sign-in link”**  
  Same as web: configure Supabase Auth → SMTP (e.g. Gmail App Password) and Redirect URLs. Magic links from email may open in the browser; use the 6-digit code in the app.

- **Env not loading**  
  Ensure `.env` exists and has `EXPO_PUBLIC_*` vars. Restart with `npx expo start --clear`.
