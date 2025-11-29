import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Clock,
  GitMerge,
  Map,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function StatCard({ title, value, sub, icon: Icon, trend }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground mt-1 flex items-center text-xs">
          {trend === "up" && (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          )}
          {trend === "down" && (
            <TrendingUp className="mr-1 h-3 w-3 rotate-180 text-red-500" />
          )}
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Hero sekce */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Vítejte v CareFlow Analytics</h1>
          <p className="mt-2 max-w-xl text-slate-300">
            Platforma pro analýzu průchodu pacientů, detekci diskontinuity péče
            a optimalizaci nákladů pro VoZP.
          </p>
        </div>
        <div className="hidden md:block">
          <Activity className="h-24 w-24 text-blue-500 opacity-50" />
        </div>
      </div>

      {/* KPI Karty */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sledovaná kohorta"
          value="12,450"
          sub="+180 tento týden"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Efektivita Lázní"
          value="28.4 %"
          sub="+2.1% meziročně"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Rizikové Rehospitalizace"
          value="11.2 %"
          sub="Nad limitem (Cíl < 10%)"
          icon={AlertTriangle}
          trend="down"
        />
        <StatCard
          title="Průměrné zpoždění"
          value="142 dní"
          sub="Kritické v JM kraji"
          icon={Clock}
          trend="down"
        />
      </div>

      {/* Rychlý rozcestník */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/cohorts" className="group block">
          <Card className="h-full cursor-pointer transition-colors hover:border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-blue-600" />
                Analýza toků (Sankey)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Vizualizace průchodu pacientů mezi nemocnicí, domácí péčí a
                lázněmi.
              </p>
              <Button
                variant="outline"
                className="w-full group-hover:bg-blue-50"
              >
                Otevřít analýzu
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/regional" className="group block">
          <Card className="h-full cursor-pointer transition-colors hover:border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-green-600" />
                Regionální Mapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Geografický přehled dostupnosti péče a srovnání efektivity
                krajů.
              </p>
              <Button
                variant="outline"
                className="w-full group-hover:bg-green-50"
              >
                Zobrazit mapu
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/anomalies/1" className="group block">
          <Card className="h-full cursor-pointer transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                AI Detekce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Seznam identifikovaných rizik a anomálií v datech vyžadujících
                pozornost.
              </p>
              <Button
                variant="outline"
                className="w-full group-hover:bg-purple-50"
              >
                Řešit anomálie
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
