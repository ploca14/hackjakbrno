import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider
import { Activity, DollarSign, TrendingDown } from "lucide-react";
import { calculateImpact } from "../data/simulation-engine";
import { Progress } from "@/components/ui/progress";

export function SimulationPage() {
  const [spaIncrease, setSpaIncrease] = useState([0]); // 0 to 50%
  const impact = calculateImpact(spaIncrease[0]);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Simulátor Strategie Péče
        </h1>
        <p className="text-muted-foreground text-lg">
          Modelování dopadů zvýšení dostupnosti následné péče na systémové
          náklady.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* OVLÁDACÍ PANEL */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>Nastavení parametrů</CardTitle>
            <CardDescription>
              Upravte proměnné pro přepočet modelu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">
                  Navýšení kapacity Lázní
                </label>
                <span className="font-bold text-blue-600">
                  +{spaIncrease[0]} %
                </span>
              </div>
              <Slider
                value={spaIncrease}
                onValueChange={setSpaIncrease}
                max={40}
                step={5}
                className="py-4"
              />
              <p className="text-muted-foreground text-xs">
                Zvyšuje procento pacientů odeslaných do lázní po TEP kyčle.
              </p>
            </div>

            <div className="border-t border-blue-200 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  Aktuální vytížení lázní
                </span>
                <span className="text-xs text-slate-500">85% Kapacity</span>
              </div>
              <Progress value={85 + spaIncrease[0]} className="h-2" />
              {85 + spaIncrease[0] > 100 && (
                <div className="mt-2 flex animate-pulse items-center gap-2 text-xs font-bold text-red-600">
                  <Activity className="h-3 w-3" />
                  VAROVÁNÍ: Překročení kapacity systému!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VÝSLEDKOVÉ KARTY */}
        <div className="grid gap-4">
          {/* Úspora peněz */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Predikovaná Úspora (CZK)
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${impact.financialBalance > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {impact.financialBalance > 0 ? "+" : ""}
                {impact.financialBalance.toLocaleString()} Kč
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Bilance nákladů (Lázně vs. Ušetřené rehospitalizace)
              </p>
            </CardContent>
          </Card>

          {/* Snížení rehospitalizací */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zabráněné rehospitalizace
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {impact.savedRehospitalizations} pacientů
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Míra rehospitalizací klesne na{" "}
                <span className="font-bold text-slate-900">
                  {impact.newReadmissionRate} %
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Insight text */}
          <div className="mt-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-50">
            <span className="font-bold text-blue-400">AI Insight:</span>{" "}
            {impact.financialBalance > 0
              ? "Model doporučuje investici. Zvýšení lázeňské péče je ekonomicky rentabilní díky snížení akutních komplikací."
              : "Pozor: Náklady na lázně převyšují úspory z rehospitalizací. Zaměřte se jen na rizikové skupiny."}
          </div>
        </div>
      </div>
    </div>
  );
}
