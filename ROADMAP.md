# Roadmap

Features considered but deferred from v1.0. Pull requests welcome.

---

## Editor

### Drag-to-reorder options
Currently options inside a decision node are reordered with ↑/↓ buttons. A proper drag-and-drop handle (e.g. using the HTML5 Drag and Drop API or a library like `@dnd-kit/core`) would be faster for nodes with many options.

### Import from file
The editor always starts from the bundled `src/data/` files. A file-picker button that loads an existing `gramPositive.js` / `gramNegative.js` back into the editor would let teachers continue editing previously exported files without having to re-run `npm install` or copy files back manually.

### Inline ID display in node list
The left-hand node list shows only the label. Showing the raw node ID in small grey text below the label would make it easier to locate a node by ID without opening it — useful when managing large trees or debugging `nextId` references.

---

## Student App

### Condensed path summary / "how I got here" printout
When a student reaches a result, show a structured summary of every test performed and the answer chosen (drawn from the breadcrumb history). This would make a useful lab worksheet attachment and is more readable than the raw breadcrumb trail.

### Offline PWA / service worker
Wrap the student app as a Progressive Web App so it can be installed from the browser and works fully offline without needing the single-file build workflow.
