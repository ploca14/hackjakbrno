import { TimingImpactChart } from "../components/timing-impact-chart";
import { SavingsCalculator } from "../components/savings-calculator";
import { FileText } from "lucide-react";

export function AnalyticsPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Optimalizace Cesty Pacienta
        </h1>
        <p className="text-muted-foreground text-lg">
          Hloubková analýza časových prodlev a jejich dopad na klinické a
          ekonomické výsledky.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hlavní graf - zabere 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          <TimingImpactChart />

          {/* Textové vysvětlení analýzy */}
          <div className="prose max-w-none text-slate-600">
            <h3 className="text-lg font-semibold text-slate-900">
              Metodika analýzy
            </h3>
            <p>
              Byl proveden <code>Inner Join</code> mezi datovou sadou
              hospitalizací a následné lázeňské péče. Kohorta byla rozdělena do
              15denních bucketů (intervalů) podle proměnné{" "}
              <code>DNY_OD_ZAKLADNI_HOSP</code>.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Analyzovaný vzorek: <strong>12 450 pacientů</strong> (Dg. M16)
              </li>
              <li>
                Signifikantní zjištění: Časová prodleva &gt; 60 dnů koreluje s
                nárůstem septických komplikací.
              </li>
            </ul>
          </div>
        </div>

        {/* Pravý sloupec - Kalkulačka a KPI */}
        <div className="space-y-6">
          <SavingsCalculator />

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-amber-800">
              <FileText className="h-4 w-4" />
              Doporučená opatření
            </h4>
            <ul className="space-y-2 text-sm text-amber-900">
              <li>
                1. Prioritizovat pacienty nad 70 let pro "Fast-track" překlady.
              </li>
              <li>2. Automaticky eskalovat žádosti starší 45 dnů.</li>
              <li>3. Zvýšit kapacity ve Zlínském kraji pro odlehčení JMK.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
