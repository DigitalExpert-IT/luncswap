import { LayoutMain } from "@/components/layout/LayoutMain";
import { Outlet } from "react-router-dom";
// import Statistics from "./Statistics";

function Root() {
  return (
    <LayoutMain>
      <Outlet />
      {/* <Statistics /> */}
    </LayoutMain>
  );
}

export default Root;
