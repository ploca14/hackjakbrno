import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Activity } from "lucide-react";
import type { RegionStat } from "@/features/regional/data/mock-regions.ts";

export function RegionalScorecard({ data }: { data: RegionStat }) {
  const isLagging = data.avgDelay > 150;
  const isTop = data.efficiencyScore > 90;

  return (
    <Card className={`overflow-hidden border-l-4 ${isTop ? 'border-l-green-500' : isLagging ? 'border-l-red-500' : 'border-l-blue-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{data.region}</CardTitle>
          {isTop && <Badge className="bg-green-600">Lídr efektivity</Badge>}
          {isLagging && <Badge variant="destructive">Zpoždění péče</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Hlavní metriky */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400"/>
            <span className="font-semibold">{data.totalPatients.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">pacientů</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400"/>
            <span className="font-semibold">{data.spaRate}%</span>
            <span className="text-muted-foreground text-xs">do lázní</span>
          </div>
        </div>

        {/* Klíčová metrika: Čas */}
        <div className="bg-slate-50 p-3 rounded-md border">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Průměrná doba nástupu</span>
            <span className={`font-bold ${isLagging ? 'text-red-600' : 'text-slate-900'}`}>
                    {data.avgDelay} dní
                </span>
          </div>
          {/* Vizuální bar (180 dní max jako baseline) */}
          <Progress value={(data.avgDelay / 180) * 100} className={`h-2 ${isLagging ? 'bg-red-100' : ''}`} />
          {isLagging && <p className="text-xs text-red-600 mt-1 font-medium">Kritické zpoždění oproti Zlínu (+51 dní)</p>}
        </div>

      </CardContent>
    </Card>
  );
}