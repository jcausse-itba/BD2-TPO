const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query10:
     *   get:
     *     summary: 10 Todos los pacientes de una sucursal determinada.
     *     parameters:
     *       - in: query
     *         name: sucursal
     *         schema:
     *           type: string
     *           default: Palermo
     *         required: true
     *         description: Nombre de la sucursal
     *     responses:
     *       200:
     *         description: OK
     *       400:
     *         description: Bad Request
     */
    app.get('/query10', async (req, res) => {
        /*Query 10: los pacientes de una sucursal determinada (a través del veterinario*/
        const {sucursal} = req.query;
        if (!sucursal || typeof sucursal !== 'string') {
            return res.status(400).json({
                error: "Bad Request: 'sucursal' query parameter is required and must be a string."
            });
        }
        res.send(await mongoose.connection.db.collection('consultas').aggregate([
            {
                $lookup: {
                    from: "veterinarios",
                    localField: "id_vet",
                    foreignField: "id_vet",
                    as: "vet"
                }
            },
            {$unwind: "$vet"},
            {
                $match: {
                    "vet.sucursal": sucursal
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
            {$unwind: "$paciente"},
            {
                $project: {
                    _id: 0,
                    id_paciente: "$paciente.id_paciente",
                    nombre: "$paciente.nombre",
                    especie: "$paciente.especie",
                    raza: "$paciente.raza",
                    activo: "$paciente.activo"
                }
            }
        ]).toArray());
    });
}
