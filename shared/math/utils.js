'use strict';

import Vector2 from './vector2.js';

class Utils{
    constructor(){
    }

    static degToRad(deg){
        return deg * (Math.PI / 180.0);
    }

    static radToDeg(rad){
        return rad * (180.0 / Math.PI);
    }

    static lerp(start, end, percent){
        return (start + percent * (end - start));
    }

    static clamp(num, min, max){
		return Math.min(Math.max(num, min), max);
	}

    static getRandomPosition(collection, radius, size){
        let rX = (radius * 2) + (Math.random() * size) - (radius * 4);
        let rY = (radius * 2) + (Math.random() * size) - (radius * 4);
        let pos = new Vector2(rX, rY);
        let canSpawn = false;
        while(canSpawn === false){
            for(let j in collection){
                let other = collection[j];
                let dist = pos.distance(other.position);
                if(dist < radius*2 + 8){
                    rX = (radius * 2) + (Math.random() * size) - (radius * 4);
                    rY = (radius * 2) + (Math.random() * size) - (radius * 4);
                    pos = new Vector2(rX, rY);
                    break;
                }
            }
            canSpawn = true;
        }
        return pos;
    }
}

export default Utils;