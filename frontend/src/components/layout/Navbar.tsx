import {
  Box,
  Text,
  Container,
  Stack,
  Link,
  Heading,
  Image,
} from "@chakra-ui/react";
import { INavigation } from "@/constant/Navigation";
import WrapWallet from "../WrapWallet";
import { useConnectedWallet } from "@terra-money/wallet-kit";
import { shortenAddress } from "@/utils";

interface INavbar {
  data: INavigation[];
}

const CHAIN_ID = "pisco-1";

export const Navbar: React.FC<INavbar> = ({ data }) => {
  const connectedWallet = useConnectedWallet();

  return (
    <Stack
      as="nav"
      position="sticky"
      top="0"
      left="0"
      bg="#010525"
      w="100%"
      h="75px"
      zIndex="999"
      justifyContent="center"
    >
      <Container maxW="container.xl">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box
            display="flex"
            alignContent="center"
            alignItems="center"
            flex={1}
          >
            <Image src="/lunc.png" mr="1rem" />
            <Heading size="md" color="brand.500">
              Luncswap
            </Heading>
          </Box>
          <Stack
            flex={1}
            justify="end"
            align="center"
            direction="row"
            spacing="1rem"
            display={{ base: "none", md: "flex" }}
          >
            {data.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                _hover={{ textDecoration: "none" }}
              >
                <Text
                  fontWeight="bold"
                  textTransform="uppercase"
                  fontSize="sm"
                  _hover={{
                    color: "yellow",
                  }}
                >
                  {item.name}
                </Text>
              </Link>
            ))}
            <WrapWallet mb="0" bgColor="brand.500" width="30%">
              <Box bg="brand.500" p="2" rounded="xl">
                <Text fontWeight="bold" color="gray.900">
                  {shortenAddress(connectedWallet?.addresses[CHAIN_ID] ?? "")}
                </Text>
              </Box>
            </WrapWallet>
          </Stack>
        </Box>
      </Container>
    </Stack>
  );
};
