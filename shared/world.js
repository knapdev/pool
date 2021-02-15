'use strict';

class World{

    static SIZE = 1000;

    constructor(){

        this.players = {};
    }

    tick(delta){
        for(let p in this.players){
            let player = this.players[p];

            player.tick(delta);
        }
    }

    addPlayer(player){
        if(this.players[player.uuid] == undefined){
            this.players[player.uuid] = player;
            return true;
        }

        return false;
    }

    removePlayer(uuid){
        if(this.players[uuid]){
            delete this.players[uuid];
            return true;
        }
        
        return false;
    }

    getPlayer(uuid){
        return this.players[uuid];
    }
}

export default World;