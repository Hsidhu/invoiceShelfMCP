#!/bin/bash

# Load .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
elif [ -f ../.env ]; then
  export $(cat ../.env | xargs)
fi

echo "--- GET /customers (List) ---"
curl -s -X GET "${INVOICE_SHELF_BASE_URL}/customers?limit=1" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" | head -n 20
echo ""
echo ""

echo "--- GET /customers/10 (Single) ---"
curl -s -X GET "${INVOICE_SHELF_BASE_URL}/customers/10" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
echo ""
echo ""

echo "--- GET /invoices (List) ---"
curl -s -X GET "${INVOICE_SHELF_BASE_URL}/invoices?limit=1" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" | head -n 20
echo ""
echo ""

# Get an invoice ID from the list to test single invoice
INVOICE_ID=$(curl -s -X GET "${INVOICE_SHELF_BASE_URL}/invoices?limit=1" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" | grep -o '"id": *[0-9]*' | head -1 | awk -F: '{print $2}' | tr -d ' ')

if [ ! -z "$INVOICE_ID" ]; then
    echo "--- GET /invoices/$INVOICE_ID (Single) ---"
    curl -s -X GET "${INVOICE_SHELF_BASE_URL}/invoices/$INVOICE_ID" \
      -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json"
    echo ""
else
    echo "No invoices found to test single invoice fetch."
fi
