import { useState, useRef, useEffect } from "react";
import {
  Search,
  Loader2,
  User,
  FileDigit,
  Building2,
  Activity,
  Plus,
  Clock,
  ChevronRight,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { suggestSuggestGetOptions } from "@/lib/api-client/@tanstack/react-query.gen";
import type { SuggestResult } from "@/lib/api-client/types.gen";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [debouncedQuery] = useDebounce(query, 300);

  const { data: suggestions, isLoading } = useQuery({
    ...suggestSuggestGetOptions({
      query: { query: debouncedQuery },
    }),
    enabled: debouncedQuery.length > 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    if (/^\d+$/.test(query)) {
      navigate({ to: "/patients/$patientId", params: { patientId: query } });
    }
  };

  const handleSuggestionClick = (suggestion: SuggestResult) => {
    let id: string | null = null;

    if (suggestion.type === "PATIENT") {
      const match = suggestion.label.match(/^(\d+)/);
      id = match ? match[1] : null;
    } else if (suggestion.type === "DRG") {
      const match = suggestion.label.match(/\(([^)]+)\)$/);
      id = match ? match[1] : null;
    } else {
      const match = suggestion.label.match(/^(\d+)/);
      id = match ? match[1] : null;
    }

    if (!id) return;

    if (suggestion.type === "PATIENT") {
      navigate({ to: "/patients/$patientId", params: { patientId: 56170 } });
    } else if (suggestion.type === "DRG") {
      navigate({ to: "/cohorts" });
    } else if (suggestion.type === "SERVICE_PROVIDER") {
      navigate({ to: "/anomalies/$anomalyId", params: { anomalyId: id } });
    }
  };

  const getTypeColor = (type: SuggestResult["type"]) => {
    switch (type) {
      case "PATIENT":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "DRG":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    }
  };

  const getTypeIcon = (type: SuggestResult["type"]) => {
    switch (type) {
      case "PATIENT":
        return <User className="mr-1 size-3.5" />;
      case "DRG":
        return <FileDigit className="mr-1 size-3.5" />;
      case "SERVICE_PROVIDER":
        return <Building2 className="mr-1 size-3.5" />;
      default:
        return <Search className="mr-1 size-3.5" />;
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white opacity-20 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:bg-black dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />

      <div className="flex w-full max-w-3xl flex-col items-center space-y-8 px-4 pt-20 md:pt-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center space-y-4 text-center duration-700">
          <div className="bg-primary/10 ring-primary/20 rounded-2xl p-4 ring-1">
            <Activity className="text-primary size-10" />
          </div>
          <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
            XYZ Portál
          </h1>
          <p className="text-muted-foreground max-w-[600px] text-lg">
            Rychlý přístup k pacientům, diagnózám a zdravotní dokumentaci.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 relative w-full max-w-2xl delay-150 duration-700">
          <div
            className={cn(
              "group bg-background relative rounded-2xl transition-all duration-300 ease-in-out",
              isFocused
                ? "ring-primary/20 scale-[1.01] shadow-2xl ring-2"
                : "border-border/50 border shadow-xl",
            )}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <Search
                className={cn(
                  "absolute left-4 size-5 transition-colors",
                  isFocused ? "text-primary" : "text-muted-foreground",
                )}
              />

              <Input
                ref={inputRef}
                id="search-query"
                placeholder="Hledejte pacienta, rodné číslo nebo diagnózu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                autoComplete="off"
                className="placeholder:text-muted-foreground/60 h-16 w-full rounded-2xl border-0 bg-transparent pr-12 pl-12 text-lg shadow-none focus-visible:ring-0"
              />

              <div className="absolute right-4 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="text-muted-foreground size-5 animate-spin" />
                ) : (
                  !query && (
                    <div className="bg-muted text-muted-foreground hidden items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium md:flex">
                      <Command className="size-3" />
                      <span>K</span>
                    </div>
                  )
                )}
              </div>
            </form>

            {isFocused && query.length > 0 && suggestions && (
              <div className="bg-background/95 animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-50 mt-2 origin-top overflow-hidden rounded-xl border shadow-2xl backdrop-blur-sm">
                <div className="max-h-[350px] overflow-y-auto py-2">
                  {suggestions.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
                      <Search className="mb-2 size-8 opacity-20" />
                      <p className="text-sm">Žádné výsledky nenalezeny.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="text-muted-foreground px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                        Výsledky vyhledávání
                      </div>
                      {suggestions.map((item, index) => (
                        <button
                          key={`${item.type}-${index}`}
                          onClick={() => handleSuggestionClick(item)}
                          className="group hover:bg-accent/50 focus:bg-accent/50 mx-2 flex items-center justify-between rounded-lg px-3 py-3 text-left transition-colors outline-none"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
                                item.type === "PATIENT"
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                  : item.type === "DRG"
                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                    : "bg-gray-100 text-gray-600",
                              )}
                            >
                              {item.type === "PATIENT" ? (
                                <User className="size-5" />
                              ) : item.type === "DRG" ? (
                                <FileDigit className="size-5" />
                              ) : (
                                <Search className="size-5" />
                              )}
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-foreground group-hover:text-primary truncate font-medium transition-colors">
                                {item.label}
                              </span>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2 shrink-0 font-normal",
                              getTypeColor(item.type),
                            )}
                          >
                            {getTypeIcon(item.type)}
                            {item.type === "PATIENT"
                              ? "Pacient"
                              : item.type === "DRG"
                                ? "DRG"
                                : item.type}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-muted/30 border-t px-4 py-2">
                  <span className="text-muted-foreground text-xs">
                    Stiskněte{" "}
                    <kbd className="text-foreground font-sans font-bold">
                      ↵ Enter
                    </kbd>{" "}
                    pro přechod na detail
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 grid w-full max-w-2xl grid-cols-1 gap-4 delay-300 duration-700 md:grid-cols-2">
          <Card className="group hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <Plus className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="group-hover:text-primary font-semibold transition-colors">
                  Nový příjem
                </h3>
                <p className="text-muted-foreground text-sm">
                  Registrace nového pacienta
                </p>
              </div>
              <ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <Clock className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="group-hover:text-primary font-semibold transition-colors">
                  Historie hledání
                </h3>
                <p className="text-muted-foreground text-sm">
                  Zobrazit nedávno otevřené
                </p>
              </div>
              <ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
