'use strict';

import Utils from '../../shared/math/utils.js';
import Vector2 from "../../shared/math/vector2.js";

import World from "../../shared/world.js";
import Player from "../../shared/player.js";

import Mouse from '../lib/mouse.js';

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


        this.force = 0.0;   //0.0 - 1.0
        this.pullSpeed = 1.25;

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
                    let player = new Player(other.uuid, other.name, new Vector2(other.position.x, other.position.y));
                    player.unpack(other);
                    if(this.world.addPlayer(player)){

                    }
                }

                this.socket.on('player-joined', (pack) => {
                    console.log('player joined');
                    let player = new Player(pack.uuid, pack.name, new Vector2(pack.position.x, pack.position.y));
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

        if(Mouse.getButtonDown(Mouse.Button.LEFT)){
            
        }

        if(Mouse.getButtonUp(Mouse.Button.LEFT)){
            //send input data to server
            this.socket.emit('player-shot', {
                uuid: this.playerUUID,
                angle: player.angle,
                force: this.force
            });
            this.force = 0;
        }

        if(Mouse.getButton(Mouse.Button.LEFT)){
            this.force += this.pullSpeed * delta;
            this.force = Utils.clamp(this.force, 0.0, 1.0);
        }

        // get angle from mouse to our players position
        let mousePos = Mouse.getPos();

        let deltaY = mousePos.y - player.position.y;
        let deltaX = mousePos.x - player.position.x;

        //let angleDeg = Utils.radToDeg(Math.atan2(deltaY, deltaX));
        //if(angleDeg < 0) angleDeg = 360 + angleDeg;
        let angleRad = Math.atan2(deltaY, deltaX);
        document.getElementById('debug').innerText = angleRad.toFixed(2);

        player.angle = angleRad;

        Mouse._update();
    }

    draw(){
        this.clearCanvas();

        for(let i in this.world.players){
            let player = this.world.players[i];
            if(player.uuid === this.playerUUID){
                this.context.fillStyle = 'rgb(0, 0, 255)';
            }else{
                this.context.fillStyle = 'rgb(255, 0, 0)';
            }
            this.context.beginPath();
            this.context.ellipse(player.position.x, player.position.y, Player.RADIUS, Player.RADIUS, 0, 0, Utils.degToRad(360), true);
            this.context.fill();

            // Draw stick
            let stickLength = 64;
            let stickWidth = 8;
            let startDist = 24;
            if(player.uuid === this.playerUUID) startDist += (48 * this.force);
            let dX = Math.cos(player.angle);
            let dY = Math.sin(player.angle);
            let sX = player.position.x + dX * startDist;
            let sY = player.position.y + dY * startDist;

            this.context.beginPath();
            this.context.moveTo(sX, sY);
            this.context.lineTo(sX + dX * stickLength, sY + dY * stickLength);
            this.context.lineWidth = stickWidth;
            this.context.stroke();
        }
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