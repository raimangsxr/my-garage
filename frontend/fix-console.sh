#!/bin/bash

# This script replaces console statements with logger service in the remaining components
# It's designed to be run as a quick batch fix

cd /Users/rromanit/workspace/my-garage/frontend/src/app

echo "Starting batch replacement of console statements..."

# List of files to fix
FILES=(
    "features/maintenance/maintenance.component.ts"
    "features/parts/parts.component.ts"
    "features/suppliers/suppliers.component.ts"
    "features/tracks/tracks.component.ts"
    "features/tracks/track-detail.component.ts"
    "features/settings/settings.component.ts"
    "features/profile/change-password/change-password.ts"
    "features/vehicles/vehicle-dialog/vehicle-dialog.component.ts"
    "features/maintenance/maintenance-dialog/maintenance-dialog.component.ts"
    "features/invoices/invoice-review/invoice-review.component.ts"
    "features/invoices/invoice-detail/invoice-detail.component.ts"
    "features/invoices/invoice-upload/invoice-upload.component.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        # Replace console.error with this.logger.error
        sed -i '' "s/console\.error('/this.logger.error('/g" "$file"
        sed -i '' 's/console\.error("/this.logger.error("/g' "$file"
        
        # Replace console.log with this.logger.info or debug  
        sed -i '' "s/console\.log('/this.logger.info('/g" "$file"
        sed -i '' 's/console\.log("/this.logger.info("/g' "$file"
    else
        echo "File not found: $file"
    fi
done

echo "Done!"
