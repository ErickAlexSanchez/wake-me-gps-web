import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const skip = new Set(['node_modules', 'dist', 'public', 'native-icons', '.git'])
const utf8 = new TextDecoder('utf-8', { fatal: true })
const cp1252 = new TextDecoder('windows-1252')

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx|css|md|html|mjs|json|svg)$/.test(name)) acc.push(full)
  }
  return acc
}

const fixes = [
  ['llegu\u009d', 'llegu\u00e9'],
  ['estaci\u009dn', 'estaci\u00f3n'],
  ['Buscando\u009d', 'Buscando\u2026'],
  ['conexi\u009dn', 'conexi\u00f3n'],
  ['t\u009dcalo', 't\u00f3calo'],
  ['Qu\u009d', 'Qu\u00e9'],
  ['tel\u009dfono', 'tel\u00e9fono'],
  ['pesta\u009da', 'pesta\u00f1a'],
  ['est\u009ds', 'est\u00e1s'],
  ['sonar\u009d', 'sonar\u00e1'],
  ['GPS\u009d', 'GPS\u2026'],
]

for (const file of walk('.')) {
  const bytes = readFileSync(file)
  try {
    utf8.decode(bytes)
    continue
  } catch {
    /* rewrite */
  }
  let text = cp1252.decode(bytes)
  for (const [from, to] of fixes) text = text.split(from).join(to)
  if (text.includes('\u009d')) console.log('STILL', file)
  writeFileSync(file, text, 'utf8')
  console.log('fixed', file)
}
