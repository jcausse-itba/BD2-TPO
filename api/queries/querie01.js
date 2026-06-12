const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query1:
     *   get:
     *     summary: 1 Pacientes activos con todos sus datos de propietario.
     *     responses:
     *       200:
     *         description: OK
     */
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
            {$unwind: "$propietario"},
            {
                $match: {
                    activo: "True",
                    "propietario.activo": {$ne: "False"}
                }
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
}
