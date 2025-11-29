export const costComparison = [
  {
    category: "Primární operace (TEP)",
    idealCost: 85000,
    realCost: 85000,
    note: "Fixní náklad (DRG)",
  },
  {
    category: "Následná lůžková péče",
    idealCost: 15000, // Pár dní
    realCost: 45000, // Prodloužená pro komplikace
    note: "Zbytečné dny na lůžku navíc",
  },
  {
    category: "Lázně / Rehabilitace",
    idealCost: 35000, // Standardní pobyt
    realCost: 0, // Nešlo se (nevyužito)
    note: "Ušetřeno? Ne, jen odloženo.",
  },
  {
    category: "Rehospitalizace (Komplikace)",
    idealCost: 0,
    realCost: 120000, // Septická reoperace
    note: "Nákladná léčba sepse",
  },
  {
    category: "Farmakoterapie (1 rok)",
    idealCost: 5000,
    realCost: 25000, // Silnější ATB, více léků
    note: "Dlouhodobá léčba následků",
  },
];

export const totalIdeal = costComparison.reduce((a, b) => a + b.idealCost, 0);
export const totalReal = costComparison.reduce((a, b) => a + b.realCost, 0);
