import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const skip = new Set(['node_modules', 'dist', 'public', 'native-icons', '.git'])

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx|css|md|html|mjs|json|svg)$/.test(name)) acc.push(full)
  }
  return acc
}

const map = new Map([
  [0x85, '...'],
  [0x93, '"'],
  [0x94, '"'],
  [0x97, '-'],
  [0x9d, '?'],
])

const seen = new Map()
for (const file of walk('.')) {
  const text = readFileSync(file, 'utf8')
  let next = ''
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    if (map.has(cp)) next += map.get(cp)
    else next += ch
    if (cp > 127) seen.set(cp, (seen.get(cp) ?? 0) + 1)
  }
  if (next !== text) writeFileSync(file, next, 'utf8')
}

console.log(
  [...seen.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cp, count]) => `U+${cp.toString(16)}:${count}`)
    .join(' '),
)
