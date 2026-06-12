const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query4:
     *   get:
     *     summary: 4 Propietarios con más de un paciente registrado.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query4', async (req, res) => {
        /* QUERY 4: Propietarios con más de un paciente registrado.*/
        res.send(await mongoose.connection.db.collection('propietarios').aggregate([
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
                            {$size: "$paciente"},
                            1
                        ]
                    },
                    activo: {$ne: "False"}
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
        ]).toArray());
    })
}
