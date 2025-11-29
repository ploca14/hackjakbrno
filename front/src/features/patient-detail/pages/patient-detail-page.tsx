import Header from "@/features/patient-detail/components/header.tsx";
import Timeline from "@/features/patient-detail/components/timeline/timeline.tsx";
import {
  usePatient,
  usePatientFuture,
  usePatientHistory,
} from "@/features/patient-detail/hooks/use-patient.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface PatientDetailPageProps {
  patientId: string;
}

const PatientDetailPage = ({ patientId }: PatientDetailPageProps) => {
  const patientQuery = usePatient(patientId);
  const historyQuery = usePatientHistory(patientId);
  const { data: future } = usePatientFuture(patientId);

  const isLoading = patientQuery.isLoading || historyQuery.isLoading;
  const isError = patientQuery.isError || historyQuery.isError;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !patientQuery.data) {
    return <div className="p-6">Nepodařilo se načíst data pacienta.</div>;
  }

  return (
    <div className={'relative'}>
      <Header patientInfo={patientQuery.data} patientId={patientId} />
      <Timeline history={historyQuery.data} future={future}/>
    </div>
  );
};

export default PatientDetailPage;
