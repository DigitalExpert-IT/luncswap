import { create, useModal } from "@ebay/nice-modal-react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import _debounce from "lodash/debounce";
import { AddLiquidity } from "./AddLiquidity";

const ModalAddLiquidity = create(() => {
    const modal = useModal();
    const args = modal.args;

    return (
        <Modal isOpen={modal.visible} onClose={modal.hide} size="xl">
            <ModalOverlay backdropFilter="blur(7px) " />
            <ModalContent bgColor="navy.700" overflow={"hidden"} borderRadius={20}
                border={"2px solid #A4A4BE"}
            >
                <ModalCloseButton pt={4} color={"navy.700"} />
                <ModalHeader bgColor={"navy.700"} fontWeight={700}>
                    Add Liquidity
                </ModalHeader>
                <ModalBody pb="8" pt={5}>
                    <AddLiquidity token1={args?.token1} token2={args?.token2} />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
})


export default ModalAddLiquidity