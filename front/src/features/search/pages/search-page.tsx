import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const [patientId, setPatientId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Vyhledávám pacienta s ID:", patientId);
  };

  return (
    <div className="bg-muted/40 flex w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="bg-primary/10 text-primary mb-2 flex items-center justify-center rounded-full p-4">
            <Search className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vyhledání pacienta
          </h1>
          <p className="text-muted-foreground max-w-xs text-sm">
            Zadejte identifikační číslo pacienta pro přístup k jeho zdravotní
            dokumentaci.
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <div className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                id="patient-id"
                placeholder="Např. 123456"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" size="lg">
                Vyhledat kartu
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;