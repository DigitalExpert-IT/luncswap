import { Box, Text, Container, Stack, Link, Heading } from "@chakra-ui/react";
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
      bg="gray.800"
      w="100%"
      h="75px"
      zIndex="999"
      justifyContent="center"
    >
      <Container maxW="container.xl">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="md">Luncswap.</Heading>
          </Box>
          <Stack direction="row" spacing="2rem">
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
