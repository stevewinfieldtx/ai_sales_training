#!/usr/bin/env python

import argparse
import datetime
import random
import time

def process_payment(amount: float, currency: str, description: str):
    """
    Simulates processing a payment through a payment gateway.
    
    In a real application, this function would contain the logic to connect
    to a payment provider like Stripe, PayPal, or Braintree via their API.
    
    Args:
        amount: The amount to be charged.
        currency: The currency of the payment (e.g., "USD").
        description: A brief description of the transaction.
        
    Returns:
        A dictionary containing the transaction details upon success.
    """
    print(f"[*] Starting payment process for {amount:.2f} {currency}...")
    
    # --- Placeholder for Real Payment Gateway Integration ---
    # In a real-world scenario, you would make an API call here.
    # For now, we'll just simulate a delay and a successful outcome.
    time.sleep(2) # Simulates network latency
    
    transaction_id = f"txn_{random.randint(10000000, 99999999)}"
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    
    print("[+] Payment successful!")
    
    return {
        "status": "success",
        "transaction_id": transaction_id,
        "amount": amount,
        "currency": currency,
        "description": description,
        "timestamp": timestamp
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="A command-line tool to process payments.")
    
    parser.add_argument("--amount", type=float, required=True, help="The payment amount.")
    parser.add_argument("--currency", type=str, required=True, help="The 3-letter currency code (e.g., USD).")
    parser.add_argument("--description", type=str, default="Product or Service Purchase", help="A short description for the payment.")
    
    args = parser.parse_args()
    
    try:
        result = process_payment(args.amount, args.currency.upper(), args.description)
        
        print("\n--- Transaction Receipt ---")
        for key, value in result.items():
            print(f"{key.replace('_', ' ').title()}: {value}")
        print("--------------------------")
        
    except Exception as e:
        print(f"[!] An error occurred: {e}")
