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
        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $match: {
                    $expr: {
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
                }
            },
            {
                $group: {
                    _id: "$id_vet",
                    total: {$sum: 1}
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
            {$unwind: "$veterinario"},
            {
                $match: {"veterinario.activo": "True"}
            },
        ]).toArray());
    })
}
