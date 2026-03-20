import {
  CloseIcon,
  CursorIcon,
  DatabaseIcon,
  DeleteIcon,
  DragPanIcon,
  LabelIcon,
  LassoIcon,
  LayersIcon,
  LinkIcon,
  MergeIcon,
  PsychologyIcon,
  SparklesIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const GraphPage = () => {
  return (
    <GlobalLayout
      activeMenu="graph"
      topbarTitle="Knowledge Graph"
      showSearch={false}>
      {/* Canvas Area */}
      <div className="relative flex-1 cursor-crosshair overflow-hidden bg-surface-container-lowest"
        style={{
          backgroundImage: "radial-gradient(circle, #2a2a2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}>
        {/* Floating Toolbar (Left) */}
        <div className="absolute left-[2.4rem] top-[2.4rem] z-30 flex flex-col gap-[0.8rem]">
          <div className="rounded-[0.5rem] border-b border-outline-variant/10 bg-surface-container-high/80 p-[0.6rem] shadow-xl backdrop-blur-md">
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] bg-primary/20 p-[1.2rem] text-primary">
              <CursorIcon size="2rem" />
            </button>
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <LassoIcon size="2rem" />
            </button>
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <DragPanIcon size="2rem" />
            </button>
            <div className="my-[0.8rem] h-px bg-outline-variant/20" />
            <button
              type="button"
              className="mb-[0.4rem] flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <ZoomInIcon size="2rem" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <ZoomOutIcon size="2rem" />
            </button>
          </div>
          <div className="rounded-[0.5rem] border-b border-outline-variant/10 bg-surface-container-high/80 p-[0.6rem] shadow-xl backdrop-blur-md">
            <button
              type="button"
              className="flex items-center justify-center rounded-[0.25rem] p-[1.2rem] text-on-surface-variant hover:bg-surface-container-highest">
              <LayersIcon size="2rem" />
            </button>
          </div>
        </div>

        {/* Graph Connections (SVG) */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40">
          <line x1="45%" y1="40%" x2="55%" y2="45%" stroke="#9fd0cd" strokeWidth="1.5" strokeDasharray="4" />
          <line x1="45%" y1="40%" x2="38%" y2="55%" stroke="#ffe2ab" strokeWidth="2" />
          <line x1="45%" y1="40%" x2="48%" y2="25%" stroke="#9fd0cd" strokeWidth="1" />
          <line x1="55%" y1="45%" x2="62%" y2="58%" stroke="#9fd0cd" strokeWidth="1" />
        </svg>

        {/* Central Node */}
        <div className="absolute top-[40%] left-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-[6.4rem] w-[6.4rem] animate-pulse items-center justify-center rounded-full border-2 border-primary bg-surface-container-highest shadow-[0_0_0_0_rgba(255,226,171,0.4)]">
            <PsychologyIcon size="3rem" fill="#ffe2ab" />
          </div>
          <div className="absolute -bottom-[4rem] left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <span className="text-[1.4rem] font-semibold text-primary">Neural Architecture</span>
            <p className="text-[1rem] uppercase tracking-[0.15em] text-outline">Active Focus</p>
          </div>
        </div>

        {/* Node: Creative Logic */}
        <div className="absolute top-[45%] left-[55%] z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-[4rem] w-[4rem] items-center justify-center rounded-full border border-secondary bg-surface-container-highest transition-transform hover:scale-110">
            <SparklesIcon size="2rem" fill="#9fd0cd" />
          </div>
          <div className="absolute -bottom-[3.2rem] left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[1.2rem] font-medium text-on-surface">Creative Logic</span>
          </div>
        </div>

        {/* Node: Knowledge Base */}
        <div className="absolute top-[55%] left-[38%] z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full border border-primary/50 bg-surface-container-highest transition-transform hover:scale-110">
            <DatabaseIcon size="2rem" fill="#ffe2ab" className="opacity-80" />
          </div>
          <div className="absolute -bottom-[3.2rem] left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[1.2rem] font-medium text-on-surface">Knowledge Base</span>
          </div>
        </div>

        {/* Selection Counter (Bottom) */}
        <div className="absolute bottom-[3.2rem] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[2.4rem] rounded-full border border-outline-variant/20 bg-surface-container-highest px-[2.4rem] py-[1.6rem] shadow-2xl">
          <div className="flex items-center gap-[1.2rem]">
            <div className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-secondary/20 text-[1.2rem] font-bold text-secondary">
              3
            </div>
            <span className="text-[1.4rem] font-medium">Nodes Selected</span>
          </div>
          <div className="h-[2.4rem] w-px bg-outline-variant/20" />
          <div className="flex items-center gap-[0.8rem]">
            <button type="button" className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-surface-container px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-bright">
              <MergeIcon size="1.6rem" /> Merge
            </button>
            <button type="button" className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-surface-container px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold transition-colors hover:bg-surface-bright">
              <LabelIcon size="1.6rem" /> Group
            </button>
            <button type="button" className="flex items-center gap-[0.8rem] rounded-[0.25rem] bg-error-container/20 px-[1.6rem] py-[0.6rem] text-[1.2rem] font-semibold text-error transition-colors hover:bg-error-container/40">
              <DeleteIcon size="1.6rem" /> Remove
            </button>
          </div>
        </div>

        {/* Zoom Info (Bottom Left) */}
        <div className="absolute bottom-[2.4rem] left-[2.4rem] z-10 flex items-center gap-[1.6rem]">
          <div className="flex items-center rounded-full border border-outline-variant/10 bg-surface-container-high/60 px-[1.2rem] py-[0.6rem] text-[1rem] font-medium text-outline backdrop-blur-sm">
            <span className="mr-[0.8rem]">ZOOM</span>
            <span className="text-on-surface">124%</span>
          </div>
          <div className="flex items-center rounded-full border border-outline-variant/10 bg-surface-container-high/60 px-[1.2rem] py-[0.6rem] text-[1rem] font-medium uppercase tracking-tighter text-outline backdrop-blur-sm">
            <span className="mr-[0.8rem] h-[0.8rem] w-[0.8rem] animate-pulse rounded-full bg-green-500" />
            Real-time Sync Active
          </div>
        </div>

        {/* Entity Details Sidebar (Right) */}
        <aside className="absolute top-0 right-0 bottom-0 z-40 w-[32rem] overflow-y-auto border-l border-outline-variant/10 bg-surface-container-low">
          <div className="p-[2.4rem]">
            <div className="mb-[3.2rem] flex items-center justify-between">
              <span className="text-[1rem] font-bold uppercase tracking-[0.15em] text-outline">
                Entity Details
              </span>
              <button type="button" className="rounded-[0.125rem] p-[0.4rem] transition-colors hover:bg-surface-container-highest">
                <CloseIcon size="1.8rem" />
              </button>
            </div>

            {/* Entity Info */}
            <div className="mb-[3.2rem]">
              <div className="mb-[1.6rem] flex items-start gap-[1.6rem]">
                <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.5rem] bg-primary/10 text-primary">
                  <PsychologyIcon size="2.4rem" fill="#ffe2ab" />
                </div>
                <div>
                  <h3 className="font-headline text-[2rem] font-bold text-on-surface">
                    Neural Architecture
                  </h3>
                  <p className="text-[1.2rem] text-secondary">Concept Node • Tier 1</p>
                </div>
              </div>
              <p className="mb-[1.6rem] text-[1.4rem] leading-relaxed text-on-surface-variant">
                Primary structure for the cognitive engine, mapping recursive feedback loops to latent space interpretations.
              </p>
              <div className="flex flex-wrap gap-[0.8rem]">
                {["#architecture", "#ai-logic", "+4"].map(tag => (
                  <span key={tag} className="rounded-[0.375rem] border border-outline-variant/10 bg-surface-container-highest px-[0.8rem] py-[0.2rem] text-[1rem] text-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Relationships */}
            <div className="mb-[3.2rem]">
              <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                Active Relationships
              </h4>
              <div className="space-y-[1.2rem]">
                {[
                  { name: "Creative Logic", type: "Dashed", color: "text-secondary" },
                  { name: "Knowledge Base", type: "Direct", color: "text-primary" },
                ].map(({ name, type, color }) => (
                  <div key={name} className="group flex cursor-pointer items-center justify-between rounded-[0.25rem] border border-outline-variant/10 bg-surface-container-highest/50 p-[1.2rem] transition-colors hover:bg-surface-container-highest">
                    <div className="flex items-center gap-[1.2rem]">
                      <LinkIcon size="1.8rem" className={color} />
                      <span className="text-[1.2rem] font-medium">{name}</span>
                    </div>
                    <span className="text-[1rem] text-outline">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Notes */}
            <div>
              <h4 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-outline">
                Linked Notes
              </h4>
              <div className="space-y-[1.6rem]">
                {[
                  { title: "Feedback Loop Analysis", desc: "Initial experiments with recursive mapping yielded interesting results in the...", date: "Mar 12, 2024" },
                  { title: "Latent Space Projections", desc: "The architecture must support multi-modal projections without losing...", date: "Feb 28, 2024" },
                ].map(({ title, desc, date }) => (
                  <div key={title} className="group cursor-pointer">
                    <h5 className="mb-[0.4rem] text-[1.4rem] font-semibold text-on-surface transition-colors group-hover:text-primary">
                      {title}
                    </h5>
                    <p className="line-clamp-2 text-[1.2rem] text-on-surface-variant">{desc}</p>
                    <span className="mt-[0.8rem] block text-[1rem] text-outline">{date}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="mt-[4rem] w-full rounded-[0.25rem] border border-outline-variant/20 py-[1.2rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary/5">
              Expand Full Editor
            </button>
          </div>
        </aside>
      </div>
    </GlobalLayout>
  );
};

export default GraphPage;
