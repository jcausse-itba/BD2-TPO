const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query7:
     *   get:
     *     summary: 7 Top 5 diagnósticos más frecuentes.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query7', async (req, res) => {
        /* Query 7: Top 5 diagnósticos más frecuentes*/
        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $group: {
                    _id: "$diagnostico",
                    cantidad: {$sum: 1}
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
        ]).toArray());
    })
}
