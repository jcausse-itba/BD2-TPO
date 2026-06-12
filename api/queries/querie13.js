const mongoose = require('mongoose');

/* Query 13: ABM completo de propietarios: alta, modificación de datos, baja lógica*/
// no es de obtener datos, sino que es de eliminar, modificar o subir datos. y poner ejemplos.
const validatePropietario = (req, res, next) => {
    const validationRules = [
        {name: 'id_propietario', type: 'string'},
        {name: 'nombre', type: 'string'},
        {name: 'apellido', type: 'string'},
        {name: 'dni', type: 'number'},
        {name: 'email', type: 'string'},
        {name: 'telefono', type: 'number'},
        {name: 'ciudad', type: 'string'},
        {name: 'provincia', type: 'string'}
    ];

    for (const rule of validationRules) {
        const value = req.body[rule.name];
        if (value === undefined || value === null || value === '') {
            return res.status(400).json({
                error: `Bad Request: El campo '${rule.name}' es obligatorio y no puede estar vacío.`
            });
        }
        if (typeof value !== rule.type) {
            return res.status(400).json({
                error: `Bad Request: El campo '${rule.name}' debe ser de tipo [${rule.type}]. Se recibió [${typeof value}].`
            });
        }
    }
    next();
};

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query13:
     *   post:
     *     summary: 13 Alta de Propietario (ABM).
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_propietario:
     *                 type: string
     *               nombre:
     *                 type: string
     *               apellido:
     *                 type: string
     *               dni:
     *                 type: number
     *               email:
     *                 type: string
     *               telefono:
     *                 type: number
     *               ciudad:
     *                 type: string
     *               provincia:
     *                 type: string
     *     responses:
     *       201:
     *         description: Creado con éxito
     *       400:
     *         description: Bad Request
     */
    app.post('/query13', validatePropietario, async (req, res) => {
        // alta. (insert)
        const {id_propietario, nombre, apellido, dni, email, telefono, ciudad, provincia} = req.body;

        // validacion de id duplicada
        const propietario = await mongoose.connection.db.collection('propietarios').findOne({id_propietario});
        if (propietario && propietario.activo != 'False') {
            return res.status(400).json({message: `Bad Request: Id ya presente ${id_propietario}`});
        }

        try {
            await mongoose.connection.db.collection('propietarios').updateOne(
                {id_propietario: id_propietario},
                {
                    $set: {
                        nombre: nombre,
                        apellido: apellido,
                        dni: dni,
                        email: email,
                        telefono: telefono,
                        ciudad: ciudad,
                        provincia: provincia,
                        activo: 'True'
                    }
                },
                {upsert: true}
            );
            res.status(201).json({message: "Propietario creado con éxito"});
        } catch (err) {
            console.error('Error en Alta de Propietario:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    /**
     * @swagger
     * /query13:
     *   put:
     *     summary: 13 Modificación de datos de Propietario (ABM).
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_propietario:
     *                 type: string
     *               nombre:
     *                 type: string
     *               apellido:
     *                 type: string
     *               dni:
     *                 type: number
     *               email:
     *                 type: string
     *               telefono:
     *                 type: number
     *               ciudad:
     *                 type: string
     *               provincia:
     *                 type: string
     *     responses:
     *       200:
     *         description: Modificado con éxito
     *       404:
     *         description: Not Found
     */
    app.put('/query13', validatePropietario, async (req, res) => {
        const {id_propietario, nombre, apellido, dni, email, telefono, ciudad, provincia} = req.body;
        try {
            const result = await mongoose.connection.db.collection('propietarios').updateOne(
                {
                    id_propietario: id_propietario,
                    activo: {$ne: "False"}
                },
                {
                    $set: {
                        nombre: nombre,
                        apellido: apellido,
                        dni: dni,
                        email: email,
                        telefono: telefono,
                        ciudad: ciudad,
                        provincia: provincia
                    }
                }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    error: `Not Found: No se encontró ningún propietario con el id_propietario '${id_propietario}'.`
                });
            }
            res.status(200).json({
                message: "Propietario modificado con éxito"
            });
        } catch (err) {
            console.error('Error en Modificación de Propietario:', err);
            res.status(500).send('Internal Server Error');
        }
    });


    /**
     * @swagger
     * /query13:
     *   delete:
     *     summary: 13 Baja lógica de Propietario (ABM).
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_propietario:
     *                 type: string
     *     responses:
     *       200:
     *         description: Dado de baja con éxito
     *       404:
     *         description: Not Found
     */
    app.delete('/query13', async (req, res) => {
        // baja logica: poner "activo" en false.
        const {id_propietario} = req.body;
        if (!id_propietario || typeof id_propietario !== 'string') {
            return res.status(400).json({
                error: "Bad Request: El campo 'id_propietario' es obligatorio y debe ser un string."
            });
        }
        const propietario = await mongoose.connection.db.collection('propietarios').findOne({id_propietario});
        if (propietario && propietario.activo === 'False') {
            return res.status(400).json({message: `Bad Request: Id ya fue eliminado  ${id_propietario}`});
        }
        try {
            const result = await mongoose.connection.db.collection('propietarios').updateOne(
                {id_propietario: id_propietario},
                {
                    $set: {
                        activo: "False"
                    }
                }
            );
            if (result.matchedCount === 0) {
                return res.status(404).json({
                    error: `Not Found: No se encontró ningún propietario con el id_propietario '${id_propietario}'.`
                });
            }
            res.status(200).json({
                message: "Propietario dado de baja con éxito"
            });
        } catch (err) {
            console.error('Error en Baja de Propietario:', err);
            res.status(500).send('Internal Server Error');
        }
    });
}
