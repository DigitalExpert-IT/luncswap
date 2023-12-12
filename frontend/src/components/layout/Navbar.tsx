import { Box, Text, Container, Stack, Image, Link } from "@chakra-ui/react";
import { INavigation } from "../../constant/Navigation";

interface INavbar {
  data: INavigation[];
}

export const Navbar: React.FC<INavbar> = ({ data }) => {
  return (
    <Stack bg="gray.800" w="100%" h="8vh" justifyContent="center">
      <Container maxW="container.xl">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Image src="./logo.png" alt="logo" objectFit="cover" />
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
