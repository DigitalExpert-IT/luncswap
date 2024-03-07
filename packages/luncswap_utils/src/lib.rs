use cosmwasm_std::{Decimal, Uint128};

pub fn add(left: usize, right: usize) -> usize {
    left + right
}

// pub fn get_input_price(
//     input_amount: Uint128,
//     input_reserve: Uint128,
//     output_reserve: Uint128,
//     fee_percent: Decimal,
// ) -> Result<Uint128> {
// }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
