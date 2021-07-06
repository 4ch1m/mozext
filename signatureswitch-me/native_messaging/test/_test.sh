#!/bin/sh

TEMP_FILE="$(mktemp)"

./prepare-message.js message.json "${TEMP_FILE}"
../native-messaging-hosts/signatureswitch.js < "${TEMP_FILE}"
