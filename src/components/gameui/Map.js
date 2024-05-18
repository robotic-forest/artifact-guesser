import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

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