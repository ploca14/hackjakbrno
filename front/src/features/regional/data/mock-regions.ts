export interface RegionStat {
  region: string;
  totalPatients: number;
  spaCount: number;
  spaRate: number;
  avgDelay: number;
  efficiencyScore: number; // Vypočítané skóre (0-100)
}

export const regionalStats: RegionStat[] = [
  {
    region: "Olomoucký kraj",
    totalPatients: 7857,
    spaCount: 668,
    spaRate: 8.5,
    avgDelay: 141,
    efficiencyScore: 82,
  },
  {
    region: "Zlínský kraj",
    totalPatients: 1801,
    spaCount: 138,
    spaRate: 7.7,
    avgDelay: 110, // Nejrychlejší
    efficiencyScore: 94,
  },
  {
    region: "Jihomoravský kraj",
    totalPatients: 10982, // Největší objem
    spaCount: 867,
    spaRate: 7.9,
    avgDelay: 161, // Nejpomalejší!
    efficiencyScore: 65,
  },
  {
    region: "Moravskoslezský kraj",
    totalPatients: 2272,
    spaCount: 177,
    spaRate: 7.8,
    avgDelay: 149,
    efficiencyScore: 71,
  },
];