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
        
        //friction
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;

        if(this.velocity.magnitude() < 0.5){
            this.velocity.set(0, 0);
            this.isMoving = false;
        }

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

    // checkOverlap(other){
    //     let totalRadius = Player.RADIUS * 2;
    //     let dist = this.position.distance(other.position);
    //     if(dist < totalRadius){
    //         return true;
    //     }
        
    //     return false;
    // }

    checkCollision(other){
        //console.log('hmm');
        // get distance between players
        let norm = this.position.clone().sub(other.position);
        let mag = norm.magnitude();
        let totalRadius = Player.RADIUS * 2;
        if(mag < totalRadius){
            console.log('collision');
            // correction
            let distanceCorrection = (totalRadius - mag) / 2.0;
            let d = norm.clone();
            let correctionVector = d.normalize().mult(new Vector2(distanceCorrection, distanceCorrection));
            other.position = other.position.sub(correctionVector);
            this.position = this.position.add(correctionVector);

            // //get unit normal vector
            // let uNorm = norm.clone().normalize();
            // //get unit tanget
            // let uTang = new Vector2(-uNorm.y, uNorm.x);

            // console.log(uNorm);

            // console.log(this.velocity);

            // //project velocity into normal and tangential component
            // let norm1 = uNorm.clone().dot(this.velocity);
            // let tang1 = uTang.clone().dot(this.velocity);
            // let norm2 = uNorm.clone().dot(other.velocity);
            // let tang2 = uTang.clone().dot(other.velocity);

            // console.log(norm1);
            // console.log(tang1);
            // console.log(norm2);
            // console.log(tang2);

            // //get new normal velocities
            // let norm1Final = norm2;
            // let norm2Final = norm1;

            // //convert scalar normal & tangential velocities
            // norm1Final = uNorm.clone().mult(norm1Final);
            // let tang1Final = uTang.clone().mult(tang1);
            // norm2Final = uNorm.clone().mult(norm2Final);
            // let tang2Final = uTang.clone().mult(tang2);

            // console.log(norm1Final);

            // //update velocity
            // this.velocity = norm1Final.clone().add(tang1Final);
            // other.velocity = norm2Final.clone().add(tang2Final);

            // //console.log(this.velocity);

            // this.isMoving = true;
            // other.isMoving = true;
                        
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