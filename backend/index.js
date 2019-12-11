'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

app.use(cors());
app.options('*',cors());


//Settings
app.set('port', process.env.PORT || 3000);

app.use(express.json());

//Rutas
app.use(require('./routes/ciberseguridad.routes'));

app.listen(app.get('port'), (err) =>{
    if (err) {
        return console.log('Something bad happened', err)
    }
    console.log('Server listening on port', app.get('port'));
});

