import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Heading,
} from "@chakra-ui/react";

interface DrawerPoolProps {
  isOpen: boolean;
  title: string;
  children: React.ReactElement;
  onClose: () => void;
}

export const DrawerPool: React.FC<DrawerPoolProps> = props => {
  return (
    <Drawer placement="bottom" onClose={props.onClose} isOpen={props.isOpen}>
      <DrawerOverlay />
      <DrawerContent rounded="2xl">
        <DrawerCloseButton color="black" />
        <DrawerHeader background="brand.400" roundedTop="2xl">
          <Heading
            color="black"
            textTransform="uppercase"
            fontSize="15px"
            lineHeight="17.86px"
            fontWeight="bold"
          >
            {props.title.replace(/_/g, " ")}
          </Heading>
        </DrawerHeader>
        <DrawerBody p="0">{props.children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
