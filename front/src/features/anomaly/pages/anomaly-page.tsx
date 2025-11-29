import { Button } from "@/components/ui/button";
import {
  AlertOctagon,
  ArrowLeft,
  Banknote,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnomalyScatterPlot } from "@/features/anomaly/components/anomaly-scatter-plot.tsx";
import { AnomalyActionList } from "@/features/anomaly/components/anomaly-action-list.tsx";
import { useNavigate } from "@tanstack/react-router";

interface AnomalyPageProps {
  anomalyId?: string;
}

const AnomalyPage = ({ anomalyId }: AnomalyPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="animate-fade-in flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate({ to: "/" })}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-3xl font-bold">
                  Anomaly Hunter
                </h1>
                <span className="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-xs">
                  ID: {anomalyId}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Detekce odchylek a neobvyklých vzorců v péči o pacienty (Data
                set: Brno Hackathon 2025)
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="text-muted-foreground h-6 w-6" />
          </Button>
        </div>

        <div className="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4 shadow-sm">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Analyzovaných pacientů
              </p>
              <p className="text-foreground mt-1 text-2xl font-bold">54</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-20" />
          </div>

          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4 shadow-sm">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Detekovaných anomálií
              </p>
              <p className="text-destructive mt-1 text-2xl font-bold">4</p>
            </div>
            <AlertOctagon className="text-destructive h-8 w-8 opacity-20" />
          </div>

          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4 shadow-sm">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Vysoká priorita
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-500">2</p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-500 opacity-20" />
          </div>

          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4 shadow-sm">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Potenciální úspora
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                890k Kč
              </p>
            </div>
            <Banknote className="h-8 w-8 text-emerald-600 opacity-20" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-6 xl:col-span-2">
            <AnomalyScatterPlot />

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
              <h4 className="mb-1 font-semibold">Jak číst tento graf?</h4>
              <p>
                Osa X ukazuje délku hospitalizace (dny). Osa Y reprezentuje
                nákladovost (kombinace bodů výkonů a nákladů na léky). Pacienti,
                kteří se výrazně odchylují od diagonálního trendu (červené
                body), vyžadují revizi.
              </p>
            </div>
          </div>

          <div className="xl:col-span-1">
            <AnomalyActionList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyPage;
