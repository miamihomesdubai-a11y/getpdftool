# GetPDFTool — All Free PDF Editor Plus More

A privacy-friendly PDF editor that runs entirely in the browser. Built with
Next.js 14, React 18, Tailwind CSS, `pdf.js` and `pdf-lib`.

---

## 🗂 What's in this folder

```
app/                    Pages — homepage, about, contact, privacy, terms
components/             Header, Footer, AdSlot, PDFEditor, PageCanvas
lib/                    PDF worker setup, types, export logic
public/                 ads.txt and any static assets
package.json            Project dependencies
README.md               This file
```

The PDF editor lives at the root URL (`/`). Everything else is supporting
content needed for AdSense and SEO.

---

## 🚀 Quick start — try it on your computer

You only need to do this once.

### 1. Install Node.js

Download and install Node.js 20 LTS (or newer) from
<https://nodejs.org/>. Click the big green button and run the installer.

To check it worked, open **Terminal** (Mac) or **PowerShell** (Windows) and
type:

```bash
node --version
```

You should see something like `v20.11.0`.

### 2. Install the project dependencies

In Terminal, navigate to this folder, then run:

```bash
cd "/Users/mohammednadeemahmed/Desktop/claude codes for sajda"
npm install
```

This downloads everything the app needs. It takes 1–2 minutes the first time.

### 3. Start the development server

```bash
npm run dev
```

Open <http://localhost:3000> in your browser. You should see the editor.
Drop a PDF on the page and try the tools.

To stop the server, press `Ctrl + C` in the Terminal.

---

## 🌍 Deploy to Vercel (free)

This puts your site live on the internet for free.

### 1. Create a Vercel account

Go to <https://vercel.com/signup> and sign up with GitHub, GitLab, or email.
Free plan is fine.

### 2. Push the code to GitHub (easiest path)

If you don't have a GitHub account, create one at <https://github.com/signup>.

Then:

1. Create a new empty repository at <https://github.com/new> — name it
   `getpdftool`. **Don't** initialise with a README or `.gitignore`.
2. Back in Terminal, run from this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit — GetPDFTool"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/getpdftool.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

### 3. Import the repo into Vercel

1. In the Vercel dashboard, click **Add New → Project**.
2. Pick the `getpdftool` repository you just pushed.
3. Leave all settings as default. Click **Deploy**.
4. Wait ~1 minute. You'll get a live URL like
   `https://getpdftool.vercel.app`. Open it — your site is live.

Every time you `git push` to GitHub from now on, Vercel will rebuild and
re-publish the site automatically.

---

## 🔗 Connect your domain (getpdftool.com)

Your domain is registered at Hostinger. You'll point it at Vercel.

### 1. Add the domain in Vercel

1. In your Vercel project, go to **Settings → Domains**.
2. Type `getpdftool.com` and click **Add**.
3. Vercel will show two DNS records you need to add:
   - An **A record** for the apex domain (`@`) pointing to `76.76.21.21`
   - A **CNAME record** for `www` pointing to `cname.vercel-dns.com`

### 2. Update DNS in Hostinger

1. Log in to <https://hpanel.hostinger.com>.
2. Go to **Domains → getpdftool.com → DNS / Nameservers**.
3. Delete any existing `A` and `CNAME` records that conflict.
4. Add a new **A record**:
   - Name: `@`
   - Points to: `76.76.21.21`
   - TTL: leave default
5. Add a new **CNAME record**:
   - Name: `www`
   - Points to: `cname.vercel-dns.com`
   - TTL: leave default
6. Save.

DNS propagation usually takes 10–30 minutes (sometimes longer). Vercel will
show a green "Valid configuration" once it sees the new records. SSL
(the padlock icon) is automatic and free.

### 3. Cancel Hostinger hosting (optional)

You only needed the **domain registration**, not the hosting plan. If you
were paying for Hostinger hosting just for this site, you can downgrade or
cancel it from the Hostinger billing area. The domain registration stays.

---

## 💰 Set up Google AdSense

### 1. Apply for AdSense

1. Go to <https://www.google.com/adsense/start/> and sign up with your
   Google account.
2. Add `www.getpdftool.com` as your site.
3. Google will give you a **publisher ID** that looks like
   `ca-pub-1234567890123456`.

### 2. Add your publisher ID to the site

Open these two files and replace the placeholders:

**a. `app/layout.tsx`** — uncomment the AdSense script tag inside `<head>`
and replace `ca-pub-XXXXXXXXXXXXXXXX` with your real ID.

**b. `components/AdSlot.tsx`** — set the `ADSENSE_CLIENT` constant at the
top of the file to your real ID.

**c. `public/ads.txt`** — replace `pub-XXXXXXXXXXXXXXXX` with the part of
your publisher ID that comes after `ca-`.

Commit and push the changes; Vercel will redeploy automatically.

### 3. Wait for review

Google will review your site (usually 1–14 days). The site has everything
they need to approve it:

- ✅ Original content (homepage, about, contact, privacy, terms)
- ✅ Privacy Policy with AdSense / cookies disclosure
- ✅ Terms of Service
- ✅ Contact information
- ✅ Mobile-responsive
- ✅ Fast page loads (Next.js + Vercel)
- ✅ `ads.txt` file at the root
- ✅ Sitemap and `robots.txt`

### 4. Create ad units

Once approved, in AdSense dashboard go to **Ads → By ad unit → Create new
ad unit**. Each ad unit gives you a slot ID. Use it in the AdSlot component:

```tsx
<AdSlot slot="1234567890" format="auto" />
```

You can place as many `<AdSlot />` blocks as you like in any page. The
homepage already has three placeholder slots (top, middle, bottom).

---

## ➕ Adding more PDF tools later

When you want to add tools like "Merge PDFs" or "Compress PDF":

1. Create a new folder under `app/`, e.g. `app/merge-pdf/page.tsx`.
2. Build a small client component for that tool (use `pdf-lib` for editing,
   `pdfjs-dist` for rendering).
3. Add a link to it in `components/Header.tsx` and `components/Footer.tsx`.
4. Add the URL to `app/sitemap.ts`.

Each new page is its own URL → its own AdSense impressions → more revenue.

---

## 🛠 Useful commands

```bash
npm install          # install dependencies (run once)
npm run dev          # start local dev server at localhost:3000
npm run build        # build the production version
npm run start        # run the production build locally
```

---

## 📞 Need help?

If something breaks:

1. Stop the dev server (`Ctrl + C`), delete the `.next` folder, and run
   `npm run dev` again.
2. If `npm install` fails, delete `node_modules` and `package-lock.json`,
   then run `npm install` again.
3. Vercel logs every deployment — go to your project → **Deployments** →
   click the failing one to see the error.
