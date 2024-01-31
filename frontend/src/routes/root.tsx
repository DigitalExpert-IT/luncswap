import { LayoutMain } from "@/components/layout/LayoutMain";
import { Outlet } from "react-router-dom";

function Root() {
  return (
    <LayoutMain>
      <Outlet />
    </LayoutMain>
  );
}

export default Root;
