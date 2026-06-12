const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query2:
     *   get:
     *     summary: 2 Consultas médicas abiertas (estado 'Seguimiento') con veterinario asignado y costo.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query2', async (req, res) => {
        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $lookup: {
                    from: "veterinarios",
                    localField: "id_vet",
                    foreignField: "id_vet",
                    as: "veterinario"
                }
            },
            {$unwind: "$veterinario"},
            {
                $match: {estado: "Seguimiento"}
            },
        ]).toArray());
    })
}
