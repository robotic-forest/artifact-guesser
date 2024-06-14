import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

export const Map = ({ selectedCountry, setSelectedCountry, setHover, zoomLevel }) => {
  let height
  let zoom

  switch (zoomLevel) {
    case 'fullscreen':
      height = 400
      zoom = 0.8
      break
    case 'medium':
      height = 920
      zoom = 2
      break
    default:
      height = 480
      zoom = 1
  }

  return (
    <ComposableMap width={800} height={height}>
      <ZoomableGroup center={[0,0]} zoom={zoom}>
        <Geographies geography="/features.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => setSelectedCountry(geo.properties.name)}
                onMouseOver={() => setHover(geo.properties.name)}
                onMouseLeave={() => setHover(null)}
                style={{
                  default: {
                    outline: "none",
                    fill: selectedCountry === geo.properties.name ? '#90d6f8' : "#eee",
                  },
                  hover: {
                    outline: "none",
                    fill: "#90d6f8",
                    cursor: "pointer",
                  },
                  pressed: {
                    fill: "#90d6f8",
                    outline: "none"
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  )
}