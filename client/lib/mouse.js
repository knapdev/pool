'use strict';

class Mouse {
	constructor(){
		window.addEventListener('contextmenu', (evnt) => {
            evnt.preventDefault();
            return false;
        });

		this.Button = {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2,

			COUNT: 3
        };
		
		this.buttonsDown = [];
		this.buttonsUp = [];
		this.buttonsHeld = [];
		this.buttonsLast = [];

		this.pos = {
            x: 0,
            y: 0
        };

		this.delta = {
			x: 0,
			y: 0
		};

		for(let i = 0; i < this.Button.COUNT; i++){
			this.buttonsDown[i] = false;
			this.buttonsUp[i] = false;
			this.buttonsHeld[i] = false;
			this.buttonsLast[i] = false;
		}

		this._update = function(){
			for(var i = 0; i < this.Button.COUNT; i++){
				this.buttonsDown[i] = (!this.buttonsLast[i]) && this.buttonsHeld[i];
				this.buttonsUp[i] = this.buttonsLast[i] && (!this.buttonsHeld[i]);
				this.buttonsLast[i] = this.buttonsHeld[i];
			}
			this.delta.x = 0;
			this.delta.y = 0;
		};

		this._onMouseDown = function(evnt){
			evnt.preventDefault();
			this.buttonsHeld[evnt.button] = true;
		};

		this._onMouseUp = function(evnt){
			this.buttonsHeld[evnt.button] = false;
        };

        this._onMouseMove = function(evnt){
            this.pos.x = evnt.clientX;
			this.pos.y = evnt.clientY;
			this.delta.x = evnt.movementX;
			this.delta.y = evnt.movementY;
        };
        
        this._init = function(){
            let canvas = document.getElementById('canvas');
            canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
            canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
            canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        };
    }    

	getButton(buttonId){
		return this.buttonsHeld[buttonId];
	}

	getButtonDown(buttonId){
		return this.buttonsDown[buttonId];
	}

	getButtonUp(buttonId){
		return this.buttonsUp[buttonId];
	}
	
	getMovement(){
		return this.delta.x !== 0 || this.delta.y !== 0;
	}
    
    getPos(){
        return this.pos;
    }
}

const instance = new Mouse();
Object.freeze(instance);

export default instance;