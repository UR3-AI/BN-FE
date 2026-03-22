import { useState } from "react";

import { NavLink } from "react-router-dom";

import {
  ArchiveIcon,
  ChecklistIcon,
  ChevronRightIcon,
  DashboardIcon,
  EditorIcon,
  FolderIcon,
  GraphIcon,
  HelpIcon,
  PlusCircleIcon,
  SettingsIcon,
  SparklesIcon,
} from "@/mock/app/components/Icons";
import useProjectTreeQuery from "@/mock/lib/apis/queries/projects/useProjectTreeQuery/useProjectTreeQuery";
import type { ProjectTreeNode } from "@/mock/lib/apis/queries/projects/useProjectTreeQuery/useProjectTreeQuery.type";

const mainNav = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Editor", path: "/", icon: EditorIcon },
  { label: "Knowledge Graph", path: "/graph", icon: GraphIcon },
  { label: "To-Dos", path: "/todos", icon: ChecklistIcon },
  { label: "Chat", path: "/chat", icon: SparklesIcon },
  { label: "Projects", path: "/projects", icon: FolderIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

const bottomNav = [
  { label: "Archive", path: "/archive", icon: ArchiveIcon },
  { label: "Help", path: "/help", icon: HelpIcon },
];

const TreeNode = ({ node, depth = 0 }: { node: ProjectTreeNode; depth?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setExpanded(prev => !prev)}
        className="flex w-full items-center gap-[0.8rem] rounded-[0.25rem] py-[0.6rem] text-left text-[1.2rem] text-secondary transition-colors hover:bg-surface-container hover:text-primary"
        style={{ paddingLeft: `${1.2 + depth * 1.6}rem` }}>
        {hasChildren ? (
          <ChevronRightIcon
            size="1.4rem"
            stroke="currentColor"
            className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-[1.4rem] flex-shrink-0" />
        )}
        <span
          className="mr-[0.4rem] inline-block h-[0.8rem] w-[0.8rem] flex-shrink-0 rounded-full"
          style={{ backgroundColor: node.color ?? "#9fd0cd" }}
        />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto flex-shrink-0 pr-[0.8rem] text-[1rem] text-outline">
          {node.note_count}
        </span>
      </button>
      {expanded &&
        node.children.map(child => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
          />
        ))}
    </div>
  );
};

const Sidebar = () => {
  const { data: treeData } = useProjectTreeQuery();
  const projectTree = treeData?.items ?? [];

  return (
    <aside className="sticky top-0 left-0 hidden h-screen w-[25.6rem] flex-col bg-surface-container-low px-[1.6rem] py-[3.2rem] font-body text-[1.4rem] tracking-wide md:flex">
      <div className="mb-[4rem] px-[1.6rem]">
        <div className="mb-[0.4rem] flex items-center gap-[0.8rem]">
          <span className="font-headline text-[1.8rem] font-bold text-primary">
            Second Brain
          </span>
        </div>
        <div className="text-[1rem] uppercase tracking-[0.2em] text-secondary opacity-60">
          Digital Atelier
        </div>
      </div>

      <nav className="flex-1 space-y-[0.4rem] overflow-y-auto">
        {mainNav.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-[1.2rem] rounded-[0.375rem] px-[1.6rem] py-[1.2rem] transition-all duration-200 ${
                isActive
                  ? "bg-surface-container-highest text-primary"
                  : "text-secondary hover:bg-surface-container hover:text-primary"
              }`
            }>
            <Icon size="2.4rem" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Project Tree */}
        {projectTree.length > 0 && (
          <div className="mt-[1.6rem] border-t border-outline-variant/10 pt-[1.6rem]">
            <span className="mb-[0.8rem] block px-[1.6rem] text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
              Projects
            </span>
            {projectTree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
              />
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto space-y-[0.4rem] pt-[3.2rem]">
        <button
          type="button"
          className="mb-[2.4rem] flex w-full items-center justify-center gap-[0.8rem] rounded-[0.25rem] bg-primary py-[1.2rem] font-semibold text-on-primary transition-transform active:scale-95">
          <PlusCircleIcon size="2rem" />
          New Node
        </button>

        {bottomNav.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-[1.2rem] px-[1.6rem] py-[1.2rem] transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-secondary hover:bg-surface-container hover:text-primary"
              }`
            }>
            <Icon size="2rem" />
            <span className="text-[1.2rem]">{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
