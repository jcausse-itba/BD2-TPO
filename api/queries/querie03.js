const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query3:
     *   get:
     *     summary: 3 Historial completo de un paciente (consultas y vacunaciones) ordenadas por fecha.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query3', async (req, res) => {
        /** QUERY 3: Historial completo de un paciente: consultas y vacunaciones ordenadas por fecha*/

        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $match: {
                    id_paciente: "P001"
                }
            },
            {
                $project: {
                    _id: 0,
                    fecha: 1,
                    tipo: {$literal: "Consulta"},
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
                                tipo: {$literal: "Vacunación"},
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
        ]).toArray());
    })
}
