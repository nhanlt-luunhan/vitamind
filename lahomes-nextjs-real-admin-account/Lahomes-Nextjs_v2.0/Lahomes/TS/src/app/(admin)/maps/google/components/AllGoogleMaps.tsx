'use client'
import ComponentContainerCard from '@/components/ComponentContainerCard'
import UIExamplesList from '@/components/UIExamplesList'
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, ControlPosition } from '@vis.gl/react-google-maps'
import { useRef, useState } from 'react'
import { Col, Row } from 'react-bootstrap'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

const BasicMap = () => {
  return (
    <ComponentContainerCard
      id="basic_google_map"
      title="Basic Example"
      description={
        <>
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <APIProvider apiKey={API_KEY}>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <Map
            zoom={14}
            defaultCenter={{ lat: 21.569874, lng: 71.5893798 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            zoomControlOptions={{
              position: ControlPosition.LEFT_TOP,
            }}></Map>
        </div>
      </APIProvider>
    </ComponentContainerCard>
  )
}

const MapWithMarkers = () => {
  const [showInfo, setShowInfo] = useState(false)
  const [infoPosition, setInfoPosition] = useState<any>(null)
  const [infoText, setInfoText] = useState('')

  const onBasicMarkerClick = () => {
    alert('You clicked this marker')
  }

  const onMarkerClick = (title: string, position: { lat: number; lng: number }) => {
    setInfoText(title)
    setInfoPosition(position)
    setShowInfo(true)
  }

  return (
    <ComponentContainerCard
      id="google_map"
      title="Markers Google Map"
      description={
        <>
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <div className="gmaps" style={{ position: 'relative', overflow: 'hidden', height: 400 }}>
        <APIProvider apiKey={API_KEY}>
          <Map defaultZoom={18} defaultCenter={{ lat: 21.569874, lng: 71.5893798 }} style={{ width: '100%', height: '100%' }}>
            <AdvancedMarker position={{ lat: 21.569874, lng: 71.5893798 }} onClick={onBasicMarkerClick}>
              <Pin />
            </AdvancedMarker>

            <AdvancedMarker
              position={{ lat: 21.56969, lng: 71.5893798 }}
              onClick={() => onMarkerClick('Current Location', { lat: 21.56969, lng: 71.5893798 })}>
              <Pin background="blue" />
            </AdvancedMarker>

            {showInfo && (
              <InfoWindow position={infoPosition} onCloseClick={() => setShowInfo(false)}>
                <div>
                  <p>{infoText}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </ComponentContainerCard>
  )
}

const StreetViewMap = () => {
  let mapRef: any = useRef()

  /**
   * Activate the street view
   */
  const activateStreetView = (position: { lat: number; lng: number }) => {
    if (mapRef) {
      const mapObj = mapRef.map.getStreetView()
      mapObj.setPov({ heading: 34, pitch: 10 })
      mapObj.setPosition(position)
      mapObj.setVisible(true)
    }
  }

  return (
    <ComponentContainerCard
      id="street_view"
      title="Street View Panoramas Google Map"
      description={
        <>
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
        <APIProvider apiKey={API_KEY}>
          <Map
            zoom={14}
            mapId={'streetview'}
            defaultCenter={{ lat: 40.7295174, lng: -73.9986496 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            streetViewControl={true}></Map>
        </APIProvider>
      </div>
    </ComponentContainerCard>
  )
}

const PolyLineMap = () => {
  const polyline = [
    { lat: 37.789411, lng: -122.422116 },
    { lat: 37.785757, lng: -122.421333 },
    { lat: 37.789352, lng: -122.415346 },
  ]
  return (
    <ComponentContainerCard
      id="poly_line"
      title="PolyLine Google Map"
      description={
        <>
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
        <APIProvider apiKey={API_KEY}>
          <Map
            className="map"
            style={{ height: '100%', position: 'relative', width: '100%' }}
            zoom={14}
            zoomControlOptions={{
             position: ControlPosition.LEFT_TOP
            }}>
            <svg style={{ display: 'none' }}>
              <polyline id="polyLinePath" points={polyline.map((p) => `${p.lng},${p.lat}`).join(' ')} />
            </svg>
          </Map>
        </APIProvider>
      </div>
    </ComponentContainerCard>
  )
}

const LightStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 18 }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 16 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#dedede' }, { lightness: 21 }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
    },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#f2f2f2' }, { lightness: 19 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#fefefe' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }],
    },
  ]
  return (
    <ComponentContainerCard
      id="ultra_light"
      title="Ultra Light With Labels"
      description={
        <>
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={{ lat: -12.043333, lng: -77.028333 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            styles={mapStyles}
            zoomControlOptions={{
             position: ControlPosition.LEFT_TOP
            }}></Map>
        </APIProvider>
      </div>
    </ComponentContainerCard>
  )
}

const DarkStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#000000' }, { lightness: 40 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#c4c4c4' }],
    },
    {
      featureType: 'administrative.neighborhood',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 21 }, { visibility: 'on' }],
    },
    {
      featureType: 'poi.business',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#e5c163' }, { lightness: '0' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ color: '#575757' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#999999' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 17 }],
    },
  ]
  return (
    <ComponentContainerCard
      id="dark_view"
      title="Dark"
      description={
        <>
          {' '}
          Give textual form controls like <code>&lt;input&gt;</code>s and <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus
          states, and more.
        </>
      }>
      <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={{ lat: -12.043333, lng: -77.028333 }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
            styles={mapStyles}
            zoomControlOptions={{
             position: ControlPosition.LEFT_TOP
            }}></Map>
        </APIProvider>
      </div>
    </ComponentContainerCard>
  )
}

const AllGoogleMaps = () => {
  return (
    <Row>
      <Col xl={9}>
        <BasicMap />
        <MapWithMarkers />
        <StreetViewMap />
        <PolyLineMap />
        <LightStyledMap />
        <DarkStyledMap />
      </Col>

      <Col xl={3}>
        <UIExamplesList
          examples={[
            { link: '#basic_google_map', label: 'Basic' },
            { link: '#google_map', label: 'Markers Google Map' },
            { link: '#street_view', label: 'Street View Panoramas Google Map' },
            { link: '#poly_line', label: 'PolyLine Google Map' },
            { link: '#ultra_light', label: 'Ultra Light With Labels' },
            { link: '#dark_view', label: 'Dark' },
          ]}
        />
      </Col>
    </Row>
  )
}

export default AllGoogleMaps
