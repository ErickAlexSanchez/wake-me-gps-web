import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist/privacidad', { recursive: true })
copyFileSync('dist/index.html', 'dist/privacidad/index.html')
