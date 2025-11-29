export const providerPerformance = [
  { id: 1, name: 'FN Brno', spaRate: 35, complicationRate: 8, volume: 1200, type: 'Fakultní' },
  { id: 2, name: 'FN U Sv. Anny', spaRate: 32, complicationRate: 9.5, volume: 950, type: 'Fakultní' },
  { id: 3, name: 'Nemocnice Znojmo', spaRate: 15, complicationRate: 18, volume: 400, type: 'Okresní' },
  { id: 4, name: 'Nemocnice Kyjov', spaRate: 12, complicationRate: 22, volume: 320, type: 'Okresní' },
  { id: 5, name: 'Úrazová nem. Brno', spaRate: 45, complicationRate: 5, volume: 600, type: 'Specializovaná' },
  { id: 6, name: 'Nemocnice Břeclav', spaRate: 18, complicationRate: 15, volume: 380, type: 'Okresní' },
  { id: 7, name: 'Nemocnice Vyškov', spaRate: 20, complicationRate: 12, volume: 290, type: 'Okresní' },
];

// Logika pro barvičky grafu podle typu
export const getTypeColor = (type: string) => {
  switch(type) {
    case 'Fakultní': return '#2563eb'; // Blue
    case 'Specializovaná': return '#16a34a'; // Green
    case 'Okresní': return '#f59e0b'; // Orange
    default: return '#94a3b8';
  }
};