import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@app/components";

import { NAV_ITEMS } from "./Sidebar.constants";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="w-[8rem] h-full py-[1.6rem] flex flex-col items-center shrink-0 gap-[2.4rem] bg-gray-bg">
      <header className="text-[1.6rem] font-bold text-text-primary">BN</header>

      <nav className="flex flex-col gap-[0.8rem] flex-1">
        {NAV_ITEMS.map(({ label, path }) => (
          <Button
            key={path}
            variant={pathname.startsWith(path) ? "primary" : "text"}
            size="s"
            className="w-[6rem] h-[6rem] !text-[1.2rem]"
            onClick={() => navigate(path)}>
            {label}
          </Button>
        ))}
      </nav>

      <footer>
        <Button
          variant="text"
          size="s"
          className="w-[6rem] h-[6rem] !text-[1.2rem]">
          User
        </Button>
      </footer>
    </aside>
  );
};

export default Sidebar;
