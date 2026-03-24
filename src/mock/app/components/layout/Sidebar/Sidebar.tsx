import { useCallback, useRef, useState } from "react";

import { NavLink } from "react-router-dom";

import {
  ArchiveIcon,
  ChecklistIcon,
  ChevronLeftIcon,
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

const COLLAPSED_WIDTH = 64;
const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 64;
const MAX_WIDTH = 400;
const COLLAPSE_THRESHOLD = 120;

const TreeNode = ({ node, depth = 0, collapsed }: { node: ProjectTreeNode; depth?: number; collapsed: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  if (collapsed) return null;

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
            collapsed={collapsed}
          />
        ))}
    </div>
  );
};

const Sidebar = () => {
  const { data: treeData } = useProjectTreeQuery();
  const projectTree = treeData?.items ?? [];

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);

  const effectiveWidth = collapsed ? COLLAPSED_WIDTH : sidebarWidth;

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startW: collapsed ? COLLAPSED_WIDTH : sidebarWidth };
    },
    [sidebarWidth, collapsed],
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const delta = e.clientX - dragRef.current.startX;
      const newWidth = dragRef.current.startW + delta;

      if (newWidth < COLLAPSE_THRESHOLD) {
        setCollapsed(true);
        setSidebarWidth(DEFAULT_WIDTH);
      } else {
        setCollapsed(false);
        setSidebarWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
      }
    },
    [],
  );

  const onResizePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div className="sticky top-0 left-0 hidden h-screen shrink-0 md:flex">
      <aside
        className="flex flex-col overflow-hidden bg-surface-container-low py-[3.2rem] font-body text-[1.4rem] tracking-wide transition-[width] duration-150"
        style={{ width: `${effectiveWidth}px` }}>
        {/* Header */}
        <div className={`mb-[4rem] ${collapsed ? "px-[0.8rem]" : "px-[3.2rem]"}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex w-full items-center justify-center rounded-[0.25rem] py-[0.8rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant"
              title="Expand sidebar">
              <ChevronRightIcon
                size="1.8rem"
                stroke="currentColor"
              />
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-[0.4rem] font-headline text-[1.8rem] font-bold text-primary">
                  Second Brain
                </div>
                <div className="text-[1rem] uppercase tracking-[0.2em] text-secondary opacity-60">
                  Digital Atelier
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="rounded-[0.25rem] p-[0.4rem] text-on-surface-variant/40 transition-colors hover:bg-surface-container hover:text-on-surface-variant"
                title="Collapse sidebar">
                <ChevronLeftIcon
                  size="1.6rem"
                  stroke="currentColor"
                />
              </button>
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-[0.4rem] overflow-y-auto px-[0.8rem]">
          {mainNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-[1.2rem] rounded-[0.375rem] py-[1.2rem] transition-all duration-200 ${
                  collapsed ? "justify-center px-[0.8rem]" : "px-[1.6rem]"
                } ${
                  isActive
                    ? "bg-surface-container-highest text-primary"
                    : "text-secondary hover:bg-surface-container hover:text-primary"
                }`
              }>
              <Icon size="2.4rem" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {/* Project Tree */}
          {!collapsed && projectTree.length > 0 && (
            <div className="mt-[1.6rem] border-t border-outline-variant/10 pt-[1.6rem]">
              <span className="mb-[0.8rem] block px-[1.6rem] text-[1rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
                Projects
              </span>
              {projectTree.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="mt-auto space-y-[0.4rem] px-[0.8rem] pt-[3.2rem]">
          {collapsed ? (
            <button
              type="button"
              title="New Node"
              className="mb-[2.4rem] flex w-full items-center justify-center rounded-[0.25rem] bg-primary py-[1.2rem] text-on-primary transition-transform active:scale-95">
              <PlusCircleIcon size="2rem" />
            </button>
          ) : (
            <button
              type="button"
              className="mb-[2.4rem] flex w-full items-center justify-center gap-[0.8rem] rounded-[0.25rem] bg-primary py-[1.2rem] font-semibold text-on-primary transition-transform active:scale-95">
              <PlusCircleIcon size="2rem" />
              New Node
            </button>
          )}

          {bottomNav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-[1.2rem] py-[1.2rem] transition-all duration-200 ${
                  collapsed ? "justify-center px-[0.8rem]" : "px-[1.6rem]"
                } ${
                  isActive
                    ? "text-primary"
                    : "text-secondary hover:bg-surface-container hover:text-primary"
                }`
              }>
              <Icon size="2rem" />
              {!collapsed && <span className="truncate text-[1.2rem]">{label}</span>}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Resize Handle */}
      <div
        className="shrink-0 cursor-col-resize touch-none select-none border-r border-outline-variant/5 transition-colors hover:bg-primary/20 active:bg-primary/40"
        style={{ width: "6px" }}
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
      />
    </div>
  );
};

export default Sidebar;
