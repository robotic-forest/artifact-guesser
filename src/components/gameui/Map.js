import { centroids } from "@/lib/getProximity"
import { ComposableMap, Geographies, Geography, Annotation, ZoomableGroup, Marker } from "react-simple-maps"

export const Map = ({ selectedCountry, setSelectedCountry, setHover }) => {
  return (
    <ComposableMap width={800} height={480}>
      <ZoomableGroup center={[0, 0]} zoom={1}>
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

export const ArtefactMap = ({ artifacts, onClick, setHover }) => {

  return (
    <ComposableMap width={800} height={400}>
      <ZoomableGroup center={[0, 0]} zoom={1}>
        <Geographies geography="/features.json">
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                const artifactCount = artifacts?.find(a => a._id === geo.properties.name)?.count

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      onClick?.(geo.properties.name)
                    }}
                    onMouseOver={() => setHover({
                      name: geo.properties.name,
                      count: artifactCount || 0
                    })}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: {
                        outline: "none",
                        fill: "#5db293",
                        stroke: '#2d7a5e',
                        strokeWidth: 0.5,
                      },
                      hover: {
                        stroke: '#2d7a5e',
                        strokeWidth: 0.5,
                        fill: "#8ed2b9",
                        cursor: "pointer",
                        outline: "none"
                      },
                      pressed: {
                        fill: "#8ed2b9",
                        outline: "none"
                      }
                    }}
                  />
                )
              })}
              {geographies.map((geo) => {
                const centroid = centroids.find(c => c.name === geo.properties.name)
                const artifactCount = artifacts?.find(a => a._id === geo.properties.name)?.count

                return centroid && (
                  <Marker coordinates={[centroid.longitude, centroid.latitude]}>
                    <text css={{ fontSize: '0.4em',  }}>{artifactCount}</text>
                  </Marker>
                )
              })}
            </>
          )} 
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  )
}