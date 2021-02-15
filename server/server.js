'use strict';

import {Server as IO} from 'socket.io';
import {v4 as UUID} from 'uuid';

import Vector2 from '../shared/math/vector2.js';
import World from '../shared/world.js';
import Player from '../shared/player.js';

class Server{
    constructor(http){

        this.io = null;
        this.SOCKETS = {};

        this.world = null;

        this.setupWorld();
        this.init(http);
    }

    init(http){
        this.io = new IO(http);
        this.io.on('connection', (socket) => {
            socket.uuid = UUID();
            this.connect(socket);

            socket.on('join', (pack) => {
                this.onJoin(socket.uuid, pack);
            });

            socket.on('leave', (pack) => {
                this.onLeave(socket.uuid);
            });

            socket.on('player-shot', (pack) => {
                let player = this.world.getPlayer(pack.uuid);
                
                let dX = -Math.cos(pack.angle);
                let dY = -Math.sin(pack.angle);

                player.setVelocity(new Vector2(dX * (pack.force * 32), dY * (pack.force * 32)));
            });

            socket.on('disconnect', () => {
                this.onLeave(socket.uuid);
                this.disconnect(socket);
            });
        });
    }

    start(){
        this.run();
    }

    run(){
        const TICK_RATE = 1000.0 / 60.0;
        setInterval(() => {
            this.tick(TICK_RATE / 1000.0);
        }, TICK_RATE);
    }

    tick(delta){
        this.world.tick(delta);

        //get all players updated info
        let pack = [];
        for(let i in this.world.players){
            let player = this.world.players[i];
            pack.push({
                uuid: player.uuid,
                position: {
                    x: player.position.x,
                    y: player.position.y
                }
            });
        }
        this.io.emit('update-players', pack);
    }

    setupWorld(){
        this.world = new World();
    }

    ////

    connect(socket){
        console.log('Client [' + socket.uuid + '] connected!');
        this.SOCKETS[socket.uuid] = socket;
    }

    disconnect(socket){
        console.log('Client [' + socket.uuid + '] disconnected!');
        delete this.SOCKETS[socket.uuid];
    }

    onJoin(uuid, pack){
        console.log('Client [' + uuid + '] joined!');

        // create a player object and add it to the world
        let player = new Player(uuid, pack.name, new Vector2((Math.random() * 500) + Player.RADIUS, (Math.random() * 500) + Player.RADIUS));
        player.velocity.set((Math.random() * 10) - 5, (Math.random() * 10) - 5);
        if(this.world.addPlayer(player)){
            // send client current world state

            let pack = {
                success: true,
                uuid: player.uuid,
                players: []
            };
            for(let p in this.world.players){
                let other = this.world.players[p];
                pack.players.push(other.pack());
            }
            this.SOCKETS[uuid].emit('join-response', pack);

            // send OTHER clients this players info
            this.SOCKETS[uuid].broadcast.emit('player-joined', player.pack());
        }else{
            this.SOCKETS[uuid].emit('join-response', {
                success: false
            });
        }
    }

    onLeave(uuid){
        if(this.world.removePlayer(uuid)){
            //send client confirmation that they left
            this.SOCKETS[uuid].emit('leave-response', {});
            //tell OTHER clients this player left
            this.SOCKETS[uuid].broadcast.emit('player-left', {
                uuid: uuid
            });
        }
    }

    onPlayerShot(uuid, pack){
        
    }
}

export default Server;