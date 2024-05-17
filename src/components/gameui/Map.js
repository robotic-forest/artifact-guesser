import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

export const Map = ({ selectedCountry, setSelectedCountry, setHover }) => {
  return (
    <ComposableMap>
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
                    fill: selectedCountry === geo.properties.name ? '#35ad8d' : "#eee",
                  },
                  hover: {
                    outline: "none",
                    fill: "#35ad8d",
                    cursor: "pointer",
                  },
                  pressed: {
                    fill: "#35ad8d",
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