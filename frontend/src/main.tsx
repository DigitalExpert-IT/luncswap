/* eslint-disable react-refresh/only-export-components */
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import theme from "@/theme";
import ErrorPage from "@/routes/errorPage.tsx";
import Root from "@/routes/root";
import { WalletProvider } from "@terra-money/wallet-kit";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as NiceModalProvider } from "@ebay/nice-modal-react";
import { piscoLCD } from "./constant/Networks";
import { AppProvider } from "./provider";
import devtoolsRoute from "@/routes/devtools";
import swapRoute from "./routes/swap";
import "./locales/index";

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
      swapRoute,
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider defaultNetworks={defaultNetworks}>
      <ChakraProvider theme={theme}>
        <AppProvider>
          <NiceModalProvider>
            <Suspense fallback={<></>}>
              <RouterProvider router={routes} />
            </Suspense>
          </NiceModalProvider>
        </AppProvider>
      </ChakraProvider>
    </WalletProvider>
  </React.StrictMode>,
);
