import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { WalletProvider } from "@terra-money/wallet-kit";
import { LCDClientConfig } from "@terra-money/feather.js";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

console.log(theme);

const piscoLCD: LCDClientConfig = {
  lcd: "https://pisco-lcd.terra.dev",
  chainID: "pisco-1",
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 2,
  prefix: "terra",
};

const defaultNetworks = { "pisco-1": piscoLCD };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <WalletProvider defaultNetworks={defaultNetworks}>
        <App />
      </WalletProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
