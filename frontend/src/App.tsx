import { useConnectedWallet, useWallet } from "@terra-money/wallet-kit"
import { Button, Container, Box, Text, Code } from "@chakra-ui/react"

function App() {
  const connectedWallet = useConnectedWallet();
  const { connect, disconnect, availableWallets, network, status } = useWallet()

  return (
    <Container maxW="container.xl" mt="2rem">
      <Box>
        {connectedWallet ? (
          <Button onClick={() => disconnect()} colorScheme="red">Disconnect</Button>
        ) : (
          availableWallets.map(item => (
            <Button onClick={() => connect(item.id)} disabled={!item.isInstalled} key={item.id} colorScheme="green">
              Connect by {item.name}
            </Button>
          ))
        )}
        <Text mt="2rem">Network Name: {connectedWallet?.network} </Text>
        <Text>Network Info:</Text>
        <Code mt="1rem">{JSON.stringify({ network, status }, null, 2)}</Code>
      </Box>
    </Container>
  )
}

export default App
