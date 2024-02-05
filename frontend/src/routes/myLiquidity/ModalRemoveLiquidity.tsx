import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import { create, useModal } from "@ebay/nice-modal-react";
import RemoveLiquidity from "./RemoveLiquidty";

const ModalRemoveLiquidity = create(() => {
    const modal = useModal();
    console.log("argsss fdce: ", modal.args)

    return (
        <Modal isOpen={modal.visible} onClose={modal.hide} >
            <ModalOverlay />
            <ModalContent borderRadius={"25px"} color={"white"} border={"2px solid #A4A4BE"}
            >
                <ModalHeader bgColor={"navy.700"} borderTopRadius={"25px"}>Remove Liquidity</ModalHeader>
                <ModalCloseButton />
                <ModalBody bgColor={"navy.700"} borderBottomRadius={"25px"}>
                    <RemoveLiquidity />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});

export default ModalRemoveLiquidity;
