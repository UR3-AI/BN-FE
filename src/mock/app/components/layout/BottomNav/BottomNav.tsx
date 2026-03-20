import {
  ChecklistIcon,
  EditorIcon,
  GraphIcon,
  SettingsIcon,
} from "@/mock/app/components/Icons";

interface BottomNavProps {
  activeMenu?: string;
}

const items = [
  { label: "Editor", id: "editor", icon: EditorIcon },
  { label: "Graph", id: "graph", icon: GraphIcon },
  { label: "Tasks", id: "todos", icon: ChecklistIcon },
  { label: "Settings", id: "settings", icon: SettingsIcon },
];

const BottomNav = ({ activeMenu = "editor" }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[6.4rem] items-center justify-around bg-surface-container-low px-[2.4rem] md:hidden">
      {items.map(({ label, id, icon: Icon }) => (
        <a
          key={id}
          href="#"
          className={`flex flex-col items-center gap-[0.4rem] ${
            activeMenu === id
              ? "text-primary"
              : "text-secondary opacity-60"
          }`}>
          <Icon size="2.4rem" />
          <span className="text-[1rem] font-bold">{label}</span>
        </a>
      ))}
    </nav>
  );
};

export default BottomNav;
