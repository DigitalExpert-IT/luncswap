/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import theme from "@/theme";
import ErrorPage from "@/routes/errorPage.tsx";
import { WalletProvider } from "@terra-money/wallet-kit";
import { LCDClientConfig } from "@terra-money/feather.js";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as NiceModalProvider } from "@ebay/nice-modal-react";
import Root from "@/routes/root";
import devtoolsRoute from "@/routes/devtools";
import Swap from "./routes/swap";
import "./locales/index";

const Home = React.lazy(() => import("@/routes/home"));

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
      devtoolsRoute,
    ],
  },
  {
    path: "/swap",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/swap",
        element: <Swap />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider defaultNetworks={defaultNetworks}>
      <ChakraProvider theme={theme}>
        <NiceModalProvider>
          <RouterProvider router={routes} />
        </NiceModalProvider>
      </ChakraProvider>
    </WalletProvider>
  </React.StrictMode>,
);
