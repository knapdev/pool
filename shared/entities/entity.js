'use strict';

class Entity{
    static PLAYER_RADIUS = 20;
    static POCKET_RADIUS = 24;

    constructor(uuid, world, position){
        this.uuid = uuid;
        this.world = world;
        this.position = position;
        this.radius = 0;
    }
}

export default Entity;