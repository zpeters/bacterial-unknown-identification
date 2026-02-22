# Bacterial Unknown Identification App

An interactive decision-tree wizard for microbiology lab students to identify Gram-positive and Gram-negative bacteria through a series of biochemical tests.

**Live app:** https://zpeters.github.io/bacterial-unknown-identification/

---

## For Teachers: Editing the Decision Trees

The `editor/` folder is a standalone visual editor. Use it to add, edit, or delete nodes in the identification trees without touching raw JavaScript.

### One-time setup

```sh
cd editor
npm install
```

### Editing workflow

1. **Start the editor**
   ```sh
   cd editor
   npm run dev
   ```
   Open http://localhost:5173 in your browser.

2. **Edit the tree**
   - Use the **Gram Positive / Gram Negative** toggle in the header to switch trees
   - Click a node in the left list or in the preview panel to select it
   - Edit fields (label, description, question, options) in the center form
   - Use **+ Add** to create a new node, then wire it up via an existing node's options
   - The orange bar at the top shows any errors (broken references, missing options) in real time

3. **Export**
   Click **Export JS Files** in the header. Your browser will download:
   - `gramPositive.js`
   - `gramNegative.js`

4. **Drop the files in**
   Move the downloaded files into `src/data/`, replacing the old ones:
   ```
   src/data/gramPositive.js
   src/data/gramNegative.js
   ```

5. **Build and verify**
   From the project root:
   ```sh
   npm run build:single
   ```
   Open `dist/index.html` directly in your browser (no server needed) to confirm everything looks right.

6. **Publish** — see below.

---

## Publishing to GitHub Pages

Pushing to the `main` branch automatically triggers a GitHub Actions build and deploys the app to https://zpeters.github.io/bacterial-unknown-identification/.

```sh
jj commit -m "Update decision tree: <brief description>"
jj git push --remote github
```

The deploy usually completes within a minute or two. You can watch progress at:
https://github.com/zpeters/bacterial-unknown-identification/actions

### What the CI does

On every push to `main`, GitHub Actions runs `npm run build` (the standard chunked build) and deploys `dist/` to GitHub Pages. No manual upload needed.

---

## Distributing a Standalone File to Students

`npm run build:single` produces a single `dist/index.html` with all JavaScript and CSS inlined. Students can open it directly from their desktop — no internet connection or server required.

```sh
npm run build:single
# → dist/index.html  (~500 KB, fully self-contained)
```

---

## Project Structure

```
├── src/
│   ├── data/
│   │   ├── gramPositive.js   ← edit via the editor, not by hand
│   │   └── gramNegative.js
│   └── components/
│       ├── Wizard.jsx        ← step-through identification UI
│       └── FlowChart.jsx     ← interactive tree diagram
├── editor/                   ← teacher-facing visual editor (separate app)
│   └── src/
│       ├── App.jsx
│       ├── exporter.js
│       └── components/
│           ├── NodeList.jsx
│           ├── NodeForm.jsx
│           ├── TreePreview.jsx
│           └── Validation.jsx
├── vite.config.js            ← conditional singlefile mode
└── .github/workflows/        ← auto-deploy to GitHub Pages on push to main
```
