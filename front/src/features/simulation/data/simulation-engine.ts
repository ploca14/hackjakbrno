export const baseStats = {
  totalPatients: 1000,
  spaRate: 0.15, // 15% jde do lázní
  readmissionRate: 0.12, // 12% se vrací
  avgCostRehospitalization: 45000,
  avgCostSpa: 25000,
};

export const calculateImpact = (spaIncreasePercent: number) => {
  // Simulace: Každé 1% nárůstu lázní sníží rehospitalizace o 0.5% (fiktivní korelace)
  const newSpaRate = baseStats.spaRate + spaIncreasePercent / 100;
  const reductionFactor = spaIncreasePercent * 0.005;
  const newReadmissionRate = Math.max(
    0.02,
    baseStats.readmissionRate - reductionFactor,
  );

  const spaCosts = 1000 * newSpaRate * baseStats.avgCostSpa;
  const rehospitalizationCosts =
    1000 * newReadmissionRate * baseStats.avgCostRehospitalization;

  return {
    savedRehospitalizations: Math.round(
      1000 * (baseStats.readmissionRate - newReadmissionRate),
    ),
    financialBalance: Math.round(
      1000 * baseStats.readmissionRate * baseStats.avgCostRehospitalization -
        rehospitalizationCosts -
        (spaCosts - 1000 * baseStats.spaRate * baseStats.avgCostSpa),
    ),
    newReadmissionRate: (newReadmissionRate * 100).toFixed(1),
  };
};
