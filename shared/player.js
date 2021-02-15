'use strict';

import Vector2 from './math/vector2.js';

class Player{
    static RADIUS = 16;

    constructor(uuid, name, position){
        this.uuid = uuid;
        this.name = name;
        //this.color = color;

        this.position = position;
        this.velocity = new Vector2();

        this.angle = 0; // radians
    }

    tick(delta){
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;

        if(this.velocity.magnitude() < 0.01){
            this.velocity.set(0, 0);
        }

        let vel = this.velocity.clone();
        vel.x *= delta;
        vel.y *= delta;
        this.position.add(this.velocity);
    }

    setVelocity(vel){
        this.velocity.x = vel.x;
        this.velocity.y = vel.y;
    }

    setAngle(angle){
        this.angle = angle;
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