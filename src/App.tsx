import { BrowserRouter } from 'react-router-dom'
import { AlarmProvider } from './state/AlarmProvider.tsx'
import { Shell } from './ui/Shell.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <AlarmProvider>
        <Shell />
      </AlarmProvider>
    </BrowserRouter>
  )
}
