import { readFileSync, writeFileSync } from 'node:fs'

const file = 'src/state/AlarmProvider.tsx'
let text = readFileSync(file, 'utf8')
const before = text
text = text.replace(
  '  const initialAlarm = useRef(loadAlarm())\n  const [alarm, setAlarm] = useState<StoredAlarm | null>(initialAlarm.current)\n',
  '  const [alarm, setAlarm] = useState<StoredAlarm | null>(() => loadAlarm())\n',
)
text = text.replace('    const stored = initialAlarm.current\n', '    const stored = loadAlarm()\n')
if (text === before) {
  console.log('no change')
  process.exit(1)
}
writeFileSync(file, text, 'utf8')
console.log('patched')
