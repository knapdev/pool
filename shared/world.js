'use strict';

class World{

    static SIZE = 1000;

    constructor(){

        this.players = {};
        this.pockets = {};

        this.onRespawnPlayerCallbacks = [];
        this.onResetPocketCallbacks = [];
        this.onIncreaseScoreCallbacks = [];
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

    addPocket(pocket){
        if(this.pockets[pocket.uuid] == undefined){
            this.pockets[pocket.uuid] = pocket;
            return true;
        }

        return false;
    }

    removePockets(uuid){
        if(this.pockets[uuid]){
            delete this.pockets[uuid];
            return true;
        }
        
        return false;
    }

    getPlayer(uuid){
        return this.players[uuid];
    }

    getPocket(uuid){
        return this.pockets[uuid];
    }

    respawnPlayer(uuid){
        let player = this.getPlayer(uuid);
        player.position.set((Math.random() * 1000) - 500, (Math.random() * 1000) - 500);
        player.attacker = null;
        
        for(let i = 0; i < this.onRespawnPlayerCallbacks.length; i++){
			this.onRespawnPlayerCallbacks[i](uuid);
		}
    }

    resetPocket(uuid){
        this.pockets[uuid].position.set((Math.random() * 1000) - 500, (Math.random() * 1000) - 500);

        for(let i = 0; i < this.onResetPocketCallbacks.length; i++){
			this.onResetPocketCallbacks[i](uuid);
		}
    }

    increaseScore(uuid){
        let player = this.getPlayer(uuid);
        player.score++;

        for(let i = 0; i < this.onIncreaseScoreCallbacks.length; i++){
			this.onIncreaseScoreCallbacks[i](uuid, player.score);
		}
    }


    registerOnRespawnPlayerCallback(callback){
		this.onRespawnPlayerCallbacks.push(callback);
	}
	unregisterOnRespawnPlayerCallback(callback){
		this.onRespawnPlayerCallbacks.remove(callback);
	}

    registerOnResetPocketCallback(callback){
		this.onResetPocketCallbacks.push(callback);
	}
	unregisterOnResetPocketCallback(callback){
		this.onResetPocketCallbacks.remove(callback);
	}

    registerOnIncreaseScoreCallback(callback){
		this.onIncreaseScoreCallbacks.push(callback);
	}
	unregisterOnIncreaseScoreCallback(callback){
		this.onIncreaseScoreCallbacks.remove(callback);
	}
}

export default World;