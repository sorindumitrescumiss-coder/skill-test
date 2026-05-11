# Next.js

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation

1. Install dependencies:
  ```bash
  npm install
  # or
  yarn install
  ```

2. Start the development server:
  ```bash
  npm run dev
  # or
  yarn dev
  ```
3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:
- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run api` - Start optional standalone Express API on port 3000
- `npm run doctor` - Validate env + Supabase + OpenRouter connectivity

## Full Backend Setup (Auth + AI + Supabase)

1. Copy `.env.example` to `.env.local` and set real values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose in client code)
   - `OPENROUTER_API_KEY`
2. Run SQL in Supabase SQL Editor:
   - `supabase/results.sql` (legacy demo table)
   - `supabase/app_schema.sql` (profiles, attempts, skill_test_results, RLS, signup trigger)
   - `supabase/skill_test_nft_mints.sql` (optional `profiles.wallet_address`, idempotent server NFT mint log)
3. Validate everything:
   - `npm run doctor`
4. Start app:
   - `npm run dev`
5. Test full flow:
   - `/sign-up-login-screen` → create account / login
   - `/skill-test` → start AI-generated test → submit answers → graded result stored in Supabase

## 📱 Deployment

Build the application for production:

  ```bash
  npm run build
  ```

### Custom domain (this project)

The app does **not** hardcode a hostname: OAuth and email links use `window.location.origin`, and API routes are same-origin (`/api/...`). To go live on a domain such as `https://trueassess.abrdns.com`:

1. **Deploy** the Next app (e.g. [Vercel](https://vercel.com): import repo → deploy; note the default `*.vercel.app` URL).
2. **Add the domain on the host** (Vercel: Project → Settings → Domains → add `trueassess.abrdns.com`). The host will show the exact **DNS records** (usually **CNAME** to `cname.vercel-dns.com` or similar).
3. **In ClouDNS** (or any DNS): create that **CNAME** (or **A**/**AAAA** if the host says so) in the zone for your hostname. Wait for DNS to propagate.
4. **Supabase** (Dashboard → Authentication → URL configuration):
   - Set **Site URL** to your public origin, e.g. `https://trueassess.abrdns.com`.
   - Under **Redirect URLs**, allow at least:
     - `https://trueassess.abrdns.com/**`
     - `https://trueassess.abrdns.com/auth/callback`
     - `https://trueassess.abrdns.com/sign-up-login-screen` (password reset redirect).
5. **Production environment variables** on the host: copy from `.env.local`, set **`NEXT_PUBLIC_SITE_URL`** to the same `https://...` origin (see `.env.example`).

After that, visiting your domain should load the app; sign-in and `/api/auth/profile-sync` work as on localhost.

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by Next.js and React
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new