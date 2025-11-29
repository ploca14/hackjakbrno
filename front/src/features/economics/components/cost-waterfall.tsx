import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { costComparison, totalIdeal, totalReal } from "../data/mock-costs";
import { Badge } from "@/components/ui/badge";

export function CostWaterfall() {
  const data = [
    {
      name: "Ideální průchod",
      ...costComparison.reduce(
        (acc, item) => ({ ...acc, [item.category]: item.idealCost }),
        {},
      ),
      total: totalIdeal,
    },
    {
      name: "Reálný (Komplikovaný)",
      ...costComparison.reduce(
        (acc, item) => ({ ...acc, [item.category]: item.realCost }),
        {},
      ),
      total: totalReal,
    },
  ];

  // Barvy pro jednotlivé kategorie nákladů
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analýza nákladů na pacienta (1 rok)</CardTitle>
          <Badge variant="destructive" className="px-3 py-1 text-lg">
            Ztráta: -{(totalReal - totalIdeal).toLocaleString()} Kč
          </Badge>
        </div>
        <CardDescription>
          Porovnání nákladů u pacienta s včasnou lázeňskou péčí vs. pacienta s
          rehospitalizací.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontWeight: "bold" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()} Kč`}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Legend />
            {costComparison.map((item, index) => (
              <Bar
                key={item.category}
                dataKey={item.category}
                stackId="a"
                fill={colors[index]}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
