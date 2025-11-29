import { useMemo } from "react";
import { TimelineWrapper } from "@/features/patient-detail/components/timeline/timeline-layout.tsx";
import type { PatientFuture, PatientHistory } from "@/lib/api-client";
import { TimelineHistory } from "@/features/patient-detail/components/timeline/timeline-history.tsx";
import { TimelineCurrent } from "@/features/patient-detail/components/timeline/timeline-current.tsx";
import { TimelineFuture } from "@/features/patient-detail/components/timeline/timeline-future.tsx";

interface TimelineProps {
  history?: PatientHistory | undefined;
  future?: PatientFuture[] | undefined;
}

const Timeline = ({ history, future }: TimelineProps) => {
  const { pastEvents, currentEvent } = useMemo(() => {
    const allServices = history?.received_health_services || [];
    const current = allServices.find((s) => s.delta_days === 0);

    const past = allServices
      .filter((s) => s.delta_days < 0)
      .sort((a, b) => a.delta_days - b.delta_days);

    return { pastEvents: past, currentEvent: current };
  }, [history]);

  return (
    <TimelineWrapper>
      <TimelineHistory events={pastEvents} />
      <TimelineCurrent currentEvent={currentEvent} />
      <TimelineFuture items={future || []} />
    </TimelineWrapper>
  );
};

export default Timeline;
