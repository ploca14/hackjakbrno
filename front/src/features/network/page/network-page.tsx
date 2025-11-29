import { ProviderQuadrant } from "../components/provider-quadrant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { providerPerformance } from "../data/mock-providers";

export function NetworkPage() {
  const problematicProviders = providerPerformance.filter(
    (p) => p.spaRate < 20 && p.complicationRate > 15,
  );

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Síť poskytovatelů</h1>
        <p className="text-muted-foreground text-lg">
          Analýza efektivity nemocnic v návaznosti na následnou péči. Srovnání
          kvality výstupů.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hlavní graf - zabere 2 sloupce */}
        <div className="lg:col-span-2">
          <ProviderQuadrant />
        </div>

        {/* Postranní panel - Insights */}
        <div className="space-y-6">
          <Card className="border-red-100 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Detekce problémů
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {problematicProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex flex-col rounded-md border bg-white p-3 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-bold">{provider.name}</span>
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700"
                    >
                      Kritické
                    </Badge>
                  </div>
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <p>
                      Využití lázní:{" "}
                      <span className="font-mono font-bold text-red-600">
                        {provider.spaRate}%
                      </span>{" "}
                      (Průměr 25%)
                    </p>
                    <p>
                      Rehospitalizace:{" "}
                      <span className="font-mono font-bold text-red-600">
                        {provider.complicationRate}%
                      </span>{" "}
                      (Průměr 12%)
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-2 text-xs text-slate-500">
                * Tito poskytovatelé vykazují nízkou návaznost péče a vysokou
                chybovost. Doporučujeme audit.
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Benchmarks (Cíle)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium">
                  Cílová prostupnost do Lázní
                </div>
                <div className="text-2xl font-bold text-slate-900">30 %</div>
                <p className="text-muted-foreground text-xs">
                  Pro diagnózu M16 (TEP Kyčle)
                </p>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium">
                  Max. tolerance rehospitalizací
                </div>
                <div className="text-2xl font-bold text-slate-900">10 %</div>
                <p className="text-muted-foreground text-xs">
                  Do 30 dnů po propuštění
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}