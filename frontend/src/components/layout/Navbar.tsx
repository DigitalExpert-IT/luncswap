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

interface INavbar {
  data: INavigation[];
}

export const Navbar: React.FC<INavbar> = ({ data }) => {
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
          <Box display="flex" alignContent="center" alignItems="center">
            <Image src="/lunc.png" mr="1rem" />
            <Heading size="md" color="brand.500">
              Luncswap.
            </Heading>
          </Box>
          <Stack direction="row" spacing="2rem" display={{ base: "none" }}>
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
          </Stack>
        </Box>
      </Container>
    </Stack>
  );
};
