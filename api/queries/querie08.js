const mongoose = require('mongoose');

module.exports = (app, cassandraClient, KEYSPACE) => {

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
}
