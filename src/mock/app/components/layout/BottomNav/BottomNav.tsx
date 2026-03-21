import { NavLink } from "react-router-dom";

import {
  ChecklistIcon,
  EditorIcon,
  GraphIcon,
  SettingsIcon,
} from "@/mock/app/components/Icons";

const items = [
  { label: "Editor", path: "/", icon: EditorIcon },
  { label: "Graph", path: "/graph", icon: GraphIcon },
  { label: "Tasks", path: "/todos", icon: ChecklistIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[6.4rem] items-center justify-around bg-surface-container-low px-[2.4rem] md:hidden">
      {items.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-[0.4rem] ${
              isActive ? "text-primary" : "text-secondary opacity-60"
            }`
          }>
          <Icon size="2.4rem" />
          <span className="text-[1rem] font-bold">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
