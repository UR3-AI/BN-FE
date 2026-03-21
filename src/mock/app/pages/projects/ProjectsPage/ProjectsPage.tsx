import { useState } from "react";

import { DeleteIcon, FolderIcon, PlusCircleIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useCreateProjectMutation from "@/mock/lib/apis/mutations/projects/useCreateProjectMutation/useCreateProjectMutation";
import useDeleteProjectMutation from "@/mock/lib/apis/mutations/projects/useDeleteProjectMutation/useDeleteProjectMutation";
import useProjectsQuery from "@/mock/lib/apis/queries/projects/useProjectsQuery/useProjectsQuery";
import { useQueryClient } from "@tanstack/react-query";

const PROJECT_COLORS = [
  "#9fd0cd",
  "#ffe2ab",
  "#f4a8b5",
  "#a8c5f4",
  "#c4b5f4",
  "#b5f4c4",
];

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useProjectsQuery();
  const createMutation = useCreateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const projects = data?.items ?? [];

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim(), description: description.trim() || undefined, color },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setName("");
          setDescription("");
          setColor(PROJECT_COLORS[0]);
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
    });
  };

  if (isLoading) {
    return (
      <GlobalLayout
        topbarTitle="Projects"
        showSearch={false}>
        <div className="flex flex-1 items-center justify-center text-[1.4rem] text-on-surface-variant">
          Loading...
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout
      topbarTitle="Projects"
      showSearch={false}>
      <div className="flex-1 overflow-y-auto p-[2.4rem] md:p-[4rem]">
        <div className="mx-auto max-w-[96rem]">
          {/* Header */}
          <div className="mb-[3.2rem] flex items-center justify-between">
            <div className="flex items-center gap-[1.6rem]">
              <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.8rem] bg-primary/10">
                <FolderIcon size="2.4rem" />
              </div>
              <div>
                <h2 className="font-headline text-[2.4rem] font-bold text-on-surface">
                  Projects
                </h2>
                <p className="text-[1.4rem] text-on-surface-variant">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(prev => !prev)}
              className="flex items-center gap-[0.8rem] rounded-[0.375rem] bg-primary px-[2rem] py-[1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95">
              <PlusCircleIcon size="1.8rem" />
              New Project
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="mb-[3.2rem] rounded-[0.5rem] bg-surface-container-low p-[3.2rem] shadow-sm">
              <h3 className="mb-[2.4rem] font-headline text-[1.8rem] font-bold text-on-surface">
                Create New Project
              </h3>
              <div className="space-y-[2rem]">
                <div className="space-y-[0.8rem]">
                  <label
                    htmlFor="project-name"
                    className="block text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                    Project Name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full rounded-t-[0.125rem] border-0 border-b-2 border-outline-variant/20 bg-surface-container-highest px-[1.6rem] py-[1.2rem] text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="space-y-[0.8rem]">
                  <label
                    htmlFor="project-desc"
                    className="block text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                    Description
                  </label>
                  <textarea
                    id="project-desc"
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full resize-none rounded-t-[0.125rem] border-0 border-b-2 border-outline-variant/20 bg-surface-container-highest px-[1.6rem] py-[1.2rem] text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="space-y-[0.8rem]">
                  <span className="block text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                    Color
                  </span>
                  <div className="flex gap-[1.2rem]">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-[3.2rem] w-[3.2rem] rounded-full transition-all ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-[1.2rem] pt-[0.8rem]">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!name.trim() || createMutation.isPending}
                    className="rounded-[0.375rem] bg-primary px-[2.4rem] py-[1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                    {createMutation.isPending ? "Creating..." : "Create Project"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-[0.375rem] border border-outline-variant/20 px-[2.4rem] py-[1rem] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Cards Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-[2.4rem] py-[9.6rem]">
              <FolderIcon size="4.8rem" />
              <p className="text-[1.6rem] text-on-surface-variant">
                No projects yet. Create your first project.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[2rem] sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="group relative rounded-[0.5rem] bg-surface-container-low p-[2.4rem] shadow-sm transition-colors hover:bg-surface-container">
                  <div
                    className="mb-[1.6rem] h-[0.4rem] w-[4rem] rounded-full"
                    style={{ backgroundColor: project.color ?? "#9fd0cd" }}
                  />
                  <h3 className="mb-[0.8rem] font-headline text-[1.8rem] font-bold text-on-surface">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mb-[1.6rem] text-[1.4rem] leading-relaxed text-on-surface-variant">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[1.2rem] text-secondary">
                      {project.note_count} note{project.note_count !== 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 transition-opacity group-hover:opacity-100">
                      <DeleteIcon size="1.8rem" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlobalLayout>
  );
};

export default ProjectsPage;
