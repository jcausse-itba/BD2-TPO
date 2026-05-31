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

mongosh --username "$MONGO_INITDB_ROOT_USERNAME" \
        --password "$MONGO_INITDB_ROOT_PASSWORD" \
        --authenticationDatabase admin \
        "$MONGO_INITDB_DATABASE" <<'EOF'

db.createView(
  "vw_ingresos_veterinario_mes_actual",
  "consultas",
  [
    {
     $match: {
       $expr: {
         $and: [
           {
             $eq: [
               { $year: { $dateFromString: { dateString: "$fecha" } } },
               { $year: "$$NOW" }
             ]
           },
           {
             $eq: [
               { $month: { $dateFromString: { dateString: "$fecha" } } },
               { $month: "$$NOW" }
             ]
           }
         ]
       }
     }
    },
    {
      $group: {
        _id: "$id_vet",
        ingresos_totales: { $sum: "$costo" },
        cantidad_consultas: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "veterinarios",
        localField: "_id",
        foreignField: "id_vet",
        as: "veterinario"
      }
    },
    {
      $unwind: "$veterinario"
    },
    {
      $project: {
        _id: 0,
        id_vet: "$veterinario.id_vet",
        nombre: "$veterinario.nombre",
        apellido: "$veterinario.apellido",
        sucursal: "$veterinario.sucursal",
        ingresos_totales: 1,
        cantidad_consultas: 1
      }
    }
  ]
);
print("Created view: vw_ingresos_veterinario_mes_actual");
EOF
