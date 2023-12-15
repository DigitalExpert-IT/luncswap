/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import theme from "@/theme";
import ErrorPage from "@/routes/errorPage.tsx";
import { WalletProvider } from "@terra-money/wallet-kit";
import { LCDClientConfig } from "@terra-money/feather.js";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "@/routes/root";

const Home = React.lazy(() => import("@/routes/home"));
const DevTools = React.lazy(() => import("@/routes/devtools"));

const piscoLCD: LCDClientConfig = {
  lcd: "https://pisco-lcd.terra.dev",
  chainID: "pisco-1",
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 2,
  prefix: "terra",
};

const defaultNetworks = { "pisco-1": piscoLCD };
const routes = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "devtools",
        element: <DevTools />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <WalletProvider defaultNetworks={defaultNetworks}>
        <RouterProvider router={routes} />
      </WalletProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
