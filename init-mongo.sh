#!/bin/bash
DATASET_DIR="/example_datasets"

COLLECTIONS=("consultas" "pacientes" "propietarios" "vacunaciones" "veterinarios")

for NAME in "${COLLECTIONS[@]}"; do
    COLLECTION="$NAME"
    FULL_PATH="$DATASET_DIR/$NAME.csv"

    echo "Importing collection: $COLLECTION..."

    if [ -f "$FULL_PATH" ]; then
        mongoimport --username "$MONGO_INITDB_ROOT_USERNAME" \
                    --password "$MONGO_INITDB_ROOT_PASSWORD" \
                    --authenticationDatabase admin \
                    --db "$MONGO_INITDB_DATABASE" \
                    --collection "$COLLECTION" \
                    --type csv \
                    --headerline \
                    --file "$FULL_PATH"
    else
        echo "Error: File $FULL_PATH not found. Skipping."
    fi
done
