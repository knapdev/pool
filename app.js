'use strict';

import express from 'express';
import path from 'path';
import http from 'http';

let app = express();
let __dirname = path.resolve();
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

let server = http.createServer(app);
let PORT = process.env.PORT || 8082;
server.on('error', (err) => {
    console.error(err);
});
server.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});