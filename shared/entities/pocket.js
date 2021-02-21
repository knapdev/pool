'use strict';

import Vector2 from '../math/vector2.js';

class Pocket{
    static RADIUS = 20;

    constructor(uuid, position){
        this.uuid = uuid;
        this.position = position;
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