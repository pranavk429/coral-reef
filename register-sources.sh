#!/bin/bash

# Coral Reef - Coral Source Registration Script
# Facilitates quick local environment setup for hackathon evaluation and demonstration.
# Dynamically converts relative paths to absolute URLs to satisfy Coral CLI validation.

echo "============================================="
echo "🏴‍☠️ Registering Whitelisted Coral Sources..."
echo "============================================="
echo ""

# Ensure Coral CLI is installed
if ! command -v coral &> /dev/null; then
    echo "❌ Error: Coral CLI is not installed or not on your PATH."
    echo "Please install it first: brew install withcoral/tap/coral"
    exit 1
fi

# Get the absolute current working directory
PWD_ABS=$(pwd)

# Registration commands
SOURCES=(
    "coral/sources/aws.yaml"
    "coral/sources/okta.yaml"
    "coral/sources/sentry.yaml"
    "coral/sources/notion.yaml"
    "coral/sources/jira.yaml"
)

for spec in "${SOURCES[@]}"; do
    if [ -f "$spec" ]; then
        echo "Registering source: $spec..."
        
        # Create a temporary spec file with absolute URL
        TEMP_SPEC="coral/sources/temp_register.yaml"
        cp "$spec" "$TEMP_SPEC"
        
        # Replace relative file://./ with absolute file:///path/to/project/
        # Use a portable sed pattern for macOS and Linux compatibility
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|file://./|file://${PWD_ABS}/|g" "$TEMP_SPEC"
        else
            sed -i "s|file://./|file://${PWD_ABS}/|g" "$TEMP_SPEC"
        fi
        
        # Add the source using the temp file
        coral source add --file "$TEMP_SPEC"
        
        # Clean up temp file
        rm -f "$TEMP_SPEC"
        echo ""
    else
        echo "⚠️ Warning: Spec file not found at $spec"
    fi
done

echo "============================================="
echo "✅ Registration Complete!"
echo "============================================="
echo ""
echo "Active Coral Sources:"
coral source list
echo ""

