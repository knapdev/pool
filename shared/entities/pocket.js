'use strict';

import Vector2 from '../math/vector2.js';
import Entity from '../entities/entity.js';

class Pocket extends Entity{
    constructor(uuid, world, position){
        super(uuid, world, position);

        this.radius = Entity.POCKET_RADIUS;
    }

    pack(){
        return {
            uuid: this.uuid,
            position: {
                x: this.position.x,
                y: this.position.y
            },
        }
    }

    unpack(pack){
        this.uuid = pack.uuid;
        this.position.set(pack.position.x, pack.position.y);
    }
}

export default Pocket;