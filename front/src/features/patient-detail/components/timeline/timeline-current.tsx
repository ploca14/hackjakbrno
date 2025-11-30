import { CurrentSlot } from "@/features/patient-detail/components/timeline/timeline-layout";
import type { HealthService } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge.tsx";

interface TimelineCurrentProps {
  currentEvent?: HealthService;
}

export const TimelineCurrent = ({ currentEvent }: TimelineCurrentProps) => {
  console.log(currentEvent);
  return (
    <CurrentSlot>
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        <div className={"bg-primary/20 absolute h-2 w-full border"} />
        {currentEvent ? (
          <div
            className={
              "border-primary relative z-20 flex flex-col gap-4 rounded-2xl border-2 bg-blue-100 p-6"
            }
          >
            <Badge>DNES</Badge>
            <h3 className="text-center text-xl font-bold text-gray-900">
              {currentEvent.label}
            </h3>
            <p className="mt-2 text-sm text-gray-500">{currentEvent.type}</p>
          </div>
        ) : (
          <>
            <div className="mb-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              DNES
            </div>
            <p className="text-gray-400 italic">Žádný záznam</p>
          </>
        )}
      </div>
    </CurrentSlot>
  );
};
