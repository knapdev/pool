'use strict';

import Utils from '../../shared/math/utils.js';
import Vector2 from "../../shared/math/vector2.js";

import World from "../../shared/world.js";
import Player from "../../shared/entities/player.js";

import Mouse from '../lib/mouse.js';
import Pocket from '../../shared/entities/pocket.js';

class Client{
    constructor(config){
        this.canvas = null;
        this.context = null;
        this.scale = 1;
        this.bgColor = 'rgb(137, 196, 158)';

        this.then = 0.0;
        this.unprocessed = 0.0;
        this.ticks = 0;
        this.frameID = null;

        this.socket = null;

        this.world = null;
        this.playerUUID = 0;

        this.camPos = new Vector2();

        this.connect();
    }

    init(){
        this.createCanvas();
        window.addEventListener('resize', (evnt) => {
            this.resize();
        });

        Mouse._init();
    }

    connect(){
        this.socket = io();
        this.socket.emit('join', {
            name: 'Player'
        });
        this.socket.on('join-response', (pack) => {
            if(pack.success){
                this.init();

                this.playerUUID = pack.uuid;
    
                this.world = new World();
                // create and add players to world
                for(let i in pack.players){
                    let other = pack.players[i];
                    let player = new Player(other.uuid, this.world, other.name, new Vector2(other.position.x, other.position.y));
                    player.unpack(other);
                    if(this.world.addPlayer(player)){
                    }
                }

                for(let i in pack.pockets){
                    let other = pack.pockets[i];
                    let pocket = new Pocket(other.uuid, new Vector2(other.position.x, other.position.y));
                    pocket.unpack(other);
                    if(this.world.addPocket(pocket)){
                    }
                }

                this.socket.on('player-joined', (pack) => {
                    console.log('player joined');
                    let player = new Player(pack.uuid, this.world, pack.name, new Vector2(pack.position.x, pack.position.y));
                    player.unpack(pack);
                    if(this.world.addPlayer(player)){
                    }
                });

                this.socket.on('player-left', (pack) => {
                    if(this.world.removePlayer(pack.uuid)){
                    }
                });

                this.socket.on('update-players', (pack) => {
                    for(let i in pack){
                        let data = pack[i];
                        let other = this.world.getPlayer(data.uuid);
                        other.position.set(data.position.x, data.position.y);
                        other.isMoving = data.isMoving;
                        other.charge = data.charge;
                        other.angle = data.angle;
                    }
                });

                this.socket.on('player-respawn', (pack) => {
                    let player = this.world.getPlayer(pack.uuid);
                    player.score = 0;
                });

                this.socket.on('pocket-reset', (pack) => {
                    let pocket = this.world.getPocket(pack.uuid);
                    pocket.unpack(pack);
                });

                this.socket.on('score-set', (pack) => {
                    let player = this.world.getPlayer(pack.uuid);
                    player.score = pack.score;
                });

                this.socket.on('update-leaderboard', (pack) => {
                    //Clear leaderboard entries
                    let leaderboard_element = document.getElementById('leaderboard');
                    var child = leaderboard_element.lastElementChild;  
                    while (child) { 
                        if(child.id == 'leaderboard-entry'){
                            leaderboard_element.removeChild(child); 
                            child = leaderboard_element.lastElementChild;
                        }else{
                            break;
                        }
                    }

                    //get sorted list of players based on score
                    let sorted = [];
                    for(let i in this.world.players){
                        sorted.push(this.world.players[i]);
                    }
                    sorted.sort((a, b) => (a.score < b.score) ? 1 : -1);
                    //populate leaderboard ui
                    let count = 0;
                    for(let i in sorted){
                        count++;
                        if(count > 5) break;
                        let p = sorted[i];
                        let entry = document.createElement('div');
                        entry.setAttribute('id', 'leaderboard-entry');
                        entry.innerHTML = '<span>' + p.name + '</span>' + ': ' + p.score;
                        leaderboard_element.appendChild(entry);
                    }
                });

                this.start();
            }else{
                //failed to join
            }
        });
    }

    start(){
        this.then = performance.now();
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    run(now){
        let delta = (now - this.then) / 1000.0;
        
        let ticksThisFrame = 0;
        this.unprocessed += delta;
        while(this.unprocessed > (1000.0 / 20.0) / 1000.0){

            this.tick((1000.0 / 20.0) / 1000.0); //20/sec
            this.unprocessed -= (1000.0 / 20.0) / 1000.0;

            this.ticks++;
            ticksThisFrame++;
            if(ticksThisFrame >= 240){
                console.error('PANIC! Spiral of death.');
                this.unprocessed = 0;
                break;
            }
        }

        this.update(delta);
        this.draw();

        this.then = now;
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    tick(delta){
        //this.world.tick(delta);
    }

    update(delta){
        let player = this.world.getPlayer(this.playerUUID);

        if(player.isMoving === false){
            if(Mouse.getButtonDown(Mouse.Button.LEFT)){
                //send button event
                this.socket.emit('button-down', {
                    uuid: this.playerUUID
                });
            }

            if(Mouse.getButtonUp(Mouse.Button.LEFT)){
                //send button event
                this.socket.emit('button-up', {
                    uuid: this.playerUUID
                });
            }

            let mousePos = Mouse.getPos();
            let deltaX = mousePos.x - (this.canvas.width/2);    //add camera lerp
            let deltaY = mousePos.y - (this.canvas.height/2);
            this.socket.emit('mouse-pos', {
                uuid: this.playerUUID,
                pos: {
                    x: deltaX,
                    y: deltaY
                }
            });
        }

        Mouse._update();
    }

    draw(){
        this.clearCanvas();

        let ourPlayer = this.world.getPlayer(this.playerUUID);
        this.camPos = new Vector2(ourPlayer.position.x - (this.canvas.width/2), ourPlayer.position.y - (this.canvas.height/2));

        for(let i in this.world.pockets){
            let pocket = this.world.pockets[i];
            this.context.fillStyle = 'rgb(0, 0, 0)';
            this.context.beginPath();
            this.context.ellipse(pocket.position.x - this.camPos.x, pocket.position.y - this.camPos.y, Pocket.RADIUS, Pocket.RADIUS, 0, 0, Utils.degToRad(360), true);
            this.context.lineWidth = 4;
            this.context.stroke();
        }

        for(let i in this.world.players){
            let player = this.world.players[i];
            if(player.uuid === this.playerUUID){
                this.context.fillStyle = 'rgb(0, 0, 255)';
            }else{
                this.context.fillStyle = 'rgb(255, 0, 0)';
            }
            this.context.beginPath();
            this.context.ellipse(player.position.x - this.camPos.x, player.position.y - this.camPos.y, Player.RADIUS, Player.RADIUS, 0, 0, Utils.degToRad(360), true);
            this.context.fill();

            // Draw stick
            if(player.isMoving === false){
                let stickLength = 64;
                let stickWidth = 8;
                let startDist = 24;
                startDist += (48 * player.charge);
                let dX = Math.cos(player.angle);
                let dY = Math.sin(player.angle);
                let sX = (player.position.x + dX * startDist) - this.camPos.x;
                let sY = (player.position.y + dY * startDist) - this.camPos.y;

                this.context.beginPath();
                this.context.moveTo(sX, sY);
                this.context.lineTo(sX + dX * stickLength, sY + dY * stickLength);
                this.context.lineWidth = stickWidth;
                this.context.stroke();
            }
        }

        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(-this.camPos.x, -this.camPos.y, 8, 8);
    }

    createCanvas(){
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        document.body.appendChild(this.canvas);
        this.resize();

        this.context = this.canvas.getContext('2d');
    }

    clearCanvas(){
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize(){
        let w = window.innerWidth;
        let h = window.innerHeight;
    
        if(this.canvas.width !== w/this.scale || this.canvas.height !== h/this.scale){
            this.canvas.width = w/this.scale;
            this.canvas.height = h/this.scale;
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
        }
    }
}

export default Client;