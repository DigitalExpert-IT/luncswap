import { RouteObject } from "react-router-dom";
import React from "react";

const SwapRoot = React.lazy(() => import("./swapRoot"));

const routes: RouteObject = {
  path: "/swap",
  element: <SwapRoot />,
};

export default routes;
