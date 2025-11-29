import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertCircle,
  ArrowLeft,
  Filter,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { PatientFlowSankey } from "@/features/cohorts/components/patient-flow-sankey.tsx";
import {
  Select,
  SelectContent, SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const CohortsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="space-y-4 flex items-center gap-4">
          <Button
            size="icon-lg"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col justify-between w-full gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                The Cohort Explorer
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Vizualizace dlouhodobých průchodů pacientů zdravotním systémem.
                Identifikujte úzká hrdla, neefektivní toky a rizikové skupiny.
              </p>
            </div>

            {/* KPI Cards Mini */}
            <div className="flex gap-4">
              <div className="bg-muted/30 border-border rounded-lg border px-4 py-2 text-right">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Míra Rehospitalizací
                </div>
                <div className="text-xl font-bold text-amber-600">18.5%</div>
              </div>
              <div className="bg-muted/30 border-border rounded-lg border px-4 py-2 text-right">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Průměrná péče
                </div>
                <div className="text-xl font-bold text-blue-600">42 dní</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-card border-border flex flex-col items-center gap-4 rounded-xl border p-4 shadow-sm md:flex-row">
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Vyhledejte diagnózu (např. 'Transplantace', 'Cévní mozková příhoda')..."
              className="w-full pl-9"
              defaultValue="Transplantace orgánů (00-A01)"
            />
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <Select defaultValue="2024">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kraj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny kraje</SelectItem>
                <SelectItem value="11">Jihomoravský</SelectItem>
                <SelectItem value="01">Praha</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" /> Pokročilé
            </Button>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-red-100 bg-red-50/50 p-5 dark:border-red-900 dark:bg-red-950/10">
            <div className="mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Kritické body</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">5% pacientů</strong> umírá do
              30 dnů po propuštění z JIP. Nejčastější příčinou je{" "}
              <span className="underline decoration-dotted">sepse</span>.
            </p>
            <Button variant="link" className="mt-2 h-auto px-0 text-red-600">
              Analyzovat úmrtí &rarr;
            </Button>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/10">
            <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
              <h3 className="font-semibold">Návratovost (Rehosp.)</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Z pacientů propuštěných do domácí péče se{" "}
              <strong className="text-foreground">20% vrací</strong> do 3
              měsíců. Chybějící následná péče v datech pro region JMK.
            </p>
            <Button variant="link" className="mt-2 h-auto px-0 text-amber-600">
              Zobrazit vracející se &rarr;
            </Button>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/10">
            <div className="mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Users className="h-5 w-5" />
              <h3 className="font-semibold">Potenciál pro Lázně</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Pouze <strong className="text-foreground">15%</strong>{" "}
              indikovaných pacientů nastupuje do lázní, ačkoliv data ukazují o
              40% nižší rehospitalizaci u této skupiny.
            </p>
          </div>
        </div>

        {/* Main Vizualization */}
        <div className="animate-fade-in">
          <PatientFlowSankey />
        </div>

      </div>
    </div>
  );
};

export default CohortsPage
