import { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { regionalStats } from "../data/mock-regions";

// Stabilní CDN od Highcharts (TopoJSON pro ČR)
const GEO_URL = "https://code.highcharts.com/mapdata/countries/cz/cz-all.topo.json";

// Pomocná funkce pro odstranění diakritiky a sjednocení názvů
// Příklad: "Jihomoravský kraj" -> "jihomoravsky"
const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .replace(" kraj", "") // Odstraní " kraj"
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Odstraní háčky a čárky
    .replace("vysocina", "vysočina"); // Výjimka pro Vysočinu, pokud je třeba
};

export function CzechMap() {
  // Barevná škála: Červená (špatné/60) -> Zelená (dobré/95)
  const colorScale = scaleLinear<string>()
    .domain([60, 95])
    .range(["#ef4444", "#22c55e"]);

  // Mapování dat podle normalizovaného názvu
  const dataMap = useMemo(() => {
    const map = new Map();
    regionalStats.forEach(stat => {
      // Klíč bude např. "zlinsky"
      map.set(normalizeName(stat.region), stat);
    });
    return map;
  }, []);

  return (
    <Card className="h-[600px] w-full overflow-hidden bg-slate-50/50 shadow-md">
      <CardHeader>
        <CardTitle>Efektivita regionů na mapě</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [15.5, 49.8], // Střed ČR
            scale: 5500
          }}
          className="w-full h-full"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Highcharts mapa má název v `properties.name` (často bez diakritiky)
                // Musíme ho také normalizovat, aby seděl s naším klíčem
                const mapRegionName = geo.properties.name || "";
                const normalizedMapName = normalizeName(mapRegionName);

                const regionData = dataMap.get(normalizedMapName);

                // Pokud nemáme data, použijeme šedou. Pokud máme, škálujeme barvu.
                const fillColor = regionData ? colorScale(regionData.efficiencyScore) : "#e2e8f0";

                // Tooltip text
                const tooltipText = regionData
                  ? `${regionData.region}: ${regionData.avgDelay} dní`
                  : mapRegionName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth={1}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3b82f6", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    data-tooltip-id="region-tooltip"
                    data-tooltip-content={tooltipText}
                    title={tooltipText} // Fallback tooltip
                  />
                );
              })
            }
          </Geographies>

          {/* Markery pro krajská města (zůstávají stejné) */}
          {regionalStats.map((stat) => {
            let coords: [number, number] = [0, 0];
            // Upravená logika pro souřadnice
            if (stat.region.includes("Jihomoravský")) coords = [16.6068, 49.1951];
            if (stat.region.includes("Moravskoslezský")) coords = [18.2625, 49.8209];
            if (stat.region.includes("Olomoucký")) coords = [17.2517, 49.5938];
            if (stat.region.includes("Zlínský")) coords = [17.6667, 49.2167];

            if (coords[0] === 0) return null;

            return (
              <Marker key={stat.region} coordinates={coords}>
                <circle r={6} fill="#1e293b" stroke="#fff" strokeWidth={2} />
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{ fontFamily: "sans-serif", fill: "#334155", fontSize: "12px", fontWeight: "bold" }}
                >
                  {stat.avgDelay} dní
                </text>
              </Marker>
            )
          })}
        </ComposableMap>

        {/* Legenda vlevo dole */}
        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-lg shadow-md border text-sm">
          <div className="font-bold mb-2">Efektivita (Doba čekání)</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Vysoká (~110 dní)</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Nízká (~160 dní)</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 bg-slate-200 rounded"></div>
            <span>Bez dat</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}