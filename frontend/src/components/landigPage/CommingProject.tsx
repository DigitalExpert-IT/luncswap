import { COMMING_PROJECT } from "@/constant/content";
import { Box, Heading, Image, Text } from "@chakra-ui/react";
import Slider from "react-slick";

export const CommingProject = () => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          variableWidth: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <Box bg="brand.400" my="5rem" textAlign="center" p="2rem">
      <Box mb="4rem">
        <Heading
          color="navy.800"
          fontFamily="Inter, sans-serif"
          fontWeight="extrabold"
          size={{ base: "xl", md: "2xl" }}
        >
          Our Upcoming Projects
        </Heading>
      </Box>
      <Slider {...settings}>
        {COMMING_PROJECT.map((item, idx) => (
          <Box
            key={idx}
            mx="auto"
            px={{ base: "1", md: "2" }}
            position="relative"
            overflow="hidden"
            maxW="500px"
            _hover={{
              height: "full",
              transition: "0.3s ease-out",
              flexDirection: "column",
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              w="full"
              h="auto"
              objectFit="cover"
            />
            <Box
              role="group"
              display="flex"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              position="absolute"
              bg="rgba(8, 20, 49, 0.5)"
              bottom="0"
              w="97%"
              _hover={{
                height: "full",
                transition: "0.3s ease-out",
                flexDirection: "column",
                paddingTop: "2rem",
              }}
            >
              <Text
                fontSize="xl"
                _groupHover={{
                  fontSize: { base: "15px", md: "20px", lg: "40px" },
                }}
              >
                {item.title}
              </Text>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};
