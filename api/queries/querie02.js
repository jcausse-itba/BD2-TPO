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
            {
                $project: {
                    _id: 0,
                    id_consulta: 1,
                    id_paciente: 1,
                    id_vet: 1,
                    fecha: 1,
                    motivo: 1,
                    diagnostico: 1,
                    costo: 1,
                    estado: 1,
                    especialidad: "$veterinario.especialidad",
                    nombre: "$veterinario.nombre"
                }
            }
        ]).toArray());
    })
}
