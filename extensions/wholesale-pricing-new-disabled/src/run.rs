use super::schema;
use shopify_function::prelude::*;
use shopify_function::Result;

#[derive(Deserialize, Default)]
#[shopify_function(rename_all = "camelCase")]
pub struct Configuration {}

#[shopify_function]
fn run(input: schema::run::Input) -> Result<schema::FunctionRunResult> {
    let no_discount = schema::FunctionRunResult {
        discounts: vec![],
        discount_application_strategy: schema::DiscountApplicationStrategy::First,
    };

    // Check if customer has wholesale tag
    let cart = input.cart();
    let buyer_identity = match cart.buyer_identity() {
        Some(identity) => identity,
        None => return Ok(no_discount),
    };

    let customer = match buyer_identity.customer() {
        Some(customer) => customer,
        None => return Ok(no_discount),
    };

    // Check if customer has wholesale tag
    let has_wholesale_tag = customer.tags().iter().any(|tag| tag == "wholesale");
    if !has_wholesale_tag {
        return Ok(no_discount);
    }

    let mut discounts = vec![];

    // Apply tiered pricing based on quantity
    for line in cart.lines() {
        let quantity = line.quantity();
        let discount_percentage = if quantity >= 200 {
            20.0 // 20% off for 200+ units
        } else if quantity >= 50 {
            15.0 // 15% off for 50-199 units
        } else if quantity >= 10 {
            10.0 // 10% off for 10-49 units
        } else {
            0.0 // No discount for less than 10 units
        };

        if discount_percentage > 0.0 {
            discounts.push(schema::Discount {
                message: Some(format!("Wholesale discount: {}% off", discount_percentage)),
                conditions: None,
                targets: vec![schema::Target {
                    cart_line: Some(schema::CartLineTarget {
                        id: line.id().to_string(),
                        quantity: None,
                    }),
                    order_subtotal: None,
                    product_variant: None,
                }],
                value: schema::Value {
                    percentage: Some(schema::Percentage {
                        value: discount_percentage,
                    }),
                    fixed_amount: None,
                },
            });
        }
    }

    Ok(schema::FunctionRunResult {
        discounts,
        discount_application_strategy: schema::DiscountApplicationStrategy::First,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use shopify_function::{run_function_with_input, Result};

    #[test]
    fn test_no_discount_without_wholesale_tag() -> Result<()> {
        let result = run_function_with_input(
            run,
            r#"
                {
                    "cart": {
                        "buyerIdentity": {
                            "customer": {
                                "tags": ["regular"]
                            }
                        },
                        "lines": [
                            {
                                "id": "gid://shopify/CartLine/1",
                                "quantity": 50
                            }
                        ]
                    }
                }
            "#,
        )?;
        let expected = schema::FunctionRunResult {
            discounts: vec![],
            discount_application_strategy: schema::DiscountApplicationStrategy::First,
        };

        assert_eq!(result, expected);
        Ok(())
    }

    #[test]
    fn test_wholesale_discount_applied() -> Result<()> {
        let result = run_function_with_input(
            run,
            r#"
                {
                    "cart": {
                        "buyerIdentity": {
                            "customer": {
                                "tags": ["wholesale"]
                            }
                        },
                        "lines": [
                            {
                                "id": "gid://shopify/CartLine/1",
                                "quantity": 50
                            }
                        ]
                    }
                }
            "#,
        )?;
        
        assert_eq!(result.discounts.len(), 1);
        assert_eq!(result.discounts[0].value.percentage.as_ref().unwrap().value, 15.0);
        Ok(())
    }
}
