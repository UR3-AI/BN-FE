import { NavLink } from "react-router-dom";

import {
  ArchiveIcon,
  ChecklistIcon,
  DashboardIcon,
  EditorIcon,
  GraphIcon,
  HelpIcon,
  PlusCircleIcon,
  SettingsIcon,
} from "@/mock/app/components/Icons";

const mainNav = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Editor", path: "/", icon: EditorIcon },
  { label: "Knowledge Graph", path: "/graph", icon: GraphIcon },
  { label: "To-Dos", path: "/todos", icon: ChecklistIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

const bottomNav = [
  { label: "Archive", path: "/archive", icon: ArchiveIcon },
  { label: "Help", path: "/help", icon: HelpIcon },
];

const Sidebar = () => {
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

      <nav className="flex-1 space-y-[0.4rem]">
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
