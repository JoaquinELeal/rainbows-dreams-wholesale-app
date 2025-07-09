use shopify_function::prelude::*;
use std::collections::BTreeMap;

#[shopify_function]
pub fn run(input: JsonValue) -> shopify_function::Result<JsonValue> {
    // Helper function to create no-discount response
    let create_no_discount = || {
        let mut no_discount_map = BTreeMap::new();
        no_discount_map.insert("discounts".to_string(), JsonValue::Array(vec![]));
        no_discount_map.insert("discountApplicationStrategy".to_string(), JsonValue::String("FIRST".to_string()));
        JsonValue::Object(no_discount_map)
    };

    // Parse cart from input
    let cart = match &input {
        JsonValue::Object(obj) => {
            match obj.get("cart") {
                Some(cart_value) => cart_value,
                None => return Ok(create_no_discount()),
            }
        },
        _ => return Ok(create_no_discount()),
    };

    // Check if customer has wholesale tag
    let has_wholesale_tag = match cart {
        JsonValue::Object(cart_obj) => {
            if let Some(JsonValue::Object(buyer_identity)) = cart_obj.get("buyerIdentity") {
                if let Some(JsonValue::Object(customer)) = buyer_identity.get("customer") {
                    if let Some(JsonValue::Boolean(has_tag)) = customer.get("hasAnyTag") {
                        *has_tag
                    } else {
                        false
                    }
                } else {
                    false
                }
            } else {
                false
            }
        },
        _ => false,
    };

    // If customer doesn't have wholesale tag, return no discount
    if !has_wholesale_tag {
        return Ok(create_no_discount());
    }

    // Parse cart lines
    let lines = match cart {
        JsonValue::Object(cart_obj) => {
            match cart_obj.get("lines") {
                Some(JsonValue::Array(lines_array)) => lines_array,
                _ => return Ok(create_no_discount()),
            }
        },
        _ => return Ok(create_no_discount()),
    };

    let mut discounts = Vec::new();

    // Apply tiered pricing based on quantity for each line
    for line in lines {
        if let JsonValue::Object(line_obj) = line {
            // Get quantity
            let quantity = match line_obj.get("quantity") {
                Some(JsonValue::Number(q)) => *q as i64,
                _ => continue,
            };

            // Calculate discount percentage based on quantity tiers
            let discount_percentage = if quantity >= 200 {
                20.0 // 20% off for 200+ units
            } else if quantity >= 50 {
                15.0 // 15% off for 50-199 units
            } else if quantity >= 10 {
                10.0 // 10% off for 10-49 units
            } else {
                0.0 // No discount for less than 10 units
            };

            // Only create discount if percentage > 0
            if discount_percentage > 0.0 {
                // Get product variant info
                if let Some(JsonValue::Object(merchandise)) = line_obj.get("merchandise") {
                    // Check if it's a ProductVariant
                    if let Some(JsonValue::String(typename)) = merchandise.get("__typename") {
                        if typename == "ProductVariant" {
                            if let Some(JsonValue::String(variant_id)) = merchandise.get("id") {
                                // Create discount object
                                let mut discount_map = BTreeMap::new();
                                
                                // Create targets array
                                let mut target_map = BTreeMap::new();
                                let mut product_variant_map = BTreeMap::new();
                                product_variant_map.insert("id".to_string(), JsonValue::String(variant_id.clone()));
                                target_map.insert("productVariant".to_string(), JsonValue::Object(product_variant_map));
                                
                                let targets = JsonValue::Array(vec![JsonValue::Object(target_map)]);
                                discount_map.insert("targets".to_string(), targets);
                                
                                // Create value object
                                let mut value_map = BTreeMap::new();
                                let mut percentage_map = BTreeMap::new();
                                percentage_map.insert("value".to_string(), JsonValue::String(discount_percentage.to_string()));
                                value_map.insert("percentage".to_string(), JsonValue::Object(percentage_map));
                                discount_map.insert("value".to_string(), JsonValue::Object(value_map));
                                
                                // Add message
                                let message = format!("Wholesale discount: {}% off", discount_percentage);
                                discount_map.insert("message".to_string(), JsonValue::String(message));
                                
                                discounts.push(JsonValue::Object(discount_map));
                            }
                        }
                    }
                }
            }
        }
    }

    // Create final response
    let mut result_map = BTreeMap::new();
    result_map.insert("discounts".to_string(), JsonValue::Array(discounts));
    result_map.insert("discountApplicationStrategy".to_string(), JsonValue::String("FIRST".to_string()));
    
    Ok(JsonValue::Object(result_map))
}
