import React from "react";
import { RouteObject } from "react-router-dom";
import Root from "./swapRoot";

const Swap = React.lazy(() => import("./swap"));

const routes: RouteObject = {
  path: "/swap",
  element: <Root />,
  children: [
    {
      path: "/swap",
      element: <Swap />,
    },
  ],
};

export default routes;
