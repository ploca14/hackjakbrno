import { useRef, useState } from "react";
import { HistorySlot } from "@/features/patient-detail/components/timeline/timeline-layout";
import type { HealthService } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Activity,
  Stethoscope,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

const getMockDetails = (event: HealthService) => {
  return {
    doctor: "MUDr. Jan Novák",
    facility: event.detail?.department || "Poliklinika Střed",
    report:
      "Pacient subjektivně bez obtíží. Objektivní nález v normě. Doporučena kontrola za 6 měsíců. Laboratorní výsledky nevykazují signifikantní odchylky od referenčních mezí.",
    result: "Negativní / V normě",
    code: "45612",
    price: "1 250 Kč",
    attachments: ["Zpráva_2024.pdf", "Lab_vysledky.pdf"],
  };
};

interface TimelineHistoryProps {
  events: HealthService[];
}

export const TimelineHistory = ({ events }: TimelineHistoryProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const [selectedEvent, setSelectedEvent] = useState<HealthService | null>(null);

  const ITEM_SIZE = 280;

  const rowVirtualizer = useVirtualizer({
    horizontal: true,
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_SIZE,
    overscan: 5,
  });

  const handleClose = () => setSelectedEvent(null);

  const mockDetail = selectedEvent ? getMockDetails(selectedEvent) : null;

  return (
    <>
      <HistorySlot>
        <div
          ref={parentRef}
          className="h-full w-full overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: "thin" }}
        >
          <div
            className="relative h-full w-full"
            style={{
              width: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {/* Osa uprostřed */}
            <div className="bg-primary/20 absolute top-1/2 left-0 h-2 w-full -translate-y-1/2 border" />

            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const event = events[virtualItem.index];

              return (
                <div
                  key={virtualItem.key}
                  className="absolute top-0 flex h-full items-center"
                  style={{
                    width: "256px",
                    transform: `translateX(${virtualItem.start}px)`,
                    left: 0,
                  }}
                >
                  <Card
                    onClick={() => setSelectedEvent(event)}
                    className="group w-full cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg active:scale-95"
                  >
                    <CardContent className="flex h-40 flex-col justify-between p-5">
                      <div className="flex items-start justify-between">
                        <Badge
                          variant="outline"
                          className="bg-muted/50 text-muted-foreground font-mono text-[10px]"
                        >
                          <CalendarClock className="mr-1 size-3" />
                          {Math.abs(event.delta_days)} dní zpět
                        </Badge>
                        <CheckCircle2 className="text-green-500/50 group-hover:text-green-500 size-4 transition-colors" />
                      </div>

                      <div>
                        <h4 className="text-foreground group-hover:text-primary line-clamp-2 text-xl font-semibold leading-tight transition-colors">
                          {event.label}
                        </h4>
                        <p className="text-muted-foreground mt-2 text-xs font-medium tracking-wider uppercase">
                          {event.type}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="text-muted-foreground flex h-full items-center justify-center gap-2 italic">
                <span>Žádná historie</span>
              </div>
            )}
          </div>
        </div>
      </HistorySlot>

      <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-4">
          {selectedEvent && mockDetail && (
            <div className="flex flex-col gap-6">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="w-fit">
                    {selectedEvent.type}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {Math.abs(selectedEvent.delta_days)} dní zpět
                  </Badge>
                </div>
                <SheetTitle className="text-2xl font-bold leading-tight text-left">
                  {selectedEvent.label}
                </SheetTitle>
                <SheetDescription className="text-left">
                  Detailní informace o provedeném zdravotním úkonu.
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="grid gap-6">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-2 h-4 w-4" /> Lékař
                    </div>
                    <p className="font-medium">{mockDetail.doctor}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="mr-2 h-4 w-4" /> Pracoviště
                    </div>
                    <p className="font-medium">{mockDetail.facility}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 border space-y-2">
                  <div className="flex items-center font-semibold text-sm">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    Lékařský nález / Zpráva
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockDetail.report}
                  </p>
                </div>

                <div className="grid gap-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Activity className="mr-2 h-4 w-4" /> Výsledek
                    </div>
                    <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {mockDetail.result}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Stethoscope className="mr-2 h-4 w-4" /> Kód výkonu
                    </div>
                    <span className="font-mono">{mockDetail.code}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Přílohy</h4>
                  <div className="flex flex-col gap-2">
                    {mockDetail.attachments.map((file, i) => (
                      <Button key={i} variant="outline" className="justify-start h-auto py-3">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground"/>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{file}</span>
                          <span className="text-xs text-muted-foreground">PDF • 1.2 MB</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};