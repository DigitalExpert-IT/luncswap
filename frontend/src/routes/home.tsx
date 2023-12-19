import { useState, useEffect } from "react";
import {
  useConnectedWallet,
  useWallet,
  useLcdClient,
} from "@terra-money/wallet-kit";
import { Button, Box, Text } from "@chakra-ui/react";
import { useQueryContract } from "@/hooks";

function Home() {
  const lcd = useLcdClient();
  const connectedWallet = useConnectedWallet();

  const [bank, setBank] = useState<null | string>();
  const { connect, disconnect, availableWallets } = useWallet();

  const { response, tokenBalance } = useQueryContract({ pair_list: {} });
  console.log(response);
  const alongToken = Object.values(tokenBalance);

  useEffect(() => {
    if (connectedWallet) {
      lcd.bank.balance(connectedWallet.addresses["pisco-1"]).then(([coins]) => {
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
      <Text>Along Token: {alongToken} </Text>
    </Box>
  );
}

export default Home;
