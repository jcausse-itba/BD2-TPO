const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query9:
     *   get:
     *     summary: 9 Consultas de tipo 'Control' con costo menor a $5.000.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query9', async (req, res) => {
        /* Query 9: Consultas de tipo 'Control' con costo menor a $5.000*/
        res.send(await mongoose.connection.db.collection('consultas').find(
            {
                motivo: {
                    $regex: "Control"
                },
                costo: {
                    $lt: 5000
                }
            },
            {
                projection: {
                    _id: 0,
                    fecha: 1,
                    motivo: 1,
                    diagnostico: 1,
                    costo: 1,
                    estado: 1
                }
            }
        ).toArray());
    });
}
