/* eslint-disable react-refresh/only-export-components */
import "./global.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/locales/index";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import theme from "@/theme";
import ErrorPage from "@/routes/errorPage.tsx";
import Root from "@/routes/root";
import devtoolsRoute from "@/routes/devtools";
import liqiudityRoute from "@/routes/addLiquidity";
import swapRoute from "@/routes/swap";
import { WalletProvider } from "@terra-money/wallet-kit";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as NiceModalProvider } from "@ebay/nice-modal-react";
import { piscoLCD } from "@/constant/Networks";
import { SwapMachineProvider, TokenMachineProvider } from "./machine";
import { LiquidityMachineProvider } from "./machine/liquidityMachineContext";

const Home = React.lazy(() => import("@/routes/home"));

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
      liqiudityRoute,
      swapRoute,
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider defaultNetworks={defaultNetworks}>
      <ChakraProvider theme={theme}>
        <TokenMachineProvider>
          <SwapMachineProvider>
            <LiquidityMachineProvider>
              <NiceModalProvider>
                <Suspense fallback={<></>}>
                  <RouterProvider router={routes} />
                </Suspense>
              </NiceModalProvider>
            </LiquidityMachineProvider>
          </SwapMachineProvider>
        </TokenMachineProvider>
      </ChakraProvider>
    </WalletProvider>
  </React.StrictMode>,
);
