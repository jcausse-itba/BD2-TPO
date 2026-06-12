const express = require('express')
const cassandra = require('cassandra-driver');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const cassandraClient = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_HOST || 'localhost'],
    localDataCenter: process.env.CASSANDRA_DC || 'datacenter1',
    keyspace: process.env.CASSANDRA_KEYSPACE,
    credentials: {
        username: 'cassandra',
        password: 'cassandra'
    }
});

const KEYSPACE = process.env.CASSANDRA_KEYSPACE;

cassandraClient.connect()
    .then(() => {})
    .catch((err) => console.error('Cassandra connection error:', err))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {})
    .catch((err) => console.error('Cassandra MongoDB error:', err))

const app = express()

// CORS — allow the frontend to reach the API from any origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json())

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'VetSalud S.A. API - Grupo 10',
            version: '1.0.0',
            description: 'API para el  Sistema de Gestión de Clínica Veterinaria.',
        },
    },
    apis: [__filename], // Parses this file for @swagger comments
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = process.env.PORT || 3000

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta raíz
 *     responses:
 *       200:
 *         description: Retorna el nombre del grupo
 */
app.get('/', (req, res) => {
    res.send('Grupo 10')
})

/**
 * @swagger
 * /query1:
 *   get:
 *     summary: 1 Pacientes activos con todos sus datos de propietario.
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/query1', async (req, res) => {
    /* Pacientes activos con la totalidad de sus datos de propietario */
    res.send(await mongoose.connection.db.collection('pacientes').aggregate([
        {
            $lookup: {
                from: "propietarios",
                localField: "id_propietario",
                foreignField: "id_propietario",
                as: "propietario"
            }
        },
        { $unwind: "$propietario" },
        {
            $match: { 
                activo: "True",
                "propietario.activo": { $ne: "False" } 
            }
        },
        {
            $project: {
                _id: 0,
                nombre: 1,
                "propietario.nombre": 1,
                "propietario.apellido": 1,
                "propietario.dni": 1,
                "propietario.email": 1,
                "propietario.telefono": 1,
                "propietario.ciudad": 1,
                "propietario.provincia": 1,
            }
        }
    ]).toArray());
})



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
            { $unwind: "$veterinario" },
            {
                $match: { estado: "Seguimiento" }
            },
        ]).toArray());
})


/**
 * @swagger
 * /query3:
 *   get:
 *     summary: 3 Historial completo de un paciente (consultas y vacunaciones) ordenadas por fecha.
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/query3', async (req, res) => {
    /** QUERY 3: Historial completo de un paciente: consultas y vacunaciones ordenadas por fecha*/

    res.send(await mongoose.connection.db.collection('consultas').aggregate([
        {
            $match: {
                id_paciente: "P001"
            }
        },
        {
            $project: {
                _id: 0,
                fecha: 1,
                tipo: { $literal: "Consulta" },
                detalle: "$motivo",
                diagnostico: 1,
                veterinario: "$id_vet"
            }
        },
        {
            $unionWith: {
                coll: "vacunas",
                pipeline: [
                    {
                        $match: {
                            id_paciente: "P001"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            fecha: "$fecha_aplicacion",
                            tipo: { $literal: "Vacunación" },
                            detalle: "$nombre_vacuna",
                            proxima_dosis: 1,
                            veterinario: "$id_vet"
                        }
                    }
                ]
            }
        },
        {
            $sort: {
                fecha: 1
            }
        }
    ]).toArray());
})


/**
 * @swagger
 * /query4:
 *   get:
 *     summary: 4 Propietarios con más de un paciente registrado.
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/query4', async (req, res) => {
    /* QUERY 4: Propietarios con más de un paciente registrado.*/
    res.send(await mongoose.connection.db.collection('propietarios').aggregate([
        {
            $lookup: {
                from: "pacientes",
                localField: "id_propietario",
                foreignField: "id_propietario",
                as: "paciente"
            }
        },
        {
            $match: {
                $expr: {
                    $gt: [
                        { $size: "$paciente" },
                        1
                    ]
                },
                activo: { $ne: "False" } 
            }
        },
        {
            $project: {
                _id: 0,
                nombre: 1,
                apellido: 1,
                //"paciente.nombre": 1,
            }
        }
    ]).toArray());
})


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
                total: { $sum: 1 }
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
        { $unwind: "$veterinario" },
        {
            $match: { "veterinario.activo": "True" }
        },
    ]).toArray());
})


/**
 * @swagger
 * /query6:
 *   get:
 *     summary: 6 Pacientes con vacunas vencidas (próxima dosis anterior a hoy).
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/query6', async (req, res) => {
    /* Query 6:  Pacientes con vacunas vencidas (próxima dosis anterior a hoy)*/
    res.send(await mongoose.connection.db.collection('vacunaciones').aggregate([
        {
            $match: {
                $expr: {
                    $lt: [
                        "$proxima_dosis",
                        {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$$NOW"
                            }
                        }
                    ]
                }
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
        {
            $unwind: "$paciente"
        },
        {
            $project: {
                _id: 0,
                id_paciente: "$paciente.id_paciente",
                nombre: "$paciente.nombre",
                especie: "$paciente.especie"
            }
        }
    ]).toArray());
})


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
                    cantidad: { $sum: 1 }
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


/**
 * @swagger
 * /query8:
 *   get:
 *     summary: 8 Stock de productos con menos de 50 unidades y su proveedor.
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/query8', async (req, res) => {
    /* Query 8: Stock de productos con menos de 50 unidades y su proveedor.*/
    try {
        res.json((await cassandraClient.execute(
                `SELECT nombre, unidades, proveedor
                FROM "${KEYSPACE}".stock_farmaceutico WHERE unidades<50;`)
        ).rows);
    } catch (err) {
        console.error('Error executing Cassandra query:', err);
        res.status(500).send('Internal Server Error');
    }
});


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
            _id: 0,
            fecha: 1,
            motivo: 1,
            diagnostico: 1,
            costo: 1,
            estado: 1
        }
    ).toArray());
});


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
    const { sucursal } = req.query;
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
            { $unwind: "$vet" },
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
            { $unwind: "$paciente" },
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
                                )
                            }
                        }
                    }
                },
                activo: { $ne: "False" } 
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

/* Query 13: ABM completo de propietarios: alta, modificación de datos, baja lógica*/
// no es de obtener datos, sino que es de eliminar, modificar o subir datos. y poner ejemplos.
const validatePropietario = (req, res, next) => {
    const validationRules = [
        { name: 'id_propietario', type: 'string' },
        { name: 'nombre', type: 'string' },
        { name: 'apellido', type: 'string' },
        { name: 'dni', type: 'number' },
        { name: 'email', type: 'string' },
        { name: 'telefono', type: 'number' },
        { name: 'ciudad', type: 'string' },
        { name: 'provincia', type: 'string' }
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
    const { id_propietario, nombre, apellido, dni, email, telefono, ciudad, provincia } = req.body;

    // validacion de id duplicada
    const propietario = await mongoose.connection.db.collection('propietarios').findOne({ id_propietario });
    if (propietario && propietario.activo != 'False') {
        return res.status(400).json({ message: `Bad Request: Id ya presente ${id_propietario}` });
    } 

    try {
        await mongoose.connection.db.collection('propietarios').updateOne(
            { id_propietario: id_propietario },
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
            { upsert: true }
        );
        res.status(201).json({ message: "Propietario creado con éxito" });
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
    const { id_propietario, nombre, apellido, dni, email, telefono, ciudad, provincia } = req.body;
    try {
        const result = await mongoose.connection.db.collection('propietarios').updateOne(
            { 
                id_propietario: id_propietario,
                activo: { $ne: "False" } 
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
    const { id_propietario } = req.body;
    if (!id_propietario || typeof id_propietario !== 'string') {
        return res.status(400).json({
            error: "Bad Request: El campo 'id_propietario' es obligatorio y debe ser un string."
        });
    }

    try {
        const result = await mongoose.connection.db.collection('propietarios').updateOne(
            { id_propietario: id_propietario },
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

/* Query 14: Registro de nueva consulta médica con validación de paciente y veterinario existentes.*/
const validateConsulta = (req, res, next) => {
    const validationRules = [
        { name: 'id_consulta', type: 'string' },
        { name: 'id_paciente', type: 'string' },
        { name: 'id_vet', type: 'string' },
        { name: 'fecha', type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
        { name: 'motivo', type: 'string' },
        { name: 'diagnostico', type: 'string' },
        { name: 'costo', type: 'number' },
        { name: 'estado', type: 'string' }
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
    if(isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Bad Request: Fecha inválida." });
    }
    next();
};

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
            mongoose.connection.db.collection('pacientes').findOne({ id_paciente: id_paciente, activo: "True" }),
            mongoose.connection.db.collection('veterinarios').findOne({ id_vet: id_vet, activo: "True" })
        ]);
        if (!paciente || !veterinario) {
            return res.status(400).json({ error: "Paciente o veterinario inexistente o inactivo." });
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


/* Query 15: Actualización masiva del stock: decrementar unidades de un producto tras una consulta. */
const validateStockDecrement = (req, res, next) => {
    const { productos } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            error: "Bad Request: El campo 'productos' es obligatorio, debe ser un array y contener al menos un elemento."
        });
    }

    for (const item of productos) {
        if (!item.id_producto || typeof item.id_producto !== 'string') {
            return res.status(400).json({
                error: "Bad Request: Cada elemento debe contener un 'id_producto' de tipo string."
            });
        }
        if (item.cantidad === undefined || typeof item.cantidad !== 'number' || item.cantidad <= 0) {
            return res.status(400).json({
                error: "Bad Request: Cada elemento debe contener una 'cantidad' numérica mayor a 0."
            });
        }
    }
    next();
};

/**
 * @swagger
 * /query15:
 *   put:
 *     summary: 15 Actualización masiva del stock (decrementar unidades tras una consulta).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *             example:
 *               productos:
 *                 - id_producto: "PRD002"
 *                   cantidad: 5
 *                 - id_producto: "PRD004"
 *                   cantidad: 2
 *                 - id_producto: "PRD006"
 *                   cantidad: 1
 *                 - id_producto: "PRD008"
 *                   cantidad: 3
 *     responses:
 *       200:
 *         description: Stock actualizado de forma masiva con éxito
 *       400:
 *         description: Bad Request o Stock Insuficiente
 *       404:
 *         description: Not Found
 */
app.put('/query15', validateStockDecrement, async (req, res) => {
    const { productos } = req.body;

    try {
        const selectPromises = productos.map(p =>
            cassandraClient.execute(
                `SELECT id_producto, unidades FROM "${KEYSPACE}".stock_farmaceutico WHERE id_producto = ?;`,
                [p.id_producto],
                { prepare: true }
            )
        );
        const selectResults = await Promise.all(selectPromises);

        const updateQueries = [];

        for (let i = 0; i < productos.length; i++) {
            if (!selectResults[i].rows[0]) {
                return res.status(404).json({
                    error: `Not Found: No se encontró el producto con el id_producto '${productos[i].id_producto}'.`
                });
            }

            const nuevasUnidades = selectResults[i].rows[0].unidades - productos[i].cantidad;

            if (nuevasUnidades < 0) {
                return res.status(400).json({
                    error: `Bad Request: Stock insuficiente para el producto '${productos[i].id_producto}'. Stock actual: ${selectResults[i].rows[0].unidades}, solicitado: ${productos[i].cantidad}.`
                });
            }

            updateQueries.push({
                query: `UPDATE "${KEYSPACE}".stock_farmaceutico SET unidades = ? WHERE id_producto = ?;`,
                params: [nuevasUnidades, productos[i].id_producto]
            });
        }

        await Promise.all(updateQueries.map(q =>
            cassandraClient.execute(q.query, q.params, { prepare: true })
        ));

        res.status(200).json({
            message: "Stock actualizado de forma masiva con éxito."
        });

    } catch (err) {
        console.error('Error en Actualización Masiva de Stock:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Grupo 10 app listening on port ${port}`)
    console.log(`Swagger Docs available: /api-docs`);
})
