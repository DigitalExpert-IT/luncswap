import { RouteObject } from "react-router-dom";
import React from "react";

const MyLiquidity = React.lazy(() => import("./MyLiquidity"));

const routes: RouteObject = {
    path: "/myLiquidity",
    element: <MyLiquidity />,
};

export default routes;
