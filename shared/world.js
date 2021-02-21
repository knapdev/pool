'use strict';

class World{

    static SIZE = 1000;

    constructor(){

        this.players = {};
        this.pockets = {};

        this.onRespawnPlayerCallbacks = [];
        this.onResetPocketCallbacks = [];
        this.onSetScoreCallbacks = [];
        this.onUpdateLeaderboardCallbacks = [];
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

    setScore(uuid, score){
        let player = this.getPlayer(uuid);
        player.score = score;

        for(let i = 0; i < this.onSetScoreCallbacks.length; i++){
			this.onSetScoreCallbacks[i](uuid, player.score);
		}
    }

    updateLeaderboard(){
        for(let i = 0; i < this.onUpdateLeaderboardCallbacks.length; i++){
			this.onUpdateLeaderboardCallbacks[i]();
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

    registerOnSetScoreCallback(callback){
		this.onSetScoreCallbacks.push(callback);
	}
	unregisterOnSetScoreCallback(callback){
		this.onSetScoreCallbacks.remove(callback);
	}

    registerOnUpdateLeaderboardCallback(callback){
		this.onUpdateLeaderboardCallbacks.push(callback);
	}
	unregisterOnUpdateLeaderboardCallback(callback){
		this.onUpdateLeaderboardCallbacks.remove(callback);
	}
}

export default World;