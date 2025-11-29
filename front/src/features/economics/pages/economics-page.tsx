import { CostWaterfall } from "../components/cost-waterfall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingDown } from "lucide-react";

export function EconomicsPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Ekonomika Zdraví
        </h1>
        <p className="text-muted-foreground text-lg">
          Kvantifikace finančních dopadů diskontinuity péče v modelu DRG.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CostWaterfall />
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="text-red-500" />
                Cost Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-500">+140 %</div>
              <p className="mt-2 text-slate-400">
                Nárůst nákladů při selhání návazné péče. Hlavním faktorem je{" "}
                <strong>septická rehospitalizace</strong> (J02).
              </p>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <strong>Strategický dopad:</strong>
                <p className="mt-1">
                  Investice 35 000 Kč do lázní preventuje náklad 120 000 Kč na
                  rehospitalizaci.
                  <strong>ROI = 3.4x</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
