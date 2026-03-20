import {
  CheckboxBlankIcon,
  CheckboxIcon,
  LinkIcon,
  SparklesIcon,
  TreeIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const AISidePanel = () => {
  return (
    <div className="p-[2.4rem]">
      {/* Header */}
      <div className="mb-[3.2rem] flex items-center justify-between">
        <h2 className="font-headline text-[1.4rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          AI Synthesis
        </h2>
        <div className="flex items-center gap-[0.8rem] rounded-[0.125rem] bg-primary/10 px-[0.8rem] py-[0.4rem]">
          <div className="h-[0.6rem] w-[0.6rem] animate-pulse rounded-full bg-primary" />
          <span className="text-[1rem] font-bold uppercase tracking-tighter text-primary">
            Processing
          </span>
        </div>
      </div>

      {/* Focus Plate: Summary */}
      <div className="mb-[2.4rem] rounded-[0.25rem] border-b border-outline-variant/20 bg-surface-container-highest p-[2.4rem]">
        <h3 className="mb-[1.2rem] flex items-center gap-[0.8rem] text-[1.2rem] font-bold text-primary">
          <SparklesIcon
            size="1.6rem"
            fill="#ffe2ab"
          />
          Executive Summary
        </h3>
        <p className="text-[1.4rem] leading-relaxed text-on-surface/80">
          This note discusses the psychological foundations of creative flow
          within digital environments, emphasizing the shift from hierarchical
          storage to nodal association networks.
        </p>
      </div>

      {/* Metadata Nodes */}
      <div className="mb-[3.2rem]">
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Metadata Nodes
        </h3>
        <div className="flex flex-wrap gap-[0.8rem]">
          {["#cognitive_load", "#digital_minimalism", "#ai_augmentation", "#flow_state"].map(
            tag => (
              <span
                key={tag}
                className="rounded-full border border-outline-variant/10 bg-surface-container px-[1.2rem] py-[0.4rem] text-[1.2rem] font-medium text-secondary">
                {tag}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Extracted Actions */}
      <div>
        <h3 className="mb-[1.6rem] text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Extracted Actions
        </h3>
        <div className="space-y-[1.2rem]">
          <div className="flex items-start gap-[1.2rem] rounded-[0.125rem] border-l-2 border-primary/40 bg-surface-container/40 p-[1.2rem]">
            <CheckboxBlankIcon
              size="1.8rem"
              fill="#ffe2ab"
            />
            <div>
              <p className="text-[1.2rem] font-medium text-on-surface">
                Reference vellum texture studies
              </p>
              <p className="mt-[0.4rem] text-[1rem] text-on-surface-variant">
                Due: Tomorrow
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.2rem] rounded-[0.125rem] border-l-2 border-outline/20 bg-surface-container/40 p-[1.2rem] opacity-60">
            <CheckboxIcon
              size="1.8rem"
              fill="#9c8f78"
            />
            <div>
              <p className="text-[1.2rem] font-medium text-on-surface line-through">
                Define 'Digital Atelier' concept
              </p>
              <p className="mt-[0.4rem] text-[1rem] text-on-surface-variant">
                Completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Graph Placeholder */}
      <div className="mt-[4.8rem] flex aspect-square flex-col items-center justify-center rounded-[0.5rem] border border-outline-variant/10 bg-surface-container-lowest p-[1.6rem] text-center">
        <div className="relative mb-[1.6rem] flex h-[12.8rem] w-[12.8rem] items-center justify-center">
          <TreeIcon
            size="3rem"
            fill="#ffe2ab"
          />
        </div>
        <span className="text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Contextual Graph
        </span>
        <p className="mt-[0.8rem] px-[1.6rem] text-[1rem] text-outline">
          4 active nodes identified in current text segment
        </p>
      </div>
    </div>
  );
};

const EditorPage = () => {
  return (
    <GlobalLayout
      activeMenu="editor"
      breadcrumb={[
        { label: "Projects" },
        { label: "Digital Philosophy v2", active: true },
      ]}
      sidePanel={<AISidePanel />}>
      {/* Distraction-free Writing Area */}
      <div className="mx-auto max-w-[89.6rem] flex-1 px-[3.2rem] pt-[6.4rem] pb-[12.8rem] md:px-[6.4rem]">
        {/* Draft Badge */}
        <div className="mb-[4.8rem]">
          <div className="mb-[1.6rem] flex items-center gap-[1.6rem]">
            <span className="rounded-[0.125rem] bg-secondary-container/30 px-[0.8rem] py-[0.2rem] text-[1rem] font-semibold uppercase tracking-[0.3em] text-secondary">
              Draft
            </span>
            <span className="text-[1.1rem] italic text-outline">
              Modified 2 hours ago
            </span>
          </div>
          <h1 className="mb-[3.2rem] font-headline text-[5rem] font-extrabold leading-tight tracking-tighter text-on-surface">
            Exploring the Intersections of Neural Interfaces and Creative Flow
          </h1>
        </div>

        {/* Article Content */}
        <article>
          <div className="space-y-[2.4rem] font-body text-[2rem] leading-relaxed text-on-surface/90">
            <p>
              Deep work is not merely a state of focus; it is a structural
              realignment of the cognitive environment. When we engage with the
              digital atelier, we are attempting to reduce the friction between
              the thought and its recorded artifact.
            </p>
            <p>
              Modern cognitive architectures require a nuanced approach to
              knowledge retrieval. Instead of flat hierarchies, we should look
              towards nodal structures where every piece of data acts as a
              waypoint for future associations. The integration of AI isn't about
              replacing the writer, but about providing a structural vellum that
              guides the expansion of concepts.
            </p>
            <p className="border-l-2 border-primary/20 pl-[2.4rem] italic text-on-surface-variant">
              "The tool we use to think becomes the architect of the thoughts we
              have."
            </p>
            <p>
              As we navigate this landscape, the status of the 'editor' shifts
              from a passive container to an active participant. AI analysis
              provides the metadata—the invisible strings that pull disparate
              notes together into a cohesive knowledge graph.
            </p>
          </div>
        </article>

        {/* Cognitive Associations */}
        <section className="mt-[9.6rem] border-t border-outline-variant/10 pt-[4.8rem]">
          <h3 className="mb-[2.4rem] flex items-center gap-[0.8rem] font-headline text-[1.8rem] font-bold text-primary">
            <LinkIcon
              size="1.8rem"
              fill="#ffe2ab"
            />
            Cognitive Associations
          </h3>
          <div className="grid grid-cols-1 gap-[1.6rem] md:grid-cols-2">
            <div className="group cursor-pointer rounded-[0.25rem] bg-surface-container-low p-[2rem] transition-colors hover:bg-surface-container">
              <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary">
                NEURAL_DYNAMICS.MD
              </span>
              <h4 className="font-headline font-semibold text-on-surface transition-colors group-hover:text-primary">
                Bio-feedback loops in UI design
              </h4>
              <p className="mt-[0.8rem] line-clamp-2 text-[1.4rem] text-on-surface-variant">
                Exploring how physiological data can inform responsive layout
                systems...
              </p>
            </div>
            <div className="group cursor-pointer rounded-[0.25rem] bg-surface-container-low p-[2rem] transition-colors hover:bg-surface-container">
              <span className="mb-[0.8rem] block text-[1rem] font-bold uppercase tracking-[0.15em] text-secondary">
                WORKSPACE_THEORY.MD
              </span>
              <h4 className="font-headline font-semibold text-on-surface transition-colors group-hover:text-primary">
                Physicality in digital interfaces
              </h4>
              <p className="mt-[0.8rem] line-clamp-2 text-[1.4rem] text-on-surface-variant">
                The psychological benefits of skeuomorphic grounding in creative
                environments...
              </p>
            </div>
          </div>
        </section>
      </div>
    </GlobalLayout>
  );
};

export default EditorPage;
