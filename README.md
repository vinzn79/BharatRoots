# Indian Heritage Learning Hub

A static website (plain HTML, CSS and JavaScript, with no build step) about Indian history, festivals, geography, food, arts, values, kids' learning and newcomer guides.

## Publish on GitHub Pages
1. Create a new repository on GitHub (e.g. `indian-heritage-hub`).
2. Upload **everything in this folder** to the repository root (keep the `css`, `js`, `images` and `coloring` folders as they are), then commit.
3. In the repository go to **Settings → Pages**, set **Source** to `Deploy from a branch`, choose `main` and `/ (root)`, and click **Save**.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

Command-line alternative:
```
git init && git add . && git commit -m "Indian Heritage Learning Hub"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Files
| File | What it is |
|---|---|
| `index.html` | Home page: Hero introduction + How to use this page |
| `history.html` … `get-started.html` | Sections 3–12, linked from the orange sidebar |
| `css/style.css` | Colours, layout and mobile styles |
| `js/main.js` | Menu, festival tabs/filters, quizzes, stories, flashcards, colouring |
| `js/states.js` | State and union territory profiles for the map |
| `images/` | Original illustrations (SVG), including the lotus and peacock backgrounds |
| `coloring/` | Printable colouring sheets |

## Editing
- Change text directly in the `.html` files. The sidebar is repeated in each page, so if you rename a section, update it in every file.
- Colours are at the top of `css/style.css` (`--bg` is the yellow page, `--sidebar-top` / `--sidebar-bottom` the orange sidebar).
- Background-art strength: `.bg-art { opacity: 0.22; }` near the end of `style.css`.

## Device support
Responsive layout for Windows/Mac desktops, Android and iOS (iPhone/iPad): touch-sized buttons, slide-out menu on phones, notch-safe spacing, home-screen icon (`manifest.webmanifest`, `apple-touch-icon.png`), and system-font fallbacks for Indian scripts.

All illustrations are original artwork made for this site.
