const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query3:
     *   get:
     *     summary: 3 Historial completo de un paciente (consultas y vacunaciones) ordenadas por fecha.
     *     parameters:
     *       - in: query
     *         name: id_paciente
     *         schema:
     *           type: string
     *           default: P001
     *         required: true
     *         description: Id del paciente
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query3', async (req, res) => {
        /** QUERY 3: Historial completo de un paciente: consultas y vacunaciones ordenadas por fecha*/
        const {id_paciente} = req.query;
        if (!id_paciente || typeof id_paciente !== 'string') {
            return res.status(400).json({
                error: "Bad Request: 'id_paciente' query parameter is required and must be a string."
            });
        }

        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $match: {
                    id_paciente: id_paciente
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
                    coll: "vacunaciones",
                    pipeline: [
                        {
                            $match: {
                                id_paciente: id_paciente
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
