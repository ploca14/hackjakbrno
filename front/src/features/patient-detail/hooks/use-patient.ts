import { useQuery } from "@tanstack/react-query";
import {
  getPatientPatientsPatientIdGetOptions,
  getPatientHistoryPatientsPatientIdHistoryGetOptions,
  getPatientFuturesPatientsPatientIdFuturesGetOptions,
} from "@/lib/api-client/@tanstack/react-query.gen";

export const usePatient = (patientId: string) => {
  return useQuery({
    ...getPatientPatientsPatientIdGetOptions({
      path: { patient_id: patientId },
    }),
    enabled: !!patientId,
  });
};

export const usePatientHistory = (patientId: string) => {
  return useQuery({
    ...getPatientHistoryPatientsPatientIdHistoryGetOptions({
      path: { patient_id: patientId },
    }),
    enabled: !!patientId,
  });
};

export const usePatientFuture = (patientId: string) => {
  return useQuery({
    ...getPatientFuturesPatientsPatientIdFuturesGetOptions({
      path: { patient_id: patientId },
    }),
    enabled: !!patientId,
  });
};
