#!/bin/bash
# Script to add dark mode classes to common patterns
# Usage: ./scripts/add-dark-mode.sh <file>

FILE=$1

if [ -z "$FILE" ]; then
  echo "Usage: $0 <file>"
  exit 1
fi

# Common replacements
sed -i 's/bg-gray-50"/bg-gray-50 dark:bg-gray-900"/g' "$FILE"
sed -i 's/bg-white"/bg-white dark:bg-gray-800"/g' "$FILE"
sed -i 's/text-gray-900"/text-gray-900 dark:text-white"/g' "$FILE"
sed -i 's/text-gray-600"/text-gray-600 dark:text-gray-300"/g' "$FILE"
sed -i 's/text-gray-700"/text-gray-700 dark:text-gray-300"/g' "$FILE"
sed -i 's/text-gray-500"/text-gray-500 dark:text-gray-400"/g' "$FILE"
sed -i 's/border-gray-300"/border-gray-300 dark:border-gray-600"/g' "$FILE"
sed -i 's/bg-gray-100"/bg-gray-100 dark:bg-gray-800"/g' "$FILE"
sed -i 's/bg-gray-50"/bg-gray-50 dark:bg-gray-700"/g' "$FILE"  # For table headers
sed -i 's/hover:bg-gray-50"/hover:bg-gray-50 dark:hover:bg-gray-700"/g' "$FILE"
sed -i 's/hover:bg-gray-100"/hover:bg-gray-100 dark:hover:bg-gray-700"/g' "$FILE"
sed -i 's/divide-gray-200"/divide-gray-200 dark:divide-gray-700"/g' "$FILE"

echo "Updated $FILE with dark mode classes"

