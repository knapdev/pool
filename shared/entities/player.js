'use strict';

import Vector2 from '../math/vector2.js';
import Utils from '../math/utils.js';

class Player{
    static RADIUS = 16;
    static CHARGE_RATE = 1.25;

    constructor(uuid, world, name, position){
        this.uuid = uuid;
        this.world = world;

        this.name = name;
        //this.color = color;
        this.score = 0;

        this.position = position;
        this.velocity = new Vector2();

        this.charge = 0;
        this.angle = 0; // radians

        this.isMoving = false;
        this.isCharging = false;

        this.attacker = null;
    }

    tick(delta){

        if(this.isCharging){
            this.charge += Player.CHARGE_RATE * delta;
            this.charge = Utils.clamp(this.charge, 0.0, 1.0);
        }
        
        //friction
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;

        if(this.velocity.magnitude() < 0.5){
            this.velocity.set(0, 0);
            this.isMoving = false;
        }

        this.position.add(this.velocity);

        for(let p in this.world.players){
            let other = this.world.players[p];
            if(other.uuid === this.uuid) continue;
            this.resolveCollision(other);
        }

        for(let p in this.world.pockets){
            let other = this.world.pockets[p];
            //console.log(other);
            //console.log(this.position);
            let dist = this.position.distance(other.position);
            //at 36 distance and above, gravity scale = 0
            //at 0 distance, gravity scale = 1
            //console.log(dist);
            let s = 1 - (dist / 42);
            if(s > 0){
                //console.log(s);
                let dir = this.position.clone().sub(other.position).normalize();
                let vel = dir.mult(new Vector2(s * 4, s * 4));
                this.velocity.sub(new Vector2(vel.x, vel.y));

                if(dist <= 4){
                    this.setVelocity(new Vector2());
                    this.position.set(other.position.x, other.position.y);

                    if(this.attacker !== null){
                        this.world.increaseScore(this.attacker);
                    }
                    this.world.respawnPlayer(this.uuid);
                    this.world.resetPocket(other.uuid);
                }
            }
        }
    }

    setVelocity(vel){
        this.velocity.x = vel.x;
        this.velocity.y = vel.y;
        this.isMoving = true;
    }

    setAngle(angle){
        this.angle = angle;
    }

    resolveCollision(other){
        let dist = this.position.distance(other.position);       
        if(dist < (Player.RADIUS * 2)){
            //correction
            let overlap = ((dist) - (Player.RADIUS * 2)) * 0.5;
            let norm = this.position.clone().sub(other.position);
            let correction = norm.clone().normalize().mult(new Vector2(overlap, overlap));
            other.position = other.position.add(correction);
            this.position = this.position.sub(correction);

            //get unit normal vector
            let unitNorm = norm.clone().normalize();

            //get unit tangent vector
            let unitTang = new Vector2(-unitNorm.y, unitNorm.x);

            // //project velocities
            let norm1 = unitNorm.clone().dot(this.velocity);
            let tang1 = unitTang.clone().dot(this.velocity);
            let norm2 = unitNorm.clone().dot(other.velocity);
            let tang2 = unitTang.clone().dot(other.velocity);

            //convert scalars into vectors
            let norm1Final = unitNorm.clone().mult(new Vector2(norm2, norm2));
            let tang1Final = unitTang.clone().mult(new Vector2(tang1, tang1));
            let norm2Final = unitNorm.clone().mult(new Vector2(norm1, norm1));
            let tang2Final = unitTang.clone().mult(new Vector2(tang2, tang2));

            // //update velocities
            this.setVelocity(norm1Final.add(tang1Final));
            other.setVelocity(norm2Final.sub(tang2Final));

            this.attacker = other.uuid;
            other.attacker = this.uuid;
        }
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
            angle: this.angle,
            attacker: this.attacker
        };
        return pack;
    }

    unpack(pack){
        this.uuid = pack.uuid;
        this.name = pack.name;
        this.position.set(pack.position.x, pack.position.y);
        this.velocity.set(pack.velocity.x, pack.position.y);
        this.angle = pack.angle;
        this.attacker = pack.attacker;
    }
}

export default Player;