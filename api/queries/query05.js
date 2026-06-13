const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query5:
     *   get:
     *     summary: 5 Veterinarios activos y cantidad de consultas realizadas en los últimos 60 días.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query5', async (req, res) => {
        /* Query 5: eterinarios activos y cantidad de consultas realizadas en los últimos 60 días*/
        res.send(await mongoose.connection.db.collection('veterinarios').aggregate([
            {
                $match: {
                    activo: "True"
                }
            },
            {
                $lookup: {
                    from: "consultas",
                    let: { vetId: "$id_vet" },
                    pipeline: [  // medio complicado esto
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$id_vet", "$$vetId"] },
                                        {
                                            $gte: [
                                                "$fecha",
                                                {
                                                    $dateToString: {
                                                        format: "%Y-%m-%d",
                                                        date: {
                                                            $dateSubtract: {
                                                                startDate: "$$NOW",
                                                                unit: "day",
                                                                amount: 60
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "consultas"
                }
            },
            {
                $project: {
                    _id: "$id_vet",
                    total: { $size: "$consultas" },
                    veterinario: {
                        _id: "$_id",
                        id_vet: "$id_vet",
                        nombre: "$nombre",
                        apellido: "$apellido",
                        matricula: "$matricula",
                        especialidad: "$especialidad",
                        sucursal: "$sucursal",
                        activo: "$activo"
                    }
                }
            }
        ]).toArray());
    })
}
