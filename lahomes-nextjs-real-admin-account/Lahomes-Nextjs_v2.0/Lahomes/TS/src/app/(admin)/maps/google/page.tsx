import type { Metadata } from 'next'
import AllGoogleMaps from './components/AllGoogleMaps'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Google Maps' }

const GoogleMaps = () => {
  return <AllGoogleMaps />
}

export default GoogleMaps
