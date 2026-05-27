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
    /* Pacientes activos con todos sus datos de propietario */
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

// QUERY 3 no tuve ganas de hacerlo. quiza lo mandamos a cassandra.

/* QUERY 4
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

/* Query 5
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