import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, ArrowRight, FileText } from "lucide-react";

const mockActionItems = [
  {
    id: "AN-001",
    patientId: "9901",
    priority: "high",
    drg: "00-A01 (Transplantace orgánů)",
    title: "Předčasné propuštění / Vysoké riziko",
    description:
      "Pacient propuštěn po 3 dnech (průměr pro DRG 00-A01 je 25 dní). Následně vykázáno extrémní množství ambulantních výkonů.",
    missing: "Chybí záznam o následné péči v HB_lazne.csv",
  },
  {
    id: "AN-002",
    patientId: "12345",
    priority: "high",
    drg: "04-T01 (Trombóza)",
    title: "Chybějící farmakoterapie",
    description:
      "Pacient propuštěn do domácího ošetřování, ale v předepsaných lécích (HB_pece.csv) chybí antikoagulancia.",
    missing: "Nenalezen kód ATC skupiny B01",
  },
  {
    id: "AN-003",
    patientId: "9903",
    priority: "medium",
    drg: "19-X14 (Poruchy duševní)",
    title: "Neefektivní hospitalizace",
    description:
      "Délka hospitalizace 45 dní bez vykázání terapeutických výkonů. Pouze 'ošetřovací dny'.",
    missing: "Nízká frekvence výkonů v datech pojišťovny",
  },
  {
    id: "AN-004",
    patientId: "8821",
    priority: "low",
    drg: "21-X01 (Vyšetření po úrazu)",
    title: "Duplicitní vyšetření",
    description:
      "Pacientovi bylo provedeno CT hlavy 3x během 24 hodin na dvou různých pracovištích.",
    missing: null,
  },
];

export const AnomalyActionList = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="text-primary h-5 w-5" />
          Seznam k revizi
          <Badge variant="secondary" className="ml-auto">
            {mockActionItems.length} případů
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActionItems.map((item) => (
          <div
            key={item.id}
            className="border-border bg-card hover:bg-accent/5 flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row"
          >
            <div className="flex min-w-[100px] items-center gap-2 sm:flex-col sm:items-start">
              {item.priority === "high" && (
                <Badge variant="destructive" className="flex gap-1">
                  <AlertTriangle className="h-3 w-3" /> Vysoká
                </Badge>
              )}
              {item.priority === "medium" && (
                <Badge
                  variant="default"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Střední
                </Badge>
              )}
              {item.priority === "low" && (
                <Badge variant="outline">Nízká</Badge>
              )}
              <span className="text-muted-foreground mt-1 font-mono text-xs">
                ID: {item.patientId}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-foreground font-semibold">{item.title}</h3>
              </div>

              <div className="text-muted-foreground text-sm">
                <span className="text-foreground font-medium">DRG: </span>{" "}
                {item.drg}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>

              {item.missing && (
                <div className="inline-flex items-center gap-2 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
                  <Activity className="h-3 w-3" />
                  {item.missing}
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2 sm:flex-col">
              <Button size="sm" variant="outline">
                Detail
              </Button>
              <Button size="sm" className="gap-2">
                Vyřešit <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
