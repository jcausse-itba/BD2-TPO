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

app.listen(port, () => {
    console.log(`Grupo 10 app listening on port ${port}`)
})
