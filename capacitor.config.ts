import type { CapacitorConfig } from '@capacitor/cli'

const devUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: 'app.yallegue.despertador',
  appName: 'WakeMeGPS',
  webDir: 'dist',
  ...(devUrl ? { server: { url: devUrl, cleartext: devUrl.startsWith('http:') } } : {}),
}

export default config
