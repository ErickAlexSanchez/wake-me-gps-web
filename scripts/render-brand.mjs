import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(process.env.BRAND_NODE_PATH
  ? join(process.env.BRAND_NODE_PATH, 'package.json')
  : import.meta.url)
const { Resvg } = require('@resvg/resvg-js')
const { PNG } = require('pngjs')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const name = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, crc])
}

function rgbPng(png) {
  const { width, height, data } = png
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * 4
      const dst = row + 1 + x * 3
      const alpha = data[src + 3] / 255
      raw[dst] = Math.round(data[src] * alpha + 26 * (1 - alpha))
      raw[dst + 1] = Math.round(data[src + 1] * alpha + 36 * (1 - alpha))
      raw[dst + 2] = Math.round(data[src + 2] * alpha + 32 * (1 - alpha))
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function renderSvg(svgPath, width) {
  const svg = readFileSync(join(root, svgPath))
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' },
  })
  return PNG.sync.read(Buffer.from(resvg.render().asPng()))
}

function writeSized(svgPath, width, dest, opaque) {
  const png = renderSvg(svgPath, width)
  if (png.width !== width) throw new Error(`${dest} width ${png.width}`)
  mkdirSync(dirname(join(root, dest)), { recursive: true })
  const body = opaque ? rgbPng(png) : PNG.sync.write(png)
  writeFileSync(join(root, dest), body)
  return { dest, width: png.width, height: png.height, bytes: body.length }
}

const jobs = []
const icon = 'logos/concept-1-radio/icon.svg'
for (const [size, name] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [512, 'icon-maskable.png'], [180, 'apple-touch-icon.png']]) {
  jobs.push(writeSized(icon, size, `public/icons/${name}`, false))
}
for (const [folder, size] of [['mdpi', 48], ['hdpi', 72], ['xhdpi', 96], ['xxhdpi', 144], ['xxxhdpi', 192]]) {
  for (const file of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
    const dest = `native-icons/mipmap-${folder}/${file}`
    jobs.push(writeSized(icon, size, dest, false))
    const android = `android/app/src/main/res/mipmap-${folder}/${file}`
    mkdirSync(dirname(join(root, android)), { recursive: true })
    writeFileSync(join(root, android), readFileSync(join(root, dest)))
  }
}
jobs.push(writeSized(icon, 512, 'play-store/icon-512.png', false))
jobs.push(writeSized('logos/feature-graphic.svg', 1024, 'play-store/feature-graphic-1024x500.png', true))
for (const concept of ['concept-1-radio', 'concept-2-pulso', 'concept-3-w']) {
  jobs.push(writeSized(`logos/${concept}/icon.svg`, 512, `logos/${concept}/icon-512.png`, false))
}
jobs.push(writeSized('logos/concept-1-radio/horizontal.svg', 980, 'logos/concept-1-radio/horizontal.png', true))
jobs.push(writeSized('logos/concept-1-radio/vertical.svg', 640, 'logos/concept-1-radio/vertical.png', true))

for (const job of jobs) console.log(`${job.width}x${job.height} ${job.bytes} ${job.dest}`)
