import { Button } from "@chakra-ui/react";
import { useModal } from "@ebay/nice-modal-react";
import { useConnectedWallet } from "@terra-money/wallet-kit";
import ModalConnectWallet from "./ModalConnectWallet";

type Props = {
  children: React.ReactNode;
};

function WrapWallet(props: Props) {
  const connectedWallet = useConnectedWallet();
  const modalConnectWallet = useModal(ModalConnectWallet);

  if (!connectedWallet)
    return (
      <Button
        bgColor={"navy.400"}
        w={"100%"}
        mb={10}
        borderRadius={12}
        color={"black"}
        fontWeight={"700"}
        onClick={() => modalConnectWallet.show()}
      >
        Connect Wallet
      </Button>
    );

  return props.children;
}

export default WrapWallet;
