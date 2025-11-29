import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  Label,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const generateMockData = () => {
  const data = [];

  for (let i = 0; i < 45; i++) {
    const days = Math.floor(Math.random() * 20) + 2;
    const costIndex = days * 10 + Math.floor(Math.random() * 50);

    data.push({
      id: 1000 + i,
      x: days,
      y: costIndex,
      z: 1,
      type: "normal",
      name: `Pacient ${1000 + i}`,
    });
  }

  const anomalies = [
    {
      id: 9901,
      x: 3,
      y: 350,
      type: "anomaly",
      name: "Pacient 9901 (High Cost/Short Stay)",
    },
    {
      id: 9902,
      x: 2,
      y: 280,
      type: "anomaly",
      name: "Pacient 9902 (High Cost/Short Stay)",
    },
    {
      id: 9903,
      x: 45,
      y: 120,
      type: "anomaly",
      name: "Pacient 9903 (Low Cost/Long Stay)",
    },
    {
      id: 9904,
      x: 5,
      y: 400,
      type: "anomaly",
      name: "Pacient 9904 (Extreme Intensity)",
    },
  ];

  return [...data, ...anomalies];
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
        <p className="text-sm font-bold">{data.name}</p>
        <p className="text-muted-foreground text-xs">
          Délka hosp.:{" "}
          <span className="text-foreground font-mono">{data.x} dní</span>
        </p>
        <p className="text-muted-foreground text-xs">
          Index nákladů:{" "}
          <span className="text-foreground font-mono">{data.y}</span>
        </p>
        {data.type === "anomaly" && (
          <p className="text-destructive mt-1 text-xs font-bold">
            ⚠️ Detekována anomálie
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const AnomalyScatterPlot = () => {
  const data = useMemo(() => generateMockData(), []);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Analýza délky hospitalizace vs. Náklady</CardTitle>
        <CardDescription>
          Každý bod představuje jednoho pacienta.{" "}
          <span className="text-destructive font-bold">Červené body</span> značí
          odchylky od běžného standardu péče.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="x"
                name="Délka hospitalizace"
                unit=" dní"
                stroke="#888888"
                fontSize={12}
              >
                <Label
                  value="Délka hospitalizace (dny)"
                  offset={-10}
                  position="insideBottom"
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                name="Nákladovost"
                stroke="#888888"
                fontSize={12}
              >
                <Label
                  value="Index nákladovosti / Výkony"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter name="Pacienti" data={data} fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.type === "anomaly" ? "#ef4444" : "#3b82f6"}
                    stroke={
                      entry.type === "anomaly" ? "#7f1d1d" : "transparent"
                    }
                    strokeWidth={entry.type === "anomaly" ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
