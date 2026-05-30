const express = require('express')
const cassandra = require('cassandra-driver');
const mongoose = require('mongoose');

const cassandraClient = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_HOST || 'localhost'],
    localDataCenter: process.env.CASSANDRA_DC || 'datacenter1',
    keyspace: process.env.CASSANDRA_KEYSPACE,
    credentials: {
        username: process.env.CASSANDRA_USER || 'cassandra',
        password: process.env.CASSANDRA_PASSWORD || 'cassandra'
    }
});

cassandraClient.connect()
    .then(() => {})
    .catch((err) => console.error('Cassandra connection error:', err))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {})
    .catch((err) => console.error('Cassandra MongoDB error:', err))

const app = express()

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Grupo 10')
})

app.get('/query1', async (req, res) => {
    /* Pacientes activos con la totalidad de sus datos de propietario */
    res.send(await mongoose.connection.db.collection('pacientes').aggregate([
        {
            $lookup: {
                from: "propietarios",
                localField: "id_propietario",
                foreignField: "id_propietario",
                as: "propietario"
            }
        },
        { $unwind: "$propietario" },
        {
            $match: { activo: true }
        },
        {
            $project: {
                _id: 0,
                nombre: 1,
                "propietario.nombre": 1,
                "propietario.apellido": 1,
                "propietario.dni": 1,
                "propietario.email": 1,
                "propietario.telefono": 1,
                "propietario.ciudad": 1,
                "propietario.provincia": 1,
            }
        }
    ]).toArray());
})

app.get('/stock', async (req, res) => { //TODO temporal test query
    try {
        res.json((await cassandraClient.execute(
            `SELECT *FROM "${process.env.CASSANDRA_KEYSPACE}".stock_farmaceutico;`)
            ).rows);
    } catch (err) {
        console.error('Error executing Cassandra query:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Grupo 10 app listening on port ${port}`)
})

// TODO: preguntar si las id's usamos la del dataset (ej: id_vet, id_propietario) o las sacamos y usamos las de mongo.
/* QUERy 2
db.consultas.aggregate([
  {
    $lookup: {
      from: "veterinarios",
      localField: "id_vet",
      foreignField: "id_vet",
      as: "veterinario"
    }
  },
  { $unwind: "$veterinario" },
  {
    $match: { estado: "Seguimiento" }
  },
]);
* */

/** QUERY 3: Historial completo de un paciente: consultas y vacunaciones ordenadas por fecha 
// TODO: preguntar si esta bien usar $unionWith
// vendria bien hacerlo en cassandra sino. porque "hay muchas consultas seguro, muchos datos!!"
db.consultas.aggregate([
  {
    $match: {
      id_paciente: "P001"
    }
  },
  {
    $project: {
      _id: 0,
      fecha: 1,
      tipo: { $literal: "Consulta" },
      detalle: "$motivo",
      diagnostico: 1,
      veterinario: "$id_vet"
    }
  },
  {
    $unionWith: {
      coll: "vacunas",
      pipeline: [
        {
          $match: {
            id_paciente: "P001"
          }
        },
        {
          $project: {
            _id: 0,
            fecha: "$fecha_aplicacion",
            tipo: { $literal: "Vacunación" },
            detalle: "$nombre_vacuna",
            proxima_dosis: 1,
            veterinario: "$id_vet"
          }
        }
      ]
    }
  },
  {
    $sort: {
      fecha: 1
    }
  }
])
 */


/* QUERY 4: Propietarios con más de un paciente registrado.
db.propietarios.aggregate([
  {
    $lookup: {
      from: "pacientes",
      localField: "id_propietario",
      foreignField: "id_propietario",
      as: "paciente"
    }
  },
  {
    $match: {
      $expr: {
        $gt: [
          { $size: "$paciente" },
          1
        ]
      }
    }
  },
  {
    $project: {
      _id: 0,
      nombre: 1,
      apellido: 1,
      //"paciente.nombre": 1,
    }
  }
]);
* */

/* Query 5: eterinarios activos y cantidad de consultas realizadas en los últimos 60 días
db.consultas.aggregate([
  {
    $match: {
      $expr: {
        $gte: [
          "$fecha",
          {
            $dateSubtract: {
              startDate: "$$NOW",
              unit: "day",
              amount: 60
            }
          }
        ]
      }
    }
  },
  {
    $group: {
     _id: "$id_vet",
      total: { $sum: 1 }
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
  { $unwind: "$veterinario" },
  {
    $match: { "veterinario.activo": true }
  },
]);
* */

/* Query 6:  Pacientes con vacunas vencidas (próxima dosis anterior a hoy)
db.vacunas.aggregate([
  {
    $match: {
      proxima_dosis: {
        $lt: new Date()
      }
    }
  },
  {
    $group: {
      _id: "$id_paciente"
    }
  },
  {
    $lookup: {
      from: "pacientes",
      localField: "_id",
      foreignField: "id_paciente",
      as: "paciente"
    }
  },
  {
    $unwind: "$paciente"
  },
  {
    $project: {
      _id: 0,
      id_paciente: "$paciente.id_paciente",
      nombre: "$paciente.nombre",
      especie: "$paciente.especie"
    }
  }
])
*/

/* Query 7: Top 5 diagnósticos más frecuentes
db.consultas.aggregate([
  {
    $group: {
      _id: "$diagnostico",
      cantidad: { $sum: 1 }
    }
  },
  {
    $project: {
      diagnostico: "$_id",
      cantidad: 1,
      _id: 0,
    }
  },
  {
    $sort: {
      cantidad: -1
    }
  },
  {
    $limit: 5
  }
]);
* */

/* Query 8: Stock de productos con menos de 50 unidades y su proveedor.
// TODO: este dijimos que lo ibamos a hacer en Cassandra. asi que podemos descartarlo.
db.productos.find(
  {
    unidades: { $lt: 50 }
  },
  {
    _id: 0,
    nombre: 1,
    unidades: 1,
    proveedor: 1
  }
)
*/

/* Query 9: Consultas de tipo 'Control' con costo menor a $5.000
db.consultas.find(
  {
    motivo: {
      $regex: "Control"
    },
    costo: {
      $lt: 5000
    }
  }, 
  {
    _id: 0,
    fecha: 1,
    motivo: 1,
    diagnostico: 1,
    costo: 1,
    estado: 1
  }
)
*/

/* Query 10: los pacientes de una sucursal determinada (a través del veterinario
let sucursal = "Palermo";  // Debe ser parametrizable la sucursal.
db.consultas.aggregate([
  {
    $lookup: {
      from: "veterinarios",
      localField: "id_vet",
      foreignField: "id_vet",
      as: "vet"
    }
  },
  { $unwind: "$vet" },
  {
    $match: {
      "vet.sucursal": sucursal
    }
  },
  {
    $group: {
      _id: "$id_paciente"
    }
  },
  {
    $lookup: {
      from: "pacientes",
      localField: "_id",
      foreignField: "id_paciente",
      as: "paciente"
    }
  },
  { $unwind: "$paciente" },
  {
    $project: {
      _id: 0,
      id_paciente: "$paciente.id_paciente",
      nombre: "$paciente.nombre",
      especie: "$paciente.especie",
      raza: "$paciente.raza",
      activo: "$paciente.activo"
    }
  }
])
*/

/** Query 11: Vista agregada: ingresos totales por veterinario en el mes actual

db.createView(
  "vw_ingresos_veterinario_mes_actual",
  "consultas",
  [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: [ { $year: "$fecha" }, { $year: "$$NOW" } ] },
            { $eq: [ { $month: "$fecha" }, { $month: "$$NOW" } ] }
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
db.vw_ingresos_veterinario_mes_actual.find();
 */

/** Query 12: Propietarios sin consultas registradas en el último año

db.propietarios.aggregate([
  {
    $lookup: {
      from: "pacientes",
      localField: "id_propietario",
      foreignField: "id_propietario",
      as: "pacientes"
    }
  },
  {
    $lookup: {
      from: "consultas",
      localField: "pacientes.id_paciente",
      foreignField: "id_paciente",
      as: "consultas"
    }
  },
  {
    $match: {
      consultas: {
        $not: {
          $elemMatch: {
            fecha: {
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              )
            }
          }
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      id_propietario: 1,
      nombre: 1,
      apellido: 1
    }
  }
])
 */

/* Query 13: ABM completo de propietarios: alta, modificación de datos, baja lógica
// no es de obtener datos, sino que es de eliminar, modificar o subir datos. y poner ejemplos.

// alta. TODO: id mayor que el actual deberia ser determinado automaticamente?
db.propietarios.insertOne({
    id_propietario: "C017",
    nombre: "Lola",
    apellido: "Gonzales",
    dni: 40111222,
    email: "lola@gmail.com",
    telefono: "1112345678",
    ciudad: "Mar del Plata",
    provincia: "Buenos Aires",
    activo: true
})

// modificacion
db.propietarios.updateOne(
    { id_propietario: "C007" },
    {
        $set: {
            email: "lucia.perez@gmail.com",
            telefono: "1199998888"
        }
    }
)

// baja logica: asumimos que es poner "activo" en false.
db.propietarios.updateOne(
    { id_propietario: "C007" },
    {
        $set: {
            activo: false
        }
    }
)

*/

/* Query 14: Registro de nueva consulta médica con validación de paciente y veterinario existentes.
// TODO: preguntar si esta bien validar con 'if'. o como se debeiria hacer en mongo.
// sino, entonces lo hacemos en Cassandra si hay algo como RIRs.

const paciente = db.pacientes.findOne({
    id_paciente: "P001",
    activo: true
});

const veterinario = db.veterinarios.findOne({
    id_vet: "V001",
    activo: true
});

if (paciente && veterinario) {
    db.consultas.insertOne({
        id_consulta: "CON009",
        id_paciente: "P001",
        id_vet: "V001",
        fecha: new Date(),
        motivo: "Control general",
        diagnostico: "En observación",
        costo: 5000,
        estado: "Seguimiento"
    });
} else {
    print("Paciente o veterinario inexistente/inactivo");
}
*/

// Query 15. se lo dejamos a casandra.