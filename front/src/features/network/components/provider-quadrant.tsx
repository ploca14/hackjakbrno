import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ZAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { providerPerformance, getTypeColor } from "../data/mock-providers";

export function ProviderQuadrant() {
  return (
    <Card className="h-[600px] w-full shadow-md">
      <CardHeader>
        <CardTitle>Matice efektivity poskytovatelů</CardTitle>
        <CardDescription>
          Vztah mezi následnou péčí (Lázně) a kvalitou výsledku
          (Rehospitalizace).
          <br />
          <span className="text-muted-foreground text-xs">
            Osa X: % Pacientů odeslaných do lázní (Více je lépe) | Osa Y: %
            Rehospitalizací do 30 dnů (Méně je lépe)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />

            {/* Osa X: Lázně */}
            <XAxis
              type="number"
              dataKey="spaRate"
              name="Odesláno do lázní"
              unit="%"
              domain={[0, 60]}
              label={{
                value: "Využití lázní (%)",
                position: "bottom",
                offset: 0,
              }}
            />

            {/* Osa Y: Komplikace (Rehospitalizace) */}
            <YAxis
              type="number"
              dataKey="complicationRate"
              name="Míra komplikací"
              unit="%"
              domain={[0, 30]}
              label={{
                value: "Rehospitalizace (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />

            {/* Velikost bubliny podle objemu pacientů */}
            <ZAxis
              type="number"
              dataKey="volume"
              range={[100, 1000]}
              name="Počet pacientů"
            />

            {/* Tooltip */}
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded border bg-white p-3 text-sm shadow-lg">
                      <p className="mb-1 font-bold">{data.name}</p>
                      <p className="text-blue-600">Lázně: {data.spaRate} %</p>
                      <p className="text-red-600">
                        Rehospitalizace: {data.complicationRate} %
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Pacientů: {data.volume}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Hranice kvadrantů (Průměry) */}
            <ReferenceLine x={25} stroke="#94a3b8" strokeDasharray="3 3">
              <Label
                value="Průměr lázní"
                position="insideTopRight"
                fill="#94a3b8"
                fontSize={12}
              />
            </ReferenceLine>
            <ReferenceLine y={12} stroke="#94a3b8" strokeDasharray="3 3">
              <Label
                value="Průměr komplikací"
                position="insideBottomRight"
                fill="#94a3b8"
                fontSize={12}
              />
            </ReferenceLine>

            {/* Popisky oblastí */}
            <ReferenceLine
              segment={[
                { x: 50, y: 2 },
                { x: 50, y: 2 },
              ]}
              label={{
                value: "LÍDŘI KVALITY",
                position: "top",
                fill: "#16a34a",
                fontWeight: "bold",
              }}
            />
            <ReferenceLine
              segment={[
                { x: 5, y: 25 },
                { x: 5, y: 25 },
              ]}
              label={{
                value: "PROBLÉMOVÍ",
                position: "top",
                fill: "#dc2626",
                fontWeight: "bold",
              }}
            />

            <Scatter name="Nemocnice" data={providerPerformance} fill="#8884d8">
              {providerPerformance.map((entry, index) => (
                <cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
