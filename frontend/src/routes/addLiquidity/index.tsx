import { RouteObject } from "react-router-dom";
import React from "react";

const AddLiquidity = React.lazy(() => import("./AddLiquidityRoot"));

const routes: RouteObject = {
  path: "/addLiquidity",
  element: <AddLiquidity />,
};

export default routes;
