const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query12:
     *   get:
     *     summary: 12 Propietarios sin consultas registradas en el último año.
     *     responses:
     *       200:
     *         description: OK
     */
    app.get('/query12', async (req, res) => {
        /** Query 12: Propietarios sin consultas registradas en el último año*/
        res.send(await mongoose.connection.db.collection('propietarios').aggregate([
            {
                $lookup: {
                    from: "pacientes",
                    localField: "id_propietario",
                    foreignField: "id_propietario",
                    as: "pacientes"
                }
            },
            {
                $lookup: {
                    from: "consultas",
                    localField: "pacientes.id_paciente",
                    foreignField: "id_paciente",
                    as: "consultas"
                }
            },
            {
                $match: {
                    consultas: {
                        $not: {
                            $elemMatch: {
                                fecha: {
                                    $gte: new Date(
                                        new Date().setFullYear(new Date().getFullYear() - 1)
                                    ).toISOString().split('T')[0]
                                }
                            }
                        }
                    },
                    activo: {$ne: "False"}
                }
            },
            {
                $project: {
                    _id: 0,
                    id_propietario: 1,
                    nombre: 1,
                    apellido: 1
                }
            }
        ]).toArray());
    })
}
