use anyhow::Result;
use cosmwasm_std::Uint128;

pub fn try_human_value(num: &str, decimal: Option<u128>) -> Result<Uint128> {
    let multiplier = match decimal {
        Some(val) => 10_u128.pow(val as u32),
        None => 1000000,
    };

    let num = num.chars().filter(|x| *x != '_').collect::<String>();
    let num = num.parse::<f64>()?;

    let num = num * multiplier as f64;
    Ok(Uint128::new(num as u128))
}

pub fn human_value(num: &str, decimal: Option<u128>) -> Uint128 {
    try_human_value(num, decimal).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn human_value_test() {
        let val = human_value("0.5", None);
        assert_eq!(val, Uint128::new(500000));
        let val = human_value("1_000", None);
        assert_eq!(val, Uint128::new(1000000000));
        let val = human_value("1", Some(9));
        assert_eq!(val, Uint128::new(1000000000));
        let val = human_value("1_000_000", None);
        assert_eq!(val, Uint128::new(1000000000000));
    }
}
