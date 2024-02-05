import {
    Box,
    Button,
    Flex,
    Image,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
} from "@chakra-ui/react";
import { useModal } from "@ebay/nice-modal-react";
import { useState } from "react";

const RemoveLiquidity = () => {
    const modal = useModal();
    console.log("argsss fdce: ", modal.args)
    const [percentage, setPercentage] = useState(25)
    const dataPercentage = [{ val: 25, desc: '25%' }, { val: 50, desc: '50%', }, { val: 75, desc: '75%' }, { val: 100, desc: 'MAX' }]

    return (
        <Box>
            <Box bgColor="navy.500" p="1rem" rounded="xl" mb="10">
                <Text color="brand.400">
                    {
                        "Tip: Removing pool tokens converts your position back into underlying tokens at the current rate, promotional to your share of the pool. Accused fees are included in the amounts your receive"
                    }
                </Text>
            </Box>
            <Text>Remove Amount </Text>
            <Text fontWeight={"700"} fontSize={80}>
                {percentage}%
            </Text>
            <Slider defaultValue={60} min={0} max={100} step={25}
                value={percentage}
                onChange={(value) => setPercentage(value)}
            >
                <SliderTrack bg='red.100'>
                    <SliderFilledTrack bg='brand.400' />
                </SliderTrack>
                <SliderThumb boxSize={6} />
            </Slider>
            <Flex gap={2}>
                {
                    dataPercentage.map((data) => (
                        <Button
                            bg={"transparent"}
                            borderWidth={"1px"}
                            borderColor={"brand.400"}
                            borderStyle={"solid"}
                            _active={{
                                bgColor: "brand.400",
                                color: "navy.700",
                            }}
                            _focus={{
                                bgColor: "brand.400",
                                color: "navy.700",
                            }}
                            flex={1}
                            onClick={() => setPercentage(data.val)}
                        >
                            {data.desc}
                        </Button>
                    ))
                }
            </Flex>

            <Text py={3}>You Will Get</Text>
            <Flex bgColor="navy.500" p={2} borderRadius={"25px"} alignItems={'flex-end'} flexDir={'column'} pr={5}>
                <Flex gap={3} >
                    <Box>
                        <Text fontSize={22} fontWeight={'500'} >1999999</Text>
                        <Text fontSize={10} color={"brand.400"}>1 USTC = 0, 5555 LUNC </Text>
                    </Box>
                    <Flex align={'center'}>
                        <Image src="lunc.png" w={10} h={10} />
                        <Text fontWeight={'700'} fontSize={20}>LUNC</Text>
                    </Flex>
                </Flex>
                <Flex gap={3}>
                    <Box>
                        <Text fontSize={22} fontWeight={'500'} >1999999</Text>
                        <Text fontSize={10} color={"brand.400"}>1 USTC = 0, 5555 LUNC </Text>
                    </Box>
                    <Flex align={'center'}>
                        <Image src="lunc.png" w={10} h={10} />
                        <Text fontWeight={'700'} fontSize={20}>LUNC</Text>
                    </Flex>
                </Flex>
            </Flex>
            <Button
                w={"full"}
                my={5}
                backgroundColor={"brand.400"}
                color={"navy.700"}
                fontWeight={"700"}
                borderRadius={25}
            >
                REMOVE LIQUIDITY
            </Button>
        </Box>
    )
}

export default RemoveLiquidity