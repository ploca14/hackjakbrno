import { Activity, ArrowLeft, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "@tanstack/react-router";
import type { Patient } from "@/lib/api-client";

interface HeaderProps {
  patientInfo: Patient;
  patientId: string;
}

const Header = ({ patientInfo, patientId }: HeaderProps) => {
  return (
    <header className="bg-background sticky top-0 z-30 border-b px-6 py-4 shadow-sm h-[90px]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button size={"icon-lg"} asChild>
            <Link to={"/"}>
              <ArrowLeft />
            </Link>
          </Button>
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <User className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patientInfo.name}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="font-mono">ID: {patientId}</span>
              <span>•</span>
              <span>Ročník 2001</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="size-4" />
            Dokumentace
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Activity className="size-4" />
            Nové vyšetření
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
