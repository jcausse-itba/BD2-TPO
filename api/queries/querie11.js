const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query11:
     *   get:
     *     summary: 11 Vista agregada (ingresos totales por veterinario en el mes actual).
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query11', async (req, res) => {
        /** Query 11: Vista agregada: ingresos totales por veterinario en el mes actual*/
        res.send(await mongoose.connection.db.collection('vw_ingresos_veterinario_mes_actual').find(
        ).toArray());
    });
}
