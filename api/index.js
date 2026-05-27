const express = require('express')
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const app = express()

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/a', (req, res) => {
    const db = mongoose.connection.db;
    res.send(db.listCollections().toArray())
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
