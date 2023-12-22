import { RouteObject } from "react-router-dom";
import Root from "./dtRoot";
import React from "react";

const TokenFactory = React.lazy(() => import("./dtTokenFactory"));

const routes: RouteObject = {
  path: "/devtools",
  element: <Root />,
  children: [
    {
      path: "/devtools",
      element: <TokenFactory />,
    },
  ],
};

export default routes;
