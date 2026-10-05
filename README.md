# Hooked by Design

A website that shows students how Instagram and YouTube are designed to hold their attention, why those features work, and how to switch them off or limit them.

A Service as Action project by Avyukt Aggarwal, Neal Nikhil Suman, Ashvathh Sinnha and Atharva Kushwaha (MYP 4A).

It's a plain static site: HTML, CSS and a little JavaScript. No frameworks, no build step, no tracking, and no requests to any other website (the fonts are included in the folder). It's hosted on [Vercel](https://vercel.com).

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
  fonts/               Bricolage Grotesque + Atkinson Hyperlegible Next (free, SIL Open Font License)
  img/                 favicon, home-screen icon and the picture shown when someone shares a link
vercel.json            Vercel settings: security headers and font caching
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

## Before you share it

- **Feedback form:** open `about.html`, search for `REPLACE`, and paste your real form link (for example a Google Form) into the `href`.
- **Link preview picture (optional):** in every `.html` file, the `og:image` line uses a short path. Once the site is online, change it to the full address, e.g. `https://hooked-by-design.vercel.app/assets/img/social-card.png` (use your real Vercel address), so WhatsApp and other apps show the picture.
- **Adding something from another website?** `vercel.json` tells browsers to block anything loaded from other websites (scripts, images, fonts, embeds). That keeps our “no requests to any other website” promise. If you ever embed something on purpose, such as a Google Form, add its address to the `Content-Security-Policy` line in `vercel.json`.

## Keeping it up to date

App menus change often. When you re-check the steps:

- Update the steps on `instagram.html`, `youtube.html` and `challenge.html`.
- Change "last checked October 2026" in the footer of every page and on `about.html`.

To edit any text, open the `.html` file in a text editor (VS Code, or GitHub's own editor: open the file on github.com and press the pencil icon), change the words between the tags, and save or commit. The quiz questions are in `assets/js/quiz.js`.

## Privacy

There are no cookies, analytics or accounts. The only things stored are the 7-day challenge checklist (`localStorage`, key `hooked-by-design-challenge-v1`) and, if a visitor switches to dark mode, that choice (key `hooked-by-design-theme`). Both stay in the visitor's own browser and never leave their device. The "Clear my progress" button deletes the checklist, and switching back to light mode deletes the theme choice.

## Accessibility notes

- Works without sound, and every demo can be skipped or explained without being played.
- Keyboard friendly: skip link, visible focus outlines, real buttons and links.
- Animations are gentle and never loop forever. With "reduce motion" switched on, they're all turned off and everything appears straight away. Without JavaScript, nothing is hidden.
- Light by default, with a dark mode switch (the moon button in the header).
- Text contrast meets WCAG AA (checked with axe-core in light and dark mode, on phone and desktop sizes).

## Credits

Fonts: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) and [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next), both under the SIL Open Font License (see `assets/fonts/FONT-LICENSES.txt`).

The app pictures are original drawings. Instagram and YouTube are named only to describe their features; this site isn't affiliated with Meta or Google.
