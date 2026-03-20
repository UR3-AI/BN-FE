import { ArrowOutwardIcon, PsychologyIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const RECENT_NOTES = [
  {
    id: 1,
    title: "The Alchemy of Minimalism",
    description:
      "Exploring how reduction in design leads to spiritual abundance. Referencing Rams and Soseki...",
    date: "OCT 23 • 14:15",
  },
  {
    id: 2,
    title: "Project: Helios Architecture",
    description:
      "Solar panel integration in brutalist concrete structures. Phase 1 materials list...",
    date: "OCT 22 • 09:30",
  },
  {
    id: 3,
    title: "Reading List: Q4 2026",
    description:
      'Finished "The Order of Time" by Carlo Rovelli. Starting "Hyperobjects" by Timothy Morton...',
    date: "OCT 21 • 18:42",
  },
];

const FOCUS_TASKS = [
  {
    id: 1,
    label: "Review AI synthesis for Architecture note",
    completed: true,
  },
  {
    id: 2,
    label: "Email studio re: structural vellum samples",
    completed: true,
  },
  {
    id: 3,
    label: 'Sketch conceptual nodes for "Digital Atelier"',
    completed: false,
  },
  {
    id: 4,
    label: "Draft summary of Rovelli reading notes",
    completed: false,
  },
  {
    id: 5,
    label: "Backup local knowledge vaults",
    completed: false,
  },
];

type BarColor = "primary" | "secondary" | "default";

const WEEKLY_ACTIVITY: { day: string; heightPercent: number; color: BarColor }[] = [
  { day: "MON", heightPercent: 40, color: "default" },
  { day: "TUE", heightPercent: 65, color: "default" },
  { day: "WED", heightPercent: 50, color: "default" },
  { day: "THU", heightPercent: 85, color: "primary" },
  { day: "FRI", heightPercent: 60, color: "default" },
  { day: "SAT", heightPercent: 45, color: "default" },
  { day: "SUN", heightPercent: 30, color: "secondary" },
];

const DashboardPage = () => {
  return (
    <GlobalLayout
      activeMenu="dashboard"
      showSearch={true}>
      <div className="flex-1 px-[3.2rem] py-[4rem] flex flex-col gap-[4rem]">
        {/* Greeting Section */}
        <section className="flex flex-col gap-[0.4rem]">
          <h2 className="font-headline text-[3.6rem] font-extrabold text-on-surface tracking-tight">
            Good morning, Alex
          </h2>
          <p className="text-secondary font-medium tracking-wide text-[1.4rem]">
            Tuesday, Oct 24, 2026
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-[2.4rem] items-start">
          {/* AI Insights Focus Plate */}
          <div className="col-span-12 lg:col-span-8 p-[3.2rem] bg-surface-container-highest rounded-[0.5rem] flex flex-col gap-[2.4rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-[1.2rem]">
                <PsychologyIcon
                  size="2.4rem"
                  fill="#fbbc00"
                />
                <span className="text-[1.1rem] font-bold uppercase tracking-[0.15em] text-primary/80">
                  AI Suggestion Engine
                </span>
              </div>
              <span className="text-[1rem] text-on-surface-variant/40 px-[0.8rem] py-[0.4rem] bg-surface-container-lowest rounded-[0.125rem]">
                GENERATED 2H AGO
              </span>
            </div>

            <div className="relative z-10 space-y-[1.6rem] max-w-[64rem]">
              <h3 className="font-headline text-[2.4rem] font-bold text-on-surface">
                Synthesis: Interconnected Themes in Philosophy & Architecture
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-[1.4rem]">
                Your recent notes on{" "}
                <span className="text-primary font-medium">
                  Japanese Metablism
                </span>{" "}
                and{" "}
                <span className="text-primary font-medium">
                  Existential Temporality
                </span>{" "}
                show a 74% semantic overlap. Consider exploring the concept of
                "Impermanent Structures" as a bridge between these domains.
                There are 12 unlinked references to Heidegger in your
                architectural sketches.
              </p>
            </div>

            <div className="relative z-10 flex gap-[1.6rem] pt-[0.8rem]">
              <button
                type="button"
                className="px-[1.6rem] py-[0.8rem] bg-primary text-on-primary rounded-[0.25rem] text-[1.1rem] font-bold uppercase tracking-[0.12em] hover:brightness-110 transition-all">
                Generate Synthesis
              </button>
              <button
                type="button"
                className="px-[1.6rem] py-[0.8rem] text-on-surface-variant hover:text-on-surface rounded-[0.25rem] text-[1.1rem] font-bold uppercase tracking-[0.12em] transition-all">
                Dismiss
              </button>
            </div>
          </div>

          {/* Knowledge Graph Mini Preview */}
          <div className="col-span-12 lg:col-span-4 p-[2.4rem] bg-surface-container rounded-[0.5rem] flex flex-col justify-between">
            <div>
              <h3 className="text-[1.1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-[2.4rem]">
                Knowledge Graph
              </h3>
              <div className="relative h-[16rem] w-full flex items-center justify-center">
                <svg
                  className="w-full h-full opacity-20"
                  viewBox="0 0 200 100">
                  <circle
                    cx="40"
                    cy="30"
                    fill="currentColor"
                    r="2"
                  />
                  <circle
                    className="text-primary"
                    cx="160"
                    cy="70"
                    fill="currentColor"
                    r="3"
                  />
                  <circle
                    cx="100"
                    cy="50"
                    fill="currentColor"
                    r="2"
                  />
                  <circle
                    className="text-secondary"
                    cx="130"
                    cy="20"
                    fill="currentColor"
                    r="4"
                  />
                  <line
                    stroke="currentColor"
                    strokeWidth="0.5"
                    x1="40"
                    x2="100"
                    y1="30"
                    y2="50"
                  />
                  <line
                    stroke="currentColor"
                    strokeWidth="0.5"
                    x1="100"
                    x2="160"
                    y1="50"
                    y2="70"
                  />
                  <line
                    stroke="currentColor"
                    strokeWidth="0.5"
                    x1="100"
                    x2="130"
                    y1="50"
                    y2="20"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-[3.2rem] font-extrabold text-on-surface">
                    2,842
                  </span>
                  <span className="text-[1rem] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold">
                    Total Entities
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-outline-variant/10 pt-[1.6rem]">
              <div className="flex flex-col">
                <span className="text-primary font-bold text-[1.8rem]">
                  12
                </span>
                <span className="text-[0.9rem] text-on-surface-variant uppercase tracking-wider">
                  New Connections today
                </span>
              </div>
              <button
                type="button"
                aria-label="Knowledge Graph 바로가기"
                className="p-[0.8rem] bg-surface-container-highest rounded-full text-primary hover:bg-primary hover:text-on-primary transition-all">
                <ArrowOutwardIcon
                  size="2rem"
                  fill="currentColor"
                />
              </button>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="col-span-12 lg:col-span-4 p-[2.4rem] bg-surface-container-low rounded-[0.5rem] flex flex-col gap-[2.4rem]">
            <div className="flex justify-between items-center">
              <h3 className="text-[1.1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
                Recent Notes
              </h3>
              <button
                type="button"
                className="text-[1rem] text-primary font-bold uppercase tracking-[0.12em]">
                View All
              </button>
            </div>
            <div className="flex flex-col gap-[1.6rem]">
              {RECENT_NOTES.map(note => (
                <div
                  key={note.id}
                  className="group p-[1.6rem] rounded-[0.25rem] hover:bg-surface-container transition-all cursor-pointer">
                  <h4 className="text-[1.4rem] font-bold text-on-surface mb-[0.4rem] group-hover:text-primary transition-colors">
                    {note.title}
                  </h4>
                  <p className="text-[1.2rem] text-on-surface-variant line-clamp-2 leading-relaxed mb-[0.8rem]">
                    {note.description}
                  </p>
                  <span className="text-[1rem] text-on-surface-variant/40 font-mono">
                    {note.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Focus */}
          <div className="col-span-12 lg:col-span-4 p-[2.4rem] bg-surface-container-low rounded-[0.5rem] flex flex-col gap-[2.4rem]">
            <div className="flex justify-between items-center">
              <h3 className="text-[1.1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
                Today's Focus
              </h3>
              <span className="text-[1rem] text-secondary font-bold uppercase tracking-[0.12em]">
                2 / 5 DONE
              </span>
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              {FOCUS_TASKS.map(task => (
                <label
                  key={task.id}
                  className="flex items-center gap-[1.6rem] p-[1.2rem] rounded-[0.25rem] hover:bg-surface-container/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={task.completed}
                    aria-label={task.label}
                    className="w-[2rem] h-[2rem] rounded-[0.125rem] border-outline-variant/30 bg-transparent text-primary focus:ring-offset-0 focus:ring-0"
                  />
                  <span
                    className={`text-[1.4rem] font-medium ${
                      task.completed
                        ? "text-on-surface-variant line-through opacity-40"
                        : "text-on-surface"
                    }`}>
                    {task.label}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="mt-[0.8rem] py-[0.8rem] w-full border border-dashed border-outline-variant/20 rounded-[0.5rem] text-[1rem] text-on-surface-variant/40 hover:text-on-surface-variant hover:border-outline-variant/50 transition-all font-bold uppercase tracking-[0.2em]">
              + Add Task
            </button>
          </div>

          {/* Atelier Stats */}
          <div className="col-span-12 lg:col-span-4 p-[2.4rem] bg-surface-container-low rounded-[0.5rem] flex flex-col gap-[3.2rem]">
            <h3 className="text-[1.1rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
              Atelier Stats
            </h3>
            <div className="grid grid-cols-2 gap-[1.6rem]">
              <div className="p-[1.6rem] bg-surface-container rounded-[0.25rem]">
                <span className="text-[1rem] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold">
                  Notes
                </span>
                <div className="font-headline text-[2.4rem] font-bold text-on-surface mt-[0.4rem]">
                  1,428
                </div>
              </div>
              <div className="p-[1.6rem] bg-surface-container rounded-[0.25rem]">
                <span className="text-[1rem] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold">
                  Journal
                </span>
                <div className="font-headline text-[2.4rem] font-bold text-on-surface mt-[0.4rem]">
                  312
                </div>
              </div>
            </div>
            <div className="space-y-[1.6rem]">
              <div className="flex justify-between items-end">
                <span className="text-[1rem] text-on-surface-variant/50 uppercase tracking-[0.15em] font-bold">
                  Weekly Activity
                </span>
                <span className="text-[1rem] text-secondary font-bold">
                  +12% vs LY
                </span>
              </div>
              <div className="flex items-end gap-[0.4rem] h-[9.6rem] w-full">
                {WEEKLY_ACTIVITY.map(bar => (
                  <div
                    key={bar.day}
                    className={`flex-1 rounded-t-[0.125rem] ${
                      bar.color === "primary"
                        ? "bg-primary"
                        : bar.color === "secondary"
                          ? "bg-secondary"
                          : "bg-surface-container-highest"
                    }`}
                    style={{ height: `${bar.heightPercent}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[0.8rem] text-on-surface-variant/30 font-bold tracking-[0.15em]">
                {WEEKLY_ACTIVITY.map(bar => (
                  <span key={bar.day}>{bar.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating FAB */}
      <button
        type="button"
        aria-label="새 항목 추가"
        className="fixed bottom-[3.2rem] right-[3.2rem] w-[5.6rem] h-[5.6rem] bg-primary text-on-primary rounded-[0.75rem] shadow-2xl flex items-center justify-center active:scale-[0.95] transition-all z-50">
        <span className="text-[3rem] font-light leading-none">+</span>
      </button>
    </GlobalLayout>
  );
};

export default DashboardPage;
