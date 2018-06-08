/* eslint new-cap: 0 */
'use strict';

const express = require('express');
const generateList = require('./scripts/generateList')();
const port = 8007,
    app = express(),
    router = express.Router();

app.use('/api', router);
app.use(express.static(`${__dirname}/public`));

router.get('/generateBooks/:amount', (req, res) => {
    let amount = parseInt(Math.abs(req.params.amount), 10);

    amount = isNaN(amount) ? 0 : amount;
    res.json(generateList(amount));
});

// eslint-disable-next-line no-console
app.listen(port, () => console.info(`App is listening quietly on port ${port}`));
