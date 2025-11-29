import {
  FutureItemSlot,
  FutureSlot,
} from "@/features/patient-detail/components/timeline/timeline-layout";
import type { PatientFuture } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineFutureProps {
  items: PatientFuture[];
}

export const TimelineFuture = ({ items }: TimelineFutureProps) => {
  return (
    <FutureSlot>
      <div className="border-primary absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 border-2 border-dashed bg-primary/20" />

      {items.map((item, index) => (
        <FutureItemSlot key={index}>
          <div className="group relative p-4 ">
            <div
              className={cn(
                "relative flex flex-col items-center rounded-2xl border border-primary border-dashed p-6 transition-all",
                "bg-primary/20 backdrop-blur-sm",
                "hover:shadow-primary/5 hover:shadow-lg",
              )}
            >
              {item.probability && (
                <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-background gap-1.5 shadow-sm",
                      item.probability > 70
                        ? "border-primary/30 text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    <Sparkles
                      className={cn(
                        "size-3",
                        item.probability > 70 && "fill-primary/20",
                      )}
                    />
                    <span className="font-semibold">
                      {Math.round(item.probability)}%
                    </span>
                    <span className="font-normal opacity-80">
                      pravděpodobnost
                    </span>
                  </Badge>
                </div>
              )}

              <div className="mt-4 flex w-full items-center justify-start gap-4">
                {item.expected_health_services.map((service, i) => {
                  return (
                    <div key={i} className="group/card relative">
                      <Card className="border-muted/60 hover:border-primary/30 w-60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 font-mono text-[10px]"
                            >
                              +{service.delta_days} dní
                            </Badge>
                            <ArrowRight className="text-muted-foreground/50 group-hover/card:text-primary size-3.5 transition-colors" />
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-foreground group-hover/card:text-primary text-sm leading-snug font-semibold transition-colors">
                              {service.label}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <Activity className="text-muted-foreground size-3" />
                              <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                                {service.type}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FutureItemSlot>
      ))}

      {items.length === 0 && (
        <FutureItemSlot>
          <div className="text-muted-foreground/50 flex h-full min-w-[300px] items-center justify-center gap-2 italic">
            <span>Žádná predikce</span>
          </div>
        </FutureItemSlot>
      )}
    </FutureSlot>
  );
};
