'use strict';

import Vector2 from './math/vector2.js';

class Player{
    static RADIUS = 16;

    constructor(uuid, world, name, position){
        this.uuid = uuid;
        this.world = world;

        this.name = name;
        //this.color = color;

        this.position = position;
        this.velocity = new Vector2();

        this.angle = 0; // radians

        this.isMoving = false;
    }

    tick(delta){

        for(let p in this.world.players){
            let other = this.world.players[p];
            if(other.uuid === this.uuid) continue;
            if(this.checkCollision(other)){
                
            }
        }
        
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;

        if(this.velocity.magnitude() < 0.5){
            this.velocity.set(0, 0);
            this.isMoving = false;
        }

        let vel = this.velocity.clone();
        vel.x *= delta;
        vel.y *= delta;
        this.position.add(this.velocity);
    }

    setVelocity(vel){
        this.velocity.x = vel.x;
        this.velocity.y = vel.y;
        this.isMoving = true;
    }

    setAngle(angle){
        this.angle = angle;
    }

    checkOverlap(other){
        let totalRadius = Player.RADIUS * 2;
        let dist = this.position.distance(other.position);
        if(dist < totalRadius){
            return true;
        }
        
        return false;
    }

    checkCollision(other){
        // get distance between players
        let dir = this.position.clone().sub(other.position);
        let mag = dir.magnitude();
        let totalRadius = Player.RADIUS * 2;
        if(mag < totalRadius){
            // correction
            let distanceCorrection = (totalRadius - mag) / 2.0;
            let d = dir.clone();
            let correctionVector = d.normalize().mult(new Vector2(distanceCorrection, distanceCorrection));
            other.position = other.position.sub(correctionVector);
            this.position = this.position.add(correctionVector);
            
            return true;
        }

        return false;
    }

    pack(){
        let pack = {
            uuid: this.uuid,
            name: this.name,
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y
            },
            angle: this.angle
        };
        return pack;
    }

    unpack(pack){
        this.uuid = pack.uuid;
        this.name = pack.name;
        this.position.set(pack.position.x, pack.position.y);
        this.velocity.set(pack.velocity.x, pack.position.y);
        this.angle = pack.angle;
    }
}

export default Player;