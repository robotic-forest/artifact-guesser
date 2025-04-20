import { centroids } from "@/lib/getProximity";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

export const Map = ({ selectedCountry, setSelectedCountry, setHover, disabled }) => { // Added disabled prop
  return (
    <ComposableMap width={800} height={480} style={{ cursor: disabled ? 'not-allowed' : 'default' }}> {/* Add cursor style to map */}
      <ZoomableGroup center={[0, 0]} zoom={1}>
        <Geographies geography="/features.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                // Only allow click if not disabled
                onClick={() => !disabled && setSelectedCountry(geo.properties.name)}
                // Only allow hover effect if not disabled
                onMouseOver={() => !disabled && setHover(geo.properties.name)}
                onMouseLeave={() => setHover(null)} // Keep leave handler to clear hover state
                style={{
                  default: {
                    outline: "none",
                    fill: selectedCountry === geo.properties.name ? '#90d6f8' : "#eee",
                    // Add opacity if disabled
                    opacity: disabled ? 0.7 : 1,
                  },
                  hover: {
                    outline: "none",
                    // Only apply hover fill and cursor if not disabled
                    fill: disabled ? (selectedCountry === geo.properties.name ? '#90d6f8' : "#eee") : "#90d6f8",
                    cursor: disabled ? "not-allowed" : "pointer",
                  },
                  pressed: {
                    // Only apply pressed fill if not disabled
                    fill: disabled ? (selectedCountry === geo.properties.name ? '#90d6f8' : "#eee") : "#90d6f8",
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
  const sortedArtifacts = artifacts?.sort((a, b) => b.count - a.count)
  const highestCount = sortedArtifacts?.[0]?.count
  const lowestCount = 0

  const colorScale = (count, color1, color2) => {
    if (!count) return 'rgb(215, 215, 215)'
    if (count > highestCount) return `rgb(${color2[0]}, ${color2[1]}, ${color2[2]})`
    const scale = (count - lowestCount) / (highestCount - lowestCount)
    return `rgb(${color1[0] + scale * (color2[0] - color1[0])}, ${color1[1] + scale * (color2[1] - color1[1])}, ${color1[2] + scale * (color2[2] - color1[2])})`
  }

  return (
    <ComposableMap width={800} height={400}>
      <ZoomableGroup center={[0, 0]} zoom={1}>
        <Geographies geography="/features.json">
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                const artifactCount = artifacts?.find(a => a._id === geo.properties.name)?.count || 0
                const fill = colorScale(artifactCount, [175, 221, 204], [13, 120, 81])

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      artifactCount > 0 && onClick?.(geo.properties.name)
                    }}
                    onMouseOver={() => setHover({
                      name: geo.properties.name,
                      count: artifactCount
                    })}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: {
                        outline: "none",
                        fill,
                        stroke: '#2d7a5e',
                        strokeWidth: 0.5,
                      },
                      hover: {
                        stroke: '#2d7a5e',
                        strokeWidth: 0.5,
                        fill,
                        cursor: artifactCount === 0 ? null : "pointer",
                        outline: "none",
                        filter: artifactCount === 0 ? null : 'brightness(1.1)'
                      },
                      pressed: {
                        fill,
                        outline: "none",
                        filter: 'brightness(1.1)'
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
                    <text css={{ fontSize: '0.4em' }}>{artifactCount}</text>
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
