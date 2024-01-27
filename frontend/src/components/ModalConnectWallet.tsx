import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { create, useModal } from "@ebay/nice-modal-react";
import { useConnectedWallet, useWallet } from "@terra-money/wallet-kit";
import { useEffect } from "react";

const ModalConnectWallet = create(() => {
  const connectedWallet = useConnectedWallet();
  const modal = useModal();
  const wallet = useWallet();

  useEffect(() => {
    if (connectedWallet) modal.hide();
  }, [connectedWallet, modal]);

  return (
    <Modal isCentered isOpen={modal.visible} onClose={modal.hide}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Connect Wallet</ModalHeader>
        <ModalBody>
          <Stack>
            {wallet.availableWallets.map(item => (
              <Button key={item.id} onClick={() => wallet.connect(item.id)}>
                {item.name}
              </Button>
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

ModalConnectWallet.displayName = "ModalConnectWallet";
export default ModalConnectWallet;
