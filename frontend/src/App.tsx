import { useConnectedWallet, useWallet } from "@terra-money/wallet-kit"

function App() {
  const connectedWallet = useConnectedWallet();
  const { connect, disconnect, availableWallets } = useWallet()

  return (
    <>
      {availableWallets.map(item => (
        <button onClick={() => connect(item.id)}>{item.name}</button>
      ))}
    </>
  )
}

export default App
