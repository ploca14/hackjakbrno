import { RegionalScorecard } from "../components/regional-scorecard";
import { CzechMap } from "../components/czech-map"; // Import mapy
import { regionalStats } from "../data/mock-regions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function RegionalPage() {
  const sortedStats = [...regionalStats].sort((a, b) => b.totalPatients - a.totalPatients);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Regionální mapa péče</h1>
          <p className="text-muted-foreground text-lg">
            Geografická analýza dostupnosti lázeňské péče pro diagnózu M16.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* MAPA - Zabere 2 sloupce */}
        <div className="lg:col-span-2">
          <CzechMap />
        </div>

        {/* STATISTIKY - Zabere 1 sloupec */}
        <div className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200 text-amber-900">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">Jihomoravský kraj</AlertTitle>
            <AlertDescription>
              Kritické zpoždění (161 dní). Doporučujeme využít volné kapacity ve <strong>Zlínském kraji</strong> (110 dní).
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {sortedStats.map((stat) => (
              <RegionalScorecard key={stat.region} data={stat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}