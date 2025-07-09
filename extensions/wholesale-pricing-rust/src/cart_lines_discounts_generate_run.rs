use crate::schema::CartLineTarget;
use crate::schema::CartLinesDiscountsGenerateRunResult;
use crate::schema::CartOperation;
use crate::schema::DiscountClass;
use crate::schema::ProductDiscountCandidate;
use crate::schema::ProductDiscountCandidateTarget;
use crate::schema::ProductDiscountCandidateValue;
use crate::schema::ProductDiscountSelectionStrategy;
use crate::schema::ProductDiscountsAddOperation;
use crate::schema::Percentage;

use super::schema;
use shopify_function::prelude::*;
use shopify_function::Result;

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<CartLinesDiscountsGenerateRunResult> {
    // Check if customer has wholesale tag
    let is_wholesale_customer = input
        .cart()
        .buyer_identity()
        .and_then(|buyer| buyer.customer())
        .map(|customer| customer.has_any_tag())
        .unwrap_or(&false);

    // If not a wholesale customer, return no discounts
    if !is_wholesale_customer {
        return Ok(CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }

    // Check if product discount class is available
    let has_product_discount_class = input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Product);

    if !has_product_discount_class {
        return Ok(CartLinesDiscountsGenerateRunResult { operations: vec![] });
    }

    let mut operations = vec![];

    // Apply tiered discount to each cart line
    for line in input.cart().lines() {
        let quantity = *line.quantity() as f64;

        // Determine discount percentage based on quantity tiers
        let discount_percentage = if quantity >= 100.0 {
            15.0 // 15% discount for 100+ items
        } else if quantity >= 50.0 {
            10.0 // 10% discount for 50+ items
        } else if quantity >= 20.0 {
            5.0  // 5% discount for 20+ items
        } else {
            continue; // No discount for less than 20 items
        };

        // Create product discount operation
        let discount_operation = CartOperation::ProductDiscountsAdd(ProductDiscountsAddOperation {
            candidates: vec![ProductDiscountCandidate {
                targets: vec![ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                    id: line.id().to_string(),
                    quantity: None,
                })],
                value: ProductDiscountCandidateValue::Percentage(Percentage {
                    value: shopify_function::scalars::Decimal(discount_percentage),
                }),
                associated_discount_code: None,
                message: None,
            }],
            selection_strategy: ProductDiscountSelectionStrategy::First,
        });

        operations.push(discount_operation);
    }

    Ok(CartLinesDiscountsGenerateRunResult { operations })
}
