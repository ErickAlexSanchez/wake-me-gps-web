import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
const files = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']
for (const density of densities) {
  for (const file of files) {
    const from = join('native-icons', `mipmap-${density}`, file)
    const to = join('android', 'app', 'src', 'main', 'res', `mipmap-${density}`, file)
    copyFileSync(from, to)
  }
}

const stringsPath = join('android', 'app', 'src', 'main', 'res', 'values', 'strings.xml')
const bytes = readFileSync(stringsPath)
try {
  new TextDecoder('utf-8', { fatal: true }).decode(bytes)
} catch {
  writeFileSync(stringsPath, new TextDecoder('windows-1252').decode(bytes), 'utf8')
}
