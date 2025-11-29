import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
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
import { timingAnalysis } from "../data/mock-timing";

export function TimingImpactChart() {
  return (
    <Card className="h-[500px] border-t-4 border-t-blue-600 shadow-lg">
      <CardHeader>
        <CardTitle>Dopad odkladu péče na rehospitalizace</CardTitle>
        <CardDescription>
          Analýza ukazuje bod zlomu (Break-even point). Pokud pacient nenastoupí
          do <strong>60 dnů</strong>, riziko komplikací se zdvojnásobuje.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={timingAnalysis}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
            <XAxis dataKey="days" scale="band" />

            {/* Osa Y pro počet pacientů (Levá) */}
            <YAxis
              yAxisId="left"
              label={{
                value: "Počet pacientů",
                angle: -90,
                position: "insideLeft",
              }}
            />

            {/* Osa Y pro Riziko (Pravá) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Riziko rehospitalizace (%)",
                angle: 90,
                position: "insideRight",
              }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} />

            {/* Zvýraznění kritické zóny */}
            <ReferenceLine
              x="46-60"
              stroke="red"
              strokeDasharray="3 3"
              yAxisId="left"
              label="Bod Zlomu"
            />

            {/* Grafy */}
            <Bar
              yAxisId="left"
              dataKey="patients"
              name="Počet pacientů"
              barSize={40}
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="riskRate"
              name="Riziko (%)"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
