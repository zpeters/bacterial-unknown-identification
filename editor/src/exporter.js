// Escapes single quotes and backslashes for JS string literals
function esc(str) {
  if (!str) return ''
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function serializeNode(node) {
  const lines = []
  lines.push(`  '${esc(node.id)}': {`)
  lines.push(`    id: '${esc(node.id)}',`)
  lines.push(`    type: '${esc(node.type)}',`)
  lines.push(`    label: '${esc(node.label)}',`)
  lines.push(`    description: '${esc(node.description)}',`)

  if (node.type === 'decision') {
    lines.push(`    question: '${esc(node.question)}',`)
    lines.push(`    options: [`)
    for (const opt of (node.options || [])) {
      lines.push(`      { label: '${esc(opt.label)}', nextId: '${esc(opt.nextId)}' },`)
    }
    lines.push(`    ],`)
  } else {
    lines.push(`    organism: '${esc(node.organism)}',`)
  }

  lines.push(`  },`)
  return lines.join('\n')
}

const BOILERPLATE = `
// ─── Steps remaining calculator ──────────────────────────────────────────────
const _stepsCache = {};
export function getStepsRemaining(nodeId) {
  if (_stepsCache[nodeId] !== undefined) return _stepsCache[nodeId];
  const node = nodes[nodeId];
  if (!node || node.type === 'result') {
    _stepsCache[nodeId] = { min: 0, max: 0 };
    return _stepsCache[nodeId];
  }
  let minSteps = Infinity;
  let maxSteps = 0;
  for (const opt of node.options) {
    const child = getStepsRemaining(opt.nextId);
    minSteps = Math.min(minSteps, child.min + 1);
    maxSteps = Math.max(maxSteps, child.max + 1);
  }
  _stepsCache[nodeId] = { min: minSteps, max: maxSteps };
  return _stepsCache[nodeId];
}

// Max possible steps from root (used to anchor progress bar)
export const MAX_STEPS = getStepsRemaining('root').max;

// ─── Edge list for React Flow ─────────────────────────────────────────────────
export function getEdges() {
  const edges = [];
  Object.values(nodes).forEach((node) => {
    if (node.options) {
      node.options.forEach((opt, i) => {
        edges.push({
          id: \`\${node.id}-\${opt.nextId}-\${i}\`,
          source: node.id,
          target: opt.nextId,
          label: opt.label,
        });
      });
    }
  });
  return edges;
}
`

function generateFileContent(nodes, treeVar, comment) {
  if (!nodes.root) throw new Error(`No 'root' node found — cannot export.`)

  const root = nodes.root
  const rootLines = []

  // Root export (tree reference)
  rootLines.push(`// ${comment}`)
  rootLines.push(`// Each node is either a 'decision' (test) or 'result' (organism identified)`)
  rootLines.push(``)
  rootLines.push(`export const ${treeVar} = {`)
  rootLines.push(`  id: '${esc(root.id)}',`)
  rootLines.push(`  type: '${esc(root.type)}',`)
  rootLines.push(`  label: '${esc(root.label)}',`)
  rootLines.push(`  description: '${esc(root.description)}',`)
  if (root.type === 'decision') {
    rootLines.push(`  question: '${esc(root.question)}',`)
    rootLines.push(`  options: [`)
    for (const opt of (root.options || [])) {
      rootLines.push(`    { label: '${esc(opt.label)}', nextId: '${esc(opt.nextId)}' },`)
    }
    rootLines.push(`  ],`)
  } else {
    rootLines.push(`  organism: '${esc(root.organism)}',`)
  }
  rootLines.push(`};`)
  rootLines.push(``)

  // Node map
  rootLines.push(`// Full node map (id → node) for O(1) lookup`)
  rootLines.push(`export const nodes = {`)
  rootLines.push(`  root: ${treeVar},`)
  rootLines.push(``)

  for (const [id, node] of Object.entries(nodes)) {
    if (id === 'root') continue
    rootLines.push(serializeNode(node))
    rootLines.push(``)
  }

  rootLines.push(`};`)
  rootLines.push(BOILERPLATE)

  return rootLines.join('\n')
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportBoth(gramPosNodes, gramNegNodes) {
  const posContent = generateFileContent(
    gramPosNodes,
    'gramPositiveTree',
    'Gram Positive Bacterial Identification Flowchart Data'
  )
  const negContent = generateFileContent(
    gramNegNodes,
    'gramNegativeTree',
    'Gram Negative Bacterial Identification Flowchart Data'
  )
  download('gramPositive.js', posContent)
  download('gramNegative.js', negContent)
}
