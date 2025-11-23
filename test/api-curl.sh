
# Load .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
elif [ -f ../.env ]; then
  export $(cat ../.env | xargs)
fi

# Use variables from .env
DOMAIN="${INVOICE_SHELF_BASE_URL%/api/v1}" # Strip /api/v1 if present to get base domain, or just use as is if needed. 
# Actually the previous script used DOMAIN/api/v1/auth/login.
# If INVOICE_SHELF_BASE_URL is https://.../api/v1, we should probably just use it directly or strip the suffix.
# Let's assume INVOICE_SHELF_BASE_URL includes /api/v1 based on .env content.

# The login endpoint is usually /api/v1/auth/login.
# If BASE_URL is .../api/v1, then we append /auth/login.

curl --request POST \
  "${INVOICE_SHELF_BASE_URL}/auth/login" \
  --header "Content-Type: application/json" \
  --header "Accept: application/json" \
  --data "{
    \"username\": \"${INVOICE_SHELF_USERNAME}\",
    \"password\": \"${INVOICE_SHELF_PASSWORD}\",
    \"device_name\": \"${INVOICE_SHELF_DEVICE_NAME}\"
}"



# curl --request GET \
#   "${DOMAIN}/api/v1/users" \
#   --header "Authorization: Bearer ${INVOICE_SHELF_API_TOKEN}" \
#   --header "Content-Type: application/json" \
#   --header "Accept: application/json" \

