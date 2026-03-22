import { useState } from "react";

import {
  CloseIcon,
  DeleteIcon,
  DescriptionIcon,
  FolderIcon,
  LinkIcon,
  PlusCircleIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useCreateProjectMutation from "@/mock/lib/apis/mutations/projects/useCreateProjectMutation/useCreateProjectMutation";
import useDeleteProjectMutation from "@/mock/lib/apis/mutations/projects/useDeleteProjectMutation/useDeleteProjectMutation";
import useProjectNotesMutation from "@/mock/lib/apis/mutations/projects/useProjectNotesMutation/useProjectNotesMutation";
import useProjectDetailQuery from "@/mock/lib/apis/queries/projects/useProjectDetailQuery/useProjectDetailQuery";
import useProjectsQuery from "@/mock/lib/apis/queries/projects/useProjectsQuery/useProjectsQuery";
import useNotesQuery from "@/mock/lib/apis/queries/notes/useNotesQuery/useNotesQuery";
import { useQueryClient } from "@tanstack/react-query";

const PROJECT_COLORS = [
  "#9fd0cd",
  "#ffe2ab",
  "#f4a8b5",
  "#a8c5f4",
  "#c4b5f4",
  "#b5f4c4",
];

const ProjectDetailPanel = ({
  projectId,
  onClose,
}: {
  projectId: string | null;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { data: project } = useProjectDetailQuery(projectId ?? "");
  const { data: notesData } = useNotesQuery({ limit: 50 });
  const projectNotesMutation = useProjectNotesMutation();
  const [noteInput, setNoteInput] = useState("");

  const notes = notesData?.items ?? [];

  const handleAddNote = () => {
    const noteNumber = parseInt(noteInput.trim(), 10);
    if (!projectId || isNaN(noteNumber) || noteNumber <= 0) return;
    projectNotesMutation.mutate(
      { projectId, noteNumber, action: "add" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setNoteInput("");
        },
      },
    );
  };

  const handleRemoveNote = (noteNumber: number) => {
    if (!projectId) return;
    projectNotesMutation.mutate(
      { projectId, noteNumber, action: "remove" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
      },
    );
  };

  return (
    <div className="p-[2.4rem]">
      <div className="mb-[3.2rem] flex items-center justify-between">
        <span className="text-[1rem] font-bold uppercase tracking-[0.2em] text-primary">
          Project Detail
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="text-on-surface/40 transition-colors hover:text-on-surface">
          <CloseIcon
            size="2rem"
            stroke="currentColor"
          />
        </button>
      </div>

      {!project && (
        <div className="flex flex-col items-center justify-center py-[8rem] text-center">
          <FolderIcon
            size="4rem"
            className="mb-[1.6rem] opacity-40"
          />
          <p className="text-[1.4rem] text-on-surface-variant">
            Select a project to manage notes
          </p>
        </div>
      )}

      {project && (
        <div className="space-y-[3.2rem]">
          {/* Project Info */}
          <div>
            <div
              className="mb-[1.6rem] h-[0.4rem] w-[4rem] rounded-full"
              style={{ backgroundColor: project.color ?? "#9fd0cd" }}
            />
            <h2 className="mb-[0.8rem] font-headline text-[2.2rem] font-bold text-on-surface">
              {project.name}
            </h2>
            {project.description && (
              <p className="text-[1.4rem] leading-relaxed text-on-surface-variant">
                {project.description}
              </p>
            )}
            <span className="mt-[0.8rem] block text-[1.2rem] text-secondary">
              {project.note_count} note{project.note_count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Add Note */}
          <div className="space-y-[1.2rem]">
            <h4 className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface/40">
              Add Note to Project
            </h4>
            <div className="flex gap-[0.8rem]">
              <select
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                className="flex-1 rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-highest px-[1.2rem] py-[0.8rem] text-[1.2rem] text-on-surface focus:border-primary/50 focus:outline-none">
                <option value="">Select a note...</option>
                {notes.map(note => (
                  <option
                    key={note.note_number}
                    value={note.note_number}>
                    #{note.note_number} {note.title ?? "Untitled"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!noteInput || projectNotesMutation.isPending}
                className="flex items-center gap-[0.4rem] rounded-[0.25rem] bg-primary px-[1.2rem] py-[0.8rem] text-[1.1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                <PlusCircleIcon size="1.4rem" />
                Add
              </button>
            </div>
          </div>

          {/* Recent Notes */}
          {project.recent_notes.length > 0 && (
              <div className="space-y-[1.2rem]">
                <h4 className="text-[1rem] font-bold uppercase tracking-[0.15em] text-on-surface/40">
                  Notes in Project
                </h4>
                <div className="space-y-[0.8rem]">
                  {project.recent_notes.map(note => (
                    <div
                      key={note.note_number}
                      className="group flex items-center justify-between rounded-[0.25rem] bg-surface-container-low p-[1.2rem] transition-colors hover:bg-surface-container">
                      <div className="flex items-center gap-[1.2rem]">
                        <DescriptionIcon
                          size="1.8rem"
                          fill="#ffe2ab"
                        />
                        <div>
                          <p className="text-[1.3rem] font-medium text-on-surface">
                            {note.title ?? "Untitled"}
                          </p>
                          <p className="text-[1rem] text-outline">
                            Note #{note.note_number}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(note.note_number)}
                        disabled={projectNotesMutation.isPending}
                        className="text-secondary opacity-0 transition-all hover:text-error group-hover:opacity-100 disabled:opacity-50">
                        <LinkIcon
                          size="1.4rem"
                          fill="currentColor"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useProjectsQuery();
  const createMutation = useCreateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
        if (selectedProjectId === projectId) setSelectedProjectId(null);
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
      showSearch={false}
      sidePanel={
        <ProjectDetailPanel
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />
      }>
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
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative cursor-pointer rounded-[0.5rem] bg-surface-container-low p-[2.4rem] shadow-sm transition-all hover:bg-surface-container ${
                    selectedProjectId === project.id
                      ? "ring-2 ring-primary/50"
                      : ""
                  }`}>
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
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
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
