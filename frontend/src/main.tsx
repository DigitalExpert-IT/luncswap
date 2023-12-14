import React from "react";
import ReactDOM from "react-dom/client";
import Home from "@/routes/home";
import theme from "@/theme";
import { WalletProvider } from "@terra-money/wallet-kit";
import { LCDClientConfig } from "@terra-money/feather.js";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "@/routes/errorPage.tsx";

const piscoLCD: LCDClientConfig = {
  lcd: "https://pisco-lcd.terra.dev",
  chainID: "pisco-1",
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 2,
  prefix: "terra",
};

const defaultNetworks = { "pisco-1": piscoLCD };
const routes = createBrowserRouter([
  { path: "/", element: <Home />, errorElement: <ErrorPage />, children: [] },
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
