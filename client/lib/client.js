'use strict';

import Utils from '../../shared/math/utils.js';
import Vector2 from "../../shared/math/vector2.js";

import World from "../../shared/world.js";
import Entity from '../../shared/entities/entity.js';
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

        this.selected_color_index = 0;

        this.image = null;

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

        this.image = new Image();
        this.image.src = './client/res/dude.png';
        this.image.onload = function(){
            console.log('image loaded');
        };

        Player.setupColors();
        this.updateColorBox();

        let self = this;
        document.getElementById('arrow-button-previous').addEventListener('click', (evnt) => {
            self.selected_color_index -= 1;
            if(self.selected_color_index < 0){
                self.selected_color_index = Player.COLORS.length-1;
            }
            self.updateColorBox();
        });
    
        document.getElementById('arrow-button-next').addEventListener('click', (evnt) => {
            self.selected_color_index += 1;
            if(self.selected_color_index >= Player.COLORS.length){
                self.selected_color_index = 0;
            }
            self.updateColorBox();
        });
        
        document.getElementById('name-form').addEventListener('submit', (evnt) => {
            evnt.preventDefault();

            document.getElementById('lobby').style.visibility = 'hidden';
            document.getElementById('ui').style.visibility = 'visible';

            let nameInputElem = document.getElementById('name-text');
            let nameValue = nameInputElem.value;
            nameInputElem.value = '';

            this.socket = io();
            this.socket.emit('join', {
                name: nameValue,
                color: Player.COLORS[this.selected_color_index]
            });
            this.socket.on('join-response', (pack) => {
                if(pack.success){
                    this.init();

                    this.playerUUID = pack.uuid;
        
                    this.world = new World();
                    // create and add players to world
                    for(let i in pack.players){
                        let other = pack.players[i];
                        let player = new Player(other.uuid, this.world, other.name, other.color, new Vector2(other.position.x, other.position.y));
                        player.unpack(other);
                        if(this.world.addPlayer(player)){
                        }
                    }

                    for(let i in pack.pockets){
                        let other = pack.pockets[i];
                        let pocket = new Pocket(other.uuid, this.world, new Vector2(other.position.x, other.position.y));
                        pocket.unpack(other);
                        if(this.world.addPocket(pocket)){
                        }
                    }

                    this.socket.on('player-joined', (pack) => {
                        console.log('player joined');
                        let player = new Player(pack.uuid, this.world, pack.name, pack.color, new Vector2(pack.position.x, pack.position.y));
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
                        this.updateLeaderboard();
                    });

                    this.start();
                }else{
                    //failed to join
                }
            });
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
            let x = (pocket.position.x - this.camPos.x) % World.SIZE;
            if(x < -Entity.POCKET_RADIUS*2){
                x = x + World.SIZE;
            }else if(x > window.innerWidth + Entity.POCKET_RADIUS*2){
                x = x - World.SIZE;
            }
            let y = (pocket.position.y - this.camPos.y) % World.SIZE;
            if(y < -Entity.POCKET_RADIUS*2){
                y = y + World.SIZE;
            }else if(y > window.innerHeight + Entity.POCKET_RADIUS*2){
                y = y - World.SIZE;
            }
            this.context.fillStyle = 'rgb(0, 0, 0)';
            this.context.beginPath();
            this.context.ellipse(x, y, Entity.POCKET_RADIUS, Entity.POCKET_RADIUS, 0, 0, Utils.degToRad(360), true);
            this.context.lineWidth = 4;
            this.context.stroke();
        }

        for(let i in this.world.players){
            let player = this.world.players[i];
            let x = (player.position.x - this.camPos.x) % World.SIZE;
            if(x < -Entity.PLAYER_RADIUS*2){
                x = x + World.SIZE;
            }else if(x > window.innerWidth + Entity.PLAYER_RADIUS*2){
                x = x - World.SIZE;
            }
            let y = (player.position.y - this.camPos.y) % World.SIZE;
            if(y < -Entity.PLAYER_RADIUS*2){
                y = y + World.SIZE;
            }else if(y > window.innerHeight + Entity.PLAYER_RADIUS*2){
                y = y - World.SIZE;
            }
            this.context.fillStyle = 'rgb(' + player.color.r + ', ' + player.color.g + ', ' + player.color.b + ')';
            this.context.beginPath();
            this.context.ellipse(x, y, Entity.PLAYER_RADIUS, Entity.PLAYER_RADIUS, 0, 0, Utils.degToRad(360), true);
            this.context.fill();
        }

        for(let i in this.world.players){
            let player = this.world.players[i];
            let startDist = 24;
            startDist += (48 * player.charge);
            this.context.save();
            let x = (player.position.x - this.camPos.x) % World.SIZE;
            if(x < -Entity.PLAYER_RADIUS*2){
                x = x + World.SIZE;
            }else if(x > window.innerWidth + Entity.PLAYER_RADIUS*2){
                x = x - World.SIZE;
            }
            let y = (player.position.y - this.camPos.y) % World.SIZE;
            if(y < -Entity.PLAYER_RADIUS*2){
                y = y + World.SIZE;
            }else if(y > window.innerHeight + Entity.PLAYER_RADIUS*2){
                y = y - World.SIZE;
            }
            this.context.translate(x, y);
            this.context.rotate(player.angle + Utils.degToRad(-90));
            this.context.translate(-16, startDist);
            this.context.drawImage(this.image, 0, 0);
            this.context.restore();
        }

        this.drawMinimap();
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

    updateColorBox(){
        let col = Player.COLORS[this.selected_color_index];
        let color_box_elem = document.getElementById('color-box');
        color_box_elem.style.backgroundColor = 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')';
    }

    updateLeaderboard(){
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
            entry.innerHTML = '<span style="color: rgb(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ');">' + p.name + '</span>' + ': ' + p.score;
            leaderboard_element.appendChild(entry);
        }
    }

    drawMinimap(){
        this.context.save();
        this.context.lineWidth = 1;
        let width = 150;
        let height = 150;
        let x_pos = window.innerWidth - (width + 10);
        let y_pos = window.innerHeight - (height + 10);

        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(x_pos, y_pos, width, height);

        this.context.strokeStyle = 'rgb(255, 255, 255)';
        this.context.strokeRect(x_pos, y_pos, width, height);

        this.context.strokeStyle = 'rgb(32, 32, 64)';
        
        this.context.beginPath();
        this.context.moveTo(x_pos + (width/2), y_pos);
        this.context.lineTo(x_pos + (width/2), y_pos + height);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(x_pos, y_pos + (height/2));
        this.context.lineTo(x_pos + width, y_pos + (height/2));
        this.context.stroke();

        for(var i in this.world.pockets){
            let pocket = this.world.pockets[i];

            let px = width * (pocket.position.x / World.SIZE);
            let py = height * (pocket.position.y / World.SIZE);

            this.context.fillStyle = 'rgb(255, 255, 255)';
            this.context.fillRect(x_pos + px - 2, y_pos + py - 2, 4, 4);
        }

        for(var i in this.world.players){
            let player = this.world.players[i];

            let px = width * (player.position.x / World.SIZE);
            let py = height * (player.position.y / World.SIZE);

            this.context.fillStyle = 'rgb(' + player.color.r + ',' + player.color.g + ',' + player.color.b + ')';
            this.context.fillRect(x_pos + px - 2, y_pos + py - 2, 4, 4);
        }

        this.context.restore();
    }
}

export default Client;