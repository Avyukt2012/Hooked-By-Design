# Hooked by Design

A website that shows students how Instagram and YouTube are designed to hold their attention, why those features work, and how to switch them off or limit them.

A Service as Action project by Avyukt Aggarwal, Neal Nikhil Suman, Ashvathh Sinnha and Atharva Kushwaha (MYP 4A).

It's a plain static site: HTML, CSS and a little JavaScript. No frameworks, no build step, no tracking, and no requests to any other website (the fonts are included in the folder). It's live at **https://hooked-by-design.vercel.app**, hosted on [Vercel](https://vercel.com).

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: the survey headline, the 30-second quiz, links to everything |
| `playbook.html` | The Hook Playbook: the 9 tricks, 4 demos, the three-question test |
| `instagram.html` | Instagram, feature by feature |
| `youtube.html` | YouTube, feature by feature, plus the algorithm explainer |
| `survey.html` | Our survey results as charts |
| `challenge.html` | The 7-day challenge checklist |
| `about.html` | About us, our rules, the feedback link and all sources |
| `feedback.html` | The four-question feedback form |
| `admin.html` | Developer page: every feedback response, with a Download for Excel button (password needed) |
| `404.html` | The “page not found” page |

```
assets/
  css/style.css        all the styles (colours are at the top, under "Design tokens";
                       the light theme first, then the dark one)
  js/theme.js          runs first on every page: applies the saved light/dark choice
  js/site.js           the phone menu, the light/dark switch and the scroll animations
  js/quiz.js           the home-page quiz (questions and results are easy to edit)
  js/demos.js          the 4 Playbook demos
  js/algorithm.js      the "train a mini algorithm" toy on the YouTube page
  js/challenge.js      the 7-day checklist (saves with localStorage)
  js/feedback.js       sends the feedback form
  js/admin.js          the developer page: loads responses, Excel download, delete
  fonts/               Bricolage Grotesque + Atkinson Hyperlegible Next (free, SIL Open Font License)
  img/                 favicon, home-screen icon and the picture shown when someone shares a link
api/feedback.js        the small server function that saves and lists feedback
vercel.json            Vercel settings: security headers and font caching
robots.txt, sitemap.xml  help search engines find every page
```

## Put it online with Vercel (free)

1. Push this folder to a GitHub repository (it's already set up if you're reading this on GitHub).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with your GitHub account.
3. Find the repository in the list and click **Import**.
4. Leave the settings as they are: **Framework Preset: Other**, no build command, and the root folder as the output. Click **Deploy**.
5. After about a minute you get an address like `https://hooked-by-design.vercel.app`. You can change the name under **Settings → Domains**.

From then on, every change you push to the `main` branch goes live by itself, and every pull request gets its own preview link, so you can check changes before they go live.

**Moving from GitHub Pages?** Once the Vercel site works, switch GitHub Pages off so there's only one copy online: on GitHub, open the repository's **Settings → Pages** and set **Source** to **None** (or delete the Pages deployment).

To preview before uploading, just double-click `index.html` to open it in your browser. (The `404.html` page only works once the site is online.)

## Feedback: switch it on (once, about 2 minutes)

The feedback form saves answers in a small free database connected to the Vercel project. To switch it on:

1. In Vercel, open the project and go to the **Storage** tab. Choose **Create Database** (or **Browse Marketplace**), pick **Upstash for Redis**, choose the **Free** plan, and connect it to this project. Vercel adds the database's address and key to the project for you.
2. Go to **Settings → Environment Variables** and add `ADMIN_PASSWORD` with a password only your team knows.
3. Go to **Deployments**, open the menu (⋯) on the latest one and choose **Redeploy**, so the site picks up the new settings.

Then:

- Students and teachers fill in the form at **/feedback.html**. They can reach it from the round **feedback button** in the bottom-right corner of every page (on the home page it pops in and shows its label once), from every footer, and from the About page.
- Your team opens **/admin.html**, types the password, and sees every response, a short summary, and a **Download for Excel** button (a `.csv` file that opens in Excel or Google Sheets). Spam can be deleted there too.

The form is anonymous: it doesn't ask for names, and the database doesn't store names, emails or IP addresses. To stop the same person sending too many responses, a scrambled code made from their connection is kept for one hour and then deleted. Up to 5,000 responses are kept.

## Before you share it

- **Feedback:** switch it on as described above, then send a test response and check it appears on `/admin.html`.
- **If the address ever changes** (for example a custom domain): search all files for `hooked-by-design.vercel.app` and replace it with the new address. It appears in the `og:url`, `og:image` and `canonical` lines of every page, and in `robots.txt` and `sitemap.xml`. These tell WhatsApp, search engines and other apps where the site and its preview picture live.
- **Adding something from another website?** `vercel.json` tells browsers to block anything loaded from other websites (scripts, images, fonts, embeds). That keeps our “no requests to any other website” promise (the feedback form only talks to this site's own `/api/feedback`). If you ever embed something on purpose, such as a Google Form, add its address to the `Content-Security-Policy` line in `vercel.json`.

## Keeping it up to date

App menus change often. When you re-check the steps:

- Update the steps on `instagram.html`, `youtube.html` and `challenge.html`.
- Change "last checked October 2026" in the footer of every page and on `about.html`.

To edit any text, open the `.html` file in a text editor (VS Code, or GitHub's own editor: open the file on github.com and press the pencil icon), change the words between the tags, and save or commit. The quiz questions are in `assets/js/quiz.js`.

## Privacy

There are no cookies, analytics or accounts. Feedback answers are sent only when someone presses **Send feedback**, and they go to the project's own database (see above). In the browser, the only things stored are the 7-day challenge checklist (`localStorage`, key `hooked-by-design-challenge-v1`) and, if a visitor switches to dark mode, that choice (key `hooked-by-design-theme`). Both stay in the visitor's own browser and never leave their device. The "Clear my progress" button deletes the checklist, and switching back to light mode deletes the theme choice.

## Accessibility notes

- Works without sound, and every demo can be skipped or explained without being played.
- Keyboard friendly: skip link, visible focus outlines, real buttons and links.
- Animations are gentle and never loop forever. With "reduce motion" switched on, they're all turned off and everything appears straight away. Without JavaScript, nothing is hidden.
- Light by default, with a dark mode switch (the moon button in the header).
- Text contrast meets WCAG AA (checked with axe-core in light and dark mode, on phone and desktop sizes).

## Credits

Fonts: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) and [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next), both under the SIL Open Font License (see `assets/fonts/FONT-LICENSES.txt`).

The app pictures are original drawings. Instagram and YouTube are named only to describe their features; this site isn't affiliated with Meta or Google.
