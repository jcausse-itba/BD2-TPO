const express = require('express')
const cassandra = require('cassandra-driver');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000

const KEYSPACE = process.env.CASSANDRA_KEYSPACE;
const cassandraClient = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_HOST || 'localhost'],
    localDataCenter: process.env.CASSANDRA_DC || 'datacenter1',
    keyspace: process.env.CASSANDRA_KEYSPACE,
    credentials: {
        username: 'cassandra',
        password: 'cassandra'
    }
});

cassandraClient.connect()
    .then(() => {})
    .catch((err) => console.error('Cassandra connection error:', err))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {})
    .catch((err) => console.error('Cassandra MongoDB error:', err))

const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json())

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'VetSalud S.A. API - Grupo 10',
            version: '1.0.0',
            description: 'API para el  Sistema de Gestión de Clínica Veterinaria.',
        },
    },
    apis: [__filename, './queries/*.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));


/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta raíz
 *     responses:
 *       200:
 *         description: Retorna el nombre del grupo
 */
app.get('/', (req, res) => {
    res.send('Grupo 10')
})

const queriesDir = path.join(__dirname, 'queries');
fs.readdirSync(queriesDir).filter(file => file.endsWith('.js'))
    .forEach(file => {
        require(path.join(queriesDir, file))(app, cassandraClient, KEYSPACE);
    });

app.listen(port, () => {
    console.log(`Grupo 10 app listening on port ${port}`)
    console.log(`Swagger Docs available: /api-docs`);
})
