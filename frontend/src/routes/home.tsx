import { useState, useEffect } from "react";
import {
  useConnectedWallet,
  useWallet,
  useLcdClient,
} from "@terra-money/wallet-kit";
import { Button, Box, Text } from "@chakra-ui/react";
import { AddLiquidity } from "./swap/addLiquidity";

function Home() {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();
  const [bank, setBank] = useState<null | string>();
  const { connect, disconnect, availableWallets } = useWallet();

  useEffect(() => {
    if (connectedWallet) {
      lcd.bank.balance(connectedWallet.address).then(([coins]) => {
        setBank(coins.toString());
      });
    } else {
      setBank(null);
    }
  }, [connectedWallet, lcd]);

  return (
    <Box>
      {connectedWallet ? (
        <Button onClick={() => disconnect()} colorScheme="red">
          Disconnect
        </Button>
      ) : (
        availableWallets.map(item => (
          <Button
            onClick={() => connect(item.id)}
            disabled={!item.isInstalled}
            key={item.id}
            colorScheme="green"
          >
            Connect by {item.name}
          </Button>
        ))
      )}
      <Text mt="2rem">Network Name: {connectedWallet?.network} </Text>
      <Text>
        Your Balances: {connectedWallet ? bank : "please connect wallet"}
      </Text>
      <AddLiquidity />
    </Box>
  );
}

export default Home;
