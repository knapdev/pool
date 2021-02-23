'use strict';

import {Server as IO} from 'socket.io';
import {v4 as UUID} from 'uuid';

import Utils from '../shared/math/utils.js';
import Vector2 from '../shared/math/vector2.js';
import World from '../shared/world.js';
import Entity from '../shared/entities/entity.js';
import Player from '../shared/entities/player.js';
import Pocket from '../shared/entities/pocket.js';

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

            socket.on('button-down', (pack) => {
                let player = this.world.getPlayer(pack.uuid);
                if(player){
                    player.isCharging = true;
                }
            });

            socket.on('button-up', (pack) => {
                let player = this.world.getPlayer(pack.uuid);
                if(player){
                    let dX = -Math.cos(player.angle);
                    let dY = -Math.sin(player.angle);

                    player.setVelocity(new Vector2(dX * (player.charge * Player.FORCE), dY * (player.charge * Player.FORCE)));
                    player.isCharging = false;
                    player.charge = 0;
                    player.attacker = null;
                }
            });

            socket.on('mouse-pos', (pack) => {
                let player = this.world.getPlayer(pack.uuid);
                if(player){
                    let angleRad = Math.atan2(pack.pos.y, pack.pos.x);
                    player.angle = angleRad;
                }
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
            //if(player.isMoving){
            pack.push({
                uuid: player.uuid,
                position: {
                    x: player.position.x,
                    y: player.position.y
                },
                isMoving: player.isMoving,
                charge: player.charge,
                angle: player.angle
            });
            //}
        }
        this.io.emit('update-players', pack);
    }

    setupWorld(){
        this.world = new World();

        this.world.registerOnRespawnPlayerCallback((uuid) => {
            this.world.getPlayer(uuid).score = 0;
            this.io.emit('player-respawn', {
                uuid: uuid
            });
        });

        this.world.registerOnResetPocketCallback((uuid) => {
            let pocket = this.world.getPocket(uuid);

            this.io.emit('pocket-reset', pocket.pack());
        });

        this.world.registerOnSetScoreCallback((uuid, score) => {
            let player = this.world.getPlayer(uuid);
            this.io.emit('score-set', {
                uuid: uuid,
                score: score
            });
        });

        this.world.registerOnUpdateLeaderboardCallback(() => {
            this.io.emit('update-leaderboard', {});
        });

        for(let i = 0; i < 50; i++){
            
            let pos = this.world.getRandomPocketPosition();
            let pocket = new Pocket(UUID(), this.world, pos);
            this.world.addPocket(pocket);
        }
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
        let pos = this.world.getRandomPlayerPosition();
        let player = new Player(uuid, this.world, pack.name, pack.color, pos);
        //player.velocity.set((Math.random() * 10) - 5, (Math.random() * 10) - 5);
        if(this.world.addPlayer(player)){
            // send client current world state

            let pack = {
                success: true,
                uuid: player.uuid,
                players: [],
                pockets: []
            };
            for(let p in this.world.players){
                let other = this.world.players[p];
                pack.players.push(other.pack());
            }
            for(let p in this.world.pockets){
                let other = this.world.pockets[p];
                pack.pockets.push(other.pack());
            }
            this.SOCKETS[uuid].emit('join-response', pack);

            // send OTHER clients this players info
            this.SOCKETS[uuid].broadcast.emit('player-joined', player.pack());

            this.io.emit('update-leaderboard', {});
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
            this.io.emit('update-leaderboard', {});
        }
    }

    onPlayerShot(uuid, pack){
        
    }
}

export default Server;