const mongoose = require('mongoose');

/* Query 14: Registro de nueva consulta médica con validación de paciente y veterinario existentes.*/
const validateConsulta = (req, res, next) => {
    const validationRules = [
        {name: 'id_consulta', type: 'string'},
        {name: 'id_paciente', type: 'string'},
        {name: 'id_vet', type: 'string'},
        {name: 'fecha', type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/},
        {name: 'motivo', type: 'string'},
        {name: 'diagnostico', type: 'string'},
        {name: 'costo', type: 'number'},
        {name: 'estado', type: 'string'}
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
        if (rule.pattern && !rule.pattern.test(value)) {
            return res.status(400).json({
                error: `Bad Request: El campo '${rule.name}' no tiene un formato válido. Debe ser YYYY-MM-DD (Ej: '2026-06-03').`
            });
        }
    }
    const parsedDate = new Date(req.body['fecha']);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({message: "Bad Request: Fecha inválida."});
    }
    next();
};

module.exports = (app, cassandraClient, KEYSPACE) => {

    /**
     * @swagger
     * /query14:
     *   post:
     *     summary: 14 Registro de nueva consulta médica con validación de paciente y veterinario.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id_consulta:
     *                 type: string
     *                 example: "CON029"
     *               id_paciente:
     *                 type: string
     *                 example: "P010"
     *               id_vet:
     *                 type: string
     *                 example: "V010"
     *               fecha:
     *                 type: string
     *                 format: date
     *                 example: "2026-06-03"
     *               motivo:
     *                 type: string
     *               diagnostico:
     *                 type: string
     *               costo:
     *                 type: number
     *               estado:
     *                 type: string
     *     responses:
     *       201:
     *         description: Consulta registrada con éxito
     *       400:
     *         description: Bad Request
     */
    app.post('/query14', validateConsulta, async (req, res) => {
        const {id_consulta, id_paciente, id_vet, fecha, motivo, diagnostico, costo, estado} = req.body;

        try {
            const [paciente, veterinario] = await Promise.all([
                mongoose.connection.db.collection('pacientes').findOne({id_paciente: id_paciente, activo: "True"}),
                mongoose.connection.db.collection('veterinarios').findOne({id_vet: id_vet, activo: "True"})
            ]);
            if (!paciente || !veterinario) {
                return res.status(400).json({error: "Paciente o veterinario inexistente o inactivo."});
            }
            if (await mongoose.connection.db.collection('consultas').findOne({id_consulta: id_consulta})) {
                return res.status(400).json({
                    error: `Bad Request: Ya existe una consulta registrada con el id_consulta '${id_consulta}'.`
                });
            }
            await mongoose.connection.db.collection('consultas').insertOne({
                id_consulta: id_consulta,
                id_paciente: id_paciente,
                id_vet: id_vet,
                fecha: fecha,
                motivo: motivo,
                diagnostico: diagnostico,
                costo: costo,
                estado: estado
            });
            res.status(201).json({
                message: "Consulta médica registrada con éxito."
            });
        } catch (err) {
            console.error('Error al registrar la consulta médica:', err);
            res.status(500).send('Internal Server Error');
        }
    });
}
