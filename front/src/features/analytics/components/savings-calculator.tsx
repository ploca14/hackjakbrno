import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Coins, TrendingDown } from "lucide-react";

export function SavingsCalculator() {
  const [efficiency, setEfficiency] = useState([0]); // Zlepšení v %

  // Model: Každých 10% zrychlení přesune 50 lidí z "Kritické" do "Optimal" zóny
  // Průměrná úspora na pacienta = rozdíl cost mezi Critical a Optimal (cca 40k)
  const patientsMoved = Math.floor((efficiency[0] / 100) * 450); // 450 je počet v kritické zóně
  const savedCost = patientsMoved * 40000;

  return (
    <Card className="border-none bg-slate-900 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="text-yellow-400" />
          Predikce Úspor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-4 flex justify-between">
            <span className="text-sm text-slate-300">
              Cíl: Zrychlení nástupu o
            </span>
            <span className="text-xl font-bold text-blue-400">
              {efficiency}%
            </span>
          </div>
          <Slider
            value={efficiency}
            onValueChange={setEfficiency}
            max={50}
            step={5}
            className="py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
          <div>
            <p className="text-xs text-slate-400">Zachráněných pacientů</p>
            <p className="text-2xl font-bold">{patientsMoved}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Roční úspora</p>
            <p className="text-2xl font-bold text-green-400">
              {(savedCost / 1000000).toFixed(1)} mil. Kč
            </p>
          </div>
        </div>

        <div className="flex gap-2 rounded bg-white/10 p-3 text-xs text-slate-300">
          <TrendingDown className="h-4 w-4" />
          <span>
            Zkrácení čekací doby pod 45 dnů sníží náklady na komplikace o 35%.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
