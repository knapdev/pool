'use strict';

import Utils from '../shared/math/utils.js';
import Vector2 from '../shared/math/vector2.js';
import Entity from '../shared/entities/entity.js';
import Player from '../shared/entities/player.js';
import Pocket from '../shared/entities/pocket.js';

class World{

    static SIZE = 5000;

    constructor(){

        this.players = {};
        this.pockets = {};

        this.onRespawnPlayerCallbacks = [];
        this.onResetPocketCallbacks = [];
        this.onSetScoreCallbacks = [];
        this.onUpdateLeaderboardCallbacks = [];
        this.onPlaySoundCallbacks = [];
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

    getRandomPlayerPosition(){
        let collection = [];
        for(let p in this.player){
            collection.push(this.players[p]);
        }
        for(let p in this.pockets){
            collection.push(this.pockets[p]);
        }
        return this.getRandomPosition(collection, Entity.PLAYER_RADIUS);
    }

    getRandomPocketPosition(){
        let collection = [];
        for(let p in this.player){
            collection.push(this.players[p]);
        }
        for(let p in this.pockets){
            collection.push(this.pockets[p]);
        }
        return this.getRandomPosition(collection, Entity.POCKET_RADIUS);
    }

    getRandomPosition(collection, radius){
        let rX = (radius * 2) + (Math.random() * World.SIZE) - (radius * 4);
        let rY = (radius * 2) + (Math.random() * World.SIZE) - (radius * 4);
        let pos = new Vector2(rX, rY);
        let canSpawn = false;
        while(canSpawn === false){
            for(let j in collection){
                let other = collection[j];
                let otherRadius = other.radius;
                let dist = pos.distance(other.position);
                if(dist < (radius + otherRadius) + 8){
                    rX = (radius * 2) + (Math.random() * World.SIZE) - (radius * 4);
                    rY = (radius * 2) + (Math.random() * World.SIZE) - (radius * 4);
                    pos = new Vector2(rX, rY);
                    break;
                }
            }
            canSpawn = true;
        }
        return pos;
    }

    respawnPlayer(uuid){
        let player = this.getPlayer(uuid);
        let pos = this.getRandomPlayerPosition();
        player.position.set(pos.x, pos.y);
        player.attacker = null;
        
        for(let i = 0; i < this.onRespawnPlayerCallbacks.length; i++){
			this.onRespawnPlayerCallbacks[i](uuid);
		}
    }

    resetPocket(uuid){
        let pos = this.getRandomPocketPosition();
        this.pockets[uuid].position.set(pos.x, pos.y);

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

    playSound(id, pos){
        for(let i = 0; i < this.onPlaySoundCallbacks.length; i++){
			this.onPlaySoundCallbacks[i](id, pos);
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

    registerOnPlaySoundCallback(callback){
		this.onPlaySoundCallbacks.push(callback);
	}
	unregisterOnPlaySoundCallback(callback){
		this.onPlaySoundCallbacks.remove(callback);
	}
}

export default World;