function download(filename, content) {
  const blob = new Blob([content], { type: 'application/json' })
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
  if (!gramPosNodes.root) throw new Error("No 'root' node found in Gram Positive tree — cannot export.")
  if (!gramNegNodes.root) throw new Error("No 'root' node found in Gram Negative tree — cannot export.")
  download('gramPositive.json', JSON.stringify(gramPosNodes, null, 2))
  download('gramNegative.json', JSON.stringify(gramNegNodes, null, 2))
}
