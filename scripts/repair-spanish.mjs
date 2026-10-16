import { readFileSync, writeFileSync } from 'node:fs'

function repair(file, pairs) {
  let text = readFileSync(file, 'latin1')
  for (const [from, to] of pairs) {
    if (!text.includes(from)) console.log('MISSING', file, JSON.stringify(from))
    text = text.split(from).join(to)
  }
  if (text.includes('\u009d')) console.log('LEFTOVER', file)
  writeFileSync(file, text, 'utf8')
}

const bad = '\u009d'

repair('src/state/AlarmProvider.tsx', [[`llegu${bad}`, 'llegu\u00e9']])

repair('src/ui/Ticket.tsx', [
  [`estaci${bad}n`, 'estaci\u00f3n'],
  [`Buscando${bad}`, 'Buscando...'],
  [`conexi${bad}n`, 'conexi\u00f3n'],
  [`t${bad}calo`, 't\u00f3calo'],
  [`Qu${bad}`, 'Qu\u00e9'],
  [`tel${bad}fono`, 'tel\u00e9fono'],
  [`pesta${bad}a`, 'pesta\u00f1a'],
  [`est${bad}s`, 'est\u00e1s'],
  [`sonar${bad}`, 'sonar\u00e1'],
  [`GPS${bad}`, 'GPS...'],
])
