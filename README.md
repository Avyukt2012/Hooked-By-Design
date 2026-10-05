# Hooked by Design

A website that shows students how Instagram and YouTube are designed to hold their attention, why those features work, and how to switch them off or limit them.

A Service as Action project by Avyukt Aggarwal, Neal Nikhil Suman, Ashvathh Sinnha and Atharva Kushwaha (MYP 4A).

It's a plain static site: HTML, CSS and a little JavaScript. No frameworks, no build step, no tracking, and no requests to any other website (the fonts are included in the folder).

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

```
assets/
  css/style.css        all the styles (colours are at the top, under "Design tokens")
  js/site.js           the phone menu
  js/quiz.js           the home-page quiz (questions and results are easy to edit)
  js/demos.js          the 4 Playbook demos
  js/algorithm.js      the "train a mini algorithm" toy on the YouTube page
  js/challenge.js      the 7-day checklist (saves with localStorage)
  fonts/               Bricolage Grotesque + Atkinson Hyperlegible Next (free, SIL Open Font License)
  img/                 favicon and the picture shown when someone shares a link
```

## Put it online with GitHub Pages (free)

1. Sign in to github.com and create a **new repository**, for example `hooked-by-design`. Make it **Public**.
2. On the new repository page, choose **uploading an existing file**. Drag in **everything inside this folder** (the `.html` files, the `assets` folder, `README.md` and `.nojekyll`), not the folder itself. Click **Commit changes**.
   - `.nojekyll` is a hidden file. If you can't see it, it's fine to skip it.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, then **Save**.
4. Wait a minute or two and refresh. Your site's address appears at the top of the Pages settings, usually `https://YOUR-USERNAME.github.io/hooked-by-design/`.

To preview before uploading, just double-click `index.html` to open it in your browser.

## Before you share it

- **Feedback form:** open `about.html`, search for `REPLACE`, and paste your real form link (for example a Google Form) into the `href`.
- **Link preview picture (optional):** in every `.html` file, the `og:image` line uses a short path. Once the site is online, change it to the full address, e.g. `https://YOUR-USERNAME.github.io/hooked-by-design/assets/img/social-card.png`, so WhatsApp and other apps show the picture.

## Keeping it up to date

App menus change often. When you re-check the steps:

- Update the steps on `instagram.html`, `youtube.html` and `challenge.html`.
- Change "last checked October 2026" in the footer of every page and on `about.html`.

To edit any text, open the `.html` file in a text editor (VS Code, or GitHub's own editor: open the file on github.com and press the pencil icon), change the words between the tags, and save or commit. The quiz questions are in `assets/js/quiz.js`.

## Privacy

There are no cookies, analytics or accounts. The only thing stored is the 7-day challenge checklist, saved in the visitor's own browser (`localStorage`, key `hooked-by-design-challenge-v1`). It never leaves their device, and the "Clear my progress" button deletes it.

## Accessibility notes

- Works without sound, and every demo can be skipped or explained without being played.
- Keyboard friendly: skip link, visible focus outlines, real buttons and links.
- Respects "reduce motion" settings, and follows the phone's light or dark mode.
- Text contrast meets WCAG AA (checked with axe-core in light and dark mode).

## Credits

Fonts: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) and [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next), both under the SIL Open Font License (see `assets/fonts/FONT-LICENSES.txt`).

The app pictures are original drawings. Instagram and YouTube are named only to describe their features; this site isn't affiliated with Meta or Google.
