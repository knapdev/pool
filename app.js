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
app.use('/shared', express.static(__dirname + '/shared'));

let httpServer = http.createServer(app);
let PORT = process.env.PORT || 8082;
httpServer.on('error', (err) => {
    console.error(err);
});
httpServer.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});

import Server from './server/server.js';

function main(){
    let server = new Server(httpServer);
    server.start();
}
main();