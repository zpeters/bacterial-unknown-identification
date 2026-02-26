// Shared utility functions for bacterial identification trees.

export function getStepsRemaining(nodes, nodeId, cache = {}) {
  if (cache[nodeId] !== undefined) return cache[nodeId];
  const node = nodes[nodeId];
  if (!node || node.type === 'result') {
    cache[nodeId] = { min: 0, max: 0 };
    return cache[nodeId];
  }
  let minSteps = Infinity;
  let maxSteps = 0;
  for (const opt of node.options) {
    const child = getStepsRemaining(nodes, opt.nextId, cache);
    minSteps = Math.min(minSteps, child.min + 1);
    maxSteps = Math.max(maxSteps, child.max + 1);
  }
  cache[nodeId] = { min: minSteps, max: maxSteps };
  return cache[nodeId];
}

export function getMaxSteps(nodes) {
  return getStepsRemaining(nodes, 'root').max;
}

export function getEdges(nodes) {
  const edges = [];
  Object.values(nodes).forEach((node) => {
    if (node.options) {
      node.options.forEach((opt, i) => {
        edges.push({
          id: `${node.id}-${opt.nextId}-${i}`,
          source: node.id,
          target: opt.nextId,
          label: opt.label,
        });
      });
    }
  });
  return edges;
}

// Factory: returns (nodeId) => {min, max} with nodes pre-bound and a persistent cache.
export function createStepsRemainingFn(nodes) {
  const cache = {};
  return (nodeId) => getStepsRemaining(nodes, nodeId, cache);
}

// Factory: returns () => edges[] with nodes pre-bound.
export function createEdgesFn(nodes) {
  return () => getEdges(nodes);
}
