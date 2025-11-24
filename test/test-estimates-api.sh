#!/bin/bash
if [ -f .env ]; then export $(cat .env | xargs); elif [ -f ../.env ]; then export $(cat ../.env | xargs); fi

echo "Testing GET /estimates (List)"
curl -s -X GET "${INVOICE_SHELF_BASE_URL}/estimates?limit=2" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Accept: application/json" | head -50

echo ""
echo ""
echo "Getting first estimate ID..."
EST_ID=$(curl -s -X GET "${INVOICE_SHELF_BASE_URL}/estimates?limit=1" \
  -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
  -H "Accept: application/json" | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')

if [ ! -z "$EST_ID" ]; then
    echo "Testing GET /estimates/$EST_ID (Single)"
    curl -s -X GET "${INVOICE_SHELF_BASE_URL}/estimates/$EST_ID" \
      -H "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
      -H "Accept: application/json" | head -30
else
    echo "No estimates found"
fi
