#!/bin/bash
DATASET_DIR="/example_datasets"

COLLECTIONS=("stock_farmaceutico")

FLAG_FILE="/cassandra_data/.seeded"

if [ -f "$FLAG_FILE" ]; then
    exit 0
fi

cqlsh "$CASSANDRA_HOST" -u "$CASSANDRA_USER" -p "$CASSANDRA_PASSWORD" -e "CREATE KEYSPACE IF NOT EXISTS \"$CASSANDRA_KEYSPACE\" WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};"

for NAME in "${COLLECTIONS[@]}"; do
    COLLECTION="$NAME"
    FULL_PATH="$DATASET_DIR/$NAME.csv"

    echo "Importing table: $COLLECTION..."

    if [ -f "$FULL_PATH" ]; then
        cqlsh "$CASSANDRA_HOST" -u "$CASSANDRA_USER" \
              -p "$CASSANDRA_PASSWORD" \
              -e "COPY \"$CASSANDRA_KEYSPACE\".$COLLECTION FROM '$FULL_PATH' WITH HEADER = true;"
    else
        echo "Error: File $FULL_PATH not found. Skipping."
    fi
done

touch "$FLAG_FILE"
