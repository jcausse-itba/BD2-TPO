const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query6:
     *   get:
     *     summary: 6 Pacientes con vacunas vencidas (próxima dosis anterior a hoy).
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query6', async (req, res) => {
        /* Query 6:  Pacientes con vacunas vencidas (próxima dosis anterior a hoy)*/
        res.send(await mongoose.connection.db.collection('vacunaciones').aggregate([
            {
                $match: {
                    $expr: {
                        $lt: [
                            "$proxima_dosis",
                            {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$$NOW"
                                }
                            }
                        ]
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
        ]).toArray());
    })
}
