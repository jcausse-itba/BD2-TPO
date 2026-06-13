const mongoose = require('mongoose');

/* Query 15: Actualización masiva del stock: decrementar unidades de un producto tras una consulta. */
const validateStockDecrement = (req, res, next) => {
    const {productos} = req.body;

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

module.exports = (app, cassandraClient, KEYSPACE) => {

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
        const {productos} = req.body;

        try {
            const selectPromises = productos.map(p =>
                cassandraClient.execute(
                    `SELECT id_producto, unidades
                     FROM "${KEYSPACE}".stock_farmaceutico
                     WHERE id_producto = ?;`,
                    [p.id_producto],
                    {prepare: true}
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
                    query: `UPDATE "${KEYSPACE}".stock_farmaceutico
                            SET unidades = ?
                            WHERE id_producto = ?;`,
                    params: [nuevasUnidades, productos[i].id_producto]
                });
            }

            await Promise.all(updateQueries.map(q =>
                cassandraClient.execute(q.query, q.params, {prepare: true})
            ));

            res.status(200).json({
                message: "Stock actualizado de forma masiva con éxito."
            });

        } catch (err) {
            console.error('Error en Actualización Masiva de Stock:', err);
            res.status(500).send('Internal Server Error');
        }
    });
}
