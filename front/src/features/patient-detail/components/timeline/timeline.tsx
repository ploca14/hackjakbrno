import type { PatientFuture, PatientHistory } from "@/lib/api-client";

interface TimelineProps {
  history?: PatientHistory | undefined;
  futures?: PatientFuture[] | undefined;
}

const Timeline = ({ history, futures }: TimelineProps) => {
  console.log(futures, history);

  return <div className={"border border-red-500"}></div>;
};

export default Timeline;
