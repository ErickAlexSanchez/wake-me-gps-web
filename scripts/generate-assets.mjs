import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function tone(name, sampleAt) {
  const rate = 22050
  const seconds = 2.4
  const count = Math.floor(rate * seconds)
  const samples = new Float32Array(count)
  for (let i = 0; i < count; i += 1) samples[i] = sampleAt(i / rate)
  const dataSize = count * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(rate, 24)
  buffer.writeUInt32LE(rate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < count; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE((sample * 32767) | 0, 44 + i * 2)
  }
  const path = join(root, 'public', 'tones', `${name}.wav`)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, buffer)
}

const env = (t, start, length) => {
  const local = t - start
  if (local < 0 || local > length) return 0
  return Math.sin((Math.PI * local) / length) ** 2
}

tone('campana', (t) => {
  const hit = (start) => env(t, start, 0.55) * (Math.sin(2 * Math.PI * 880 * t) * 0.45 + Math.sin(2 * Math.PI * 1320 * t) * 0.2)
  return hit(0.05) + hit(0.8) + hit(1.55)
})

tone('pulso', (t) => {
  const beep = (start) => env(t, start, 0.12) * Math.sin(2 * Math.PI * 740 * t)
  return beep(0.1) + beep(0.42) + beep(0.74) + beep(1.2) + beep(1.52) + beep(1.84)
})

tone('sirena', (t) => {
  const freq = 460 + Math.sin(2 * Math.PI * 0.8 * t) * 180
  const phase = 2 * Math.PI * freq * t
  return Math.sin(phase) * 0.45 * env(t, 0, 2.3)
})

tone('clasico', (t) => {
  const high = Math.floor(t / 0.28) % 2 === 0
  const freq = high ? 660 : 494
  return Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.28 * env(t, 0, 2.3)
})

