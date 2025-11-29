export const timingAnalysis = [
  { days: "0-14", label: "Ihned (Překlad)", patients: 150, riskRate: 4.2, cost: 25000, status: "optimal" },
  { days: "15-30", label: "Do měsíce", patients: 420, riskRate: 5.8, cost: 28000, status: "optimal" },
  { days: "31-45", label: "Standard", patients: 850, riskRate: 8.5, cost: 32000, status: "warning" },
  { days: "46-60", label: "Zpoždění", patients: 680, riskRate: 14.2, cost: 45000, status: "warning" },
  { days: "61-90", label: "Kritické", patients: 450, riskRate: 21.5, cost: 68000, status: "critical" },
  { days: "90+", label: "Selhání sítě", patients: 210, riskRate: 32.0, cost: 95000, status: "critical" },
];

export const scatterData = Array.from({ length: 50 }, (_, i) => ({
  x: Math.floor(Math.random() * 120), // Dny čekání
  y: Math.floor(Math.random() * 40) + (i * 0.5), // Věk + náhoda
  z: Math.random() > 0.8 ? 1 : 0 // 1 = Rehospitalizace
})).map(p => ({
  days: p.x,
  age: 50 + p.y,
  outcome: p.z === 1 ? "Komplikace" : "OK"
}));