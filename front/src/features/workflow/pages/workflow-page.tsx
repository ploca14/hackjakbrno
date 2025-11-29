import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MoreHorizontal, Phone } from "lucide-react";
import { kanbanTasks } from "../data/mock-tasks";

function KanbanColumn({ title, tasks, color }: any) {
  return (
    <div className="flex min-w-[300px] flex-1 flex-col gap-4">
      <div
        className={`flex items-center justify-between rounded-lg border-b-4 p-3 ${color} bg-white shadow-sm`}
      >
        <h3 className="font-bold text-slate-700">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="flex h-full flex-col gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-2">
        {tasks.map((task: any) => (
          <Card
            key={task.id}
            className="cursor-grab transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-sm font-semibold">{task.name}</span>
                {task.priority === "high" && (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="mb-3 text-xs text-slate-500">{task.issue}</p>

              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <div
                  className={`flex items-center gap-1 text-xs ${task.daysLeft < 3 ? "font-bold text-red-600" : "text-slate-400"}`}
                >
                  <Clock className="h-3 w-3" />
                  {task.daysLeft} dny
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-400">
            Žádné úkoly
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkflowPage() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-100px)] flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intervenční Hub</h1>
          <p className="text-muted-foreground">
            Pracovní plocha pro koordinátory péče. Řešení detekovaných anomálií
            v reálném čase.
          </p>
        </div>
        <Button>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Dokončit vybrané
        </Button>
      </div>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        <KanbanColumn
          title="K řešení (Rizika)"
          tasks={kanbanTasks.todo}
          color="border-b-red-500"
        />
        <KanbanColumn
          title="V procesu"
          tasks={kanbanTasks.inProgress}
          color="border-b-amber-500"
        />
        <KanbanColumn
          title="Vyřešeno"
          tasks={kanbanTasks.resolved}
          color="border-b-green-500"
        />

        {/* Mock prázdného sloupce pro efekt */}
        <KanbanColumn
          title="Eskalace na Pojišťovnu"
          tasks={[]}
          color="border-b-purple-500"
        />
      </div>
    </div>
  );
}
