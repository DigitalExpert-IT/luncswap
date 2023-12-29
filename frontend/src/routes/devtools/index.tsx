import { RouteObject } from "react-router-dom";
import Root from "./dtRoot";
import React from "react";

const TokenFactory = React.lazy(() => import("./dtTokenFactory"));
const Swap = React.lazy(() => import("./dtSwap"));
const AddLiquidity = React.lazy(() => import("./dtAddLiquidity"));
const Pool = React.lazy(() => import("./dtPool"));

const routes: RouteObject = {
  path: "/devtools",
  element: <Root />,
  children: [
    {
      path: "/devtools",
      element: <TokenFactory />,
    },
    {
      path: "/devtools/swap",
      element: <Swap />,
    },
    {
      path: "/devtools/add_liquidity",
      element: <AddLiquidity />,
    },
    {
      path: "/devtools/pool",
      element: <Pool />,
    },
  ],
};

export default routes;
