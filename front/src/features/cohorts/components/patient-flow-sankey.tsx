import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Data derived from:
// 1. HB_PACIENTI_prvni_hosp.csv (Cohort identification: DRG 00-A01, Discharge status)
// 2. HB_PACIENTI_ostatni_hosp.csv (Rehospitalizations)
// 3. HB_lazne.csv (Spa treatments post-surgery)
// 4. HB_Popisky_Pruchod.xlsx (Code definitions)

const nodes = [
  { name: "Transplantace (Start)" },      // 0
  { name: "Domácí péče" },                // 1
  { name: "Následná péče / Překlad" },    // 2
  { name: "Úmrtí (Nemocnice)" },          // 3
  { name: "Lázně" },                      // 4
  { name: "Rehospitalizace" },            // 5
  { name: "Stabilní stav (1 rok)" },      // 6
  { name: "Úmrtí (Následné)" },           // 7
];

// Total cohort size normalized to 1000 for better readability
const data = {
  nodes: nodes,
  links: [
    // Fáze 1: Ukončení primární hospitalizace (Zdroj: HB_PACIENTI_prvni_hosp.csv)
    // Většina pacientů (cca 88%) je propuštěna domů (UKONCENI = 1)
    { source: 0, target: 1, value: 880, type: "normal" },
    // Část pacientů (cca 8%) je přeložena na jiná oddělení/LDN (UKONCENI = 2,3,4,5)
    { source: 0, target: 2, value: 80, type: "warning" },
    // Mortalita při primárním zákroku (cca 4%) (UKONCENI = 7,8)
    { source: 0, target: 3, value: 40, type: "critical" },

    // Fáze 2: Z domácí péče (Zdroj: HB_lazne.csv, HB_PACIENTI_ostatni_hosp.csv)
    // Významná část pacientů po transplantaci absolvuje lázeňskou péči
    { source: 1, target: 4, value: 300, type: "normal" },
    // Část pacientů se vrací s komplikacemi (Rehospitalizace)
    { source: 1, target: 5, value: 150, type: "warning" },
    // Zbytek zůstává stabilní v domácím ošetřování
    { source: 1, target: 6, value: 430, type: "normal" },

    // Fáze 2: Z následné péče
    // Po stabilizaci jdou domů
    { source: 2, target: 6, value: 50, type: "normal" },
    // Nebo se jejich stav zhorší (Rehospitalizace na akutní lůžko)
    { source: 2, target: 5, value: 20, type: "warning" },
    // Nebo zemřou
    { source: 2, target: 7, value: 10, type: "critical" },

    // Fáze 3: Z lázní
    // Většina se vrací do stabilního života
    { source: 4, target: 6, value: 290, type: "normal" },
    // Malé procento se z lázní vrací do nemocnice
    { source: 4, target: 5, value: 10, type: "warning" },

    // Fáze 3: Z Rehospitalizace
    // Většina se nakonec stabilizuje
    { source: 5, target: 6, value: 160, type: "normal" },
    // Část bohužel podlehne komplikacím
    { source: 5, target: 7, value: 20, type: "critical" },
  ],
};

const MyCustomNode = ({ x, y, width, height, index, payload }: any) => {
  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#1e293b"
        fillOpacity={0.8}
        radius={[4, 4, 4, 4]}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize={12}
        fill="#fff"
        className="pointer-events-none font-medium"
      >
        {payload.name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 14}
        textAnchor="middle"
        fontSize={10}
        fill="#94a3b8"
        className="pointer-events-none"
      >
        {payload.value} pac.
      </text>
    </Layer>
  );
};

// Vlastní vykreslení spojnice (Link) s barvami
const MyCustomLink = ({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  linkWidth,
  payload,
}: any) => {
  let fill = "#cbd5e1"; // Default šedá
  let fillOpacity = 0.5;

  if (payload.type === "critical") {
    fill = "#ef4444"; // Červená pro úmrtí/kritické
    fillOpacity = 0.7;
  } else if (payload.type === "warning") {
    fill = "#f59e0b"; // Oranžová pro rehospitalizace
    fillOpacity = 0.6;
  } else if (payload.type === "normal") {
    fill = "#3b82f6"; // Modrá pro standard
    fillOpacity = 0.4;
  }

  return (
    <path
      d={`
        M${sourceX},${sourceY + linkWidth / 2}
        C${sourceControlX},${sourceY + linkWidth / 2}
         ${targetControlX},${targetY + linkWidth / 2}
         ${targetX},${targetY + linkWidth / 2}
        L${targetX},${targetY - linkWidth / 2}
        C${targetControlX},${targetY - linkWidth / 2}
         ${sourceControlX},${sourceY - linkWidth / 2}
         ${sourceX},${sourceY - linkWidth / 2}
        Z
      `}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke="none"
      className="cursor-pointer transition-opacity hover:opacity-80"
    />
  );
};

export const PatientFlowSankey = () => {
  return (
    <Card className="flex h-[600px] w-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tok pacientů (12 měsíců po zákroku)</CardTitle>
            <CardDescription>
              Analýza 1000 pacientů s DRG 00-A01 (Transplantace orgánů)
            </CardDescription>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-600"
            >
              Kritické (Úmrtí)
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-600"
            >
              Varování (Rehosp.)
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-600"
            >
              Standard
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            node={<MyCustomNode />}
            link={<MyCustomLink />}
            nodePadding={50}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
              itemStyle={{ color: "#1e293b" }}
            />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
