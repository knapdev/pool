'use strict';

class Vector2 {
	constructor(x, y){
		this._x = x || 0;
		this._y = y || 0;
	}

	get x(){
		return this._x;
	}

	set x(val){
		this._x = val;
	}

	get y(){
		return this._y;
	}

	set y(val){
		this._y = val;
	}

	set(x, y){
		this.x = x;
		this.y = y;

		return this;
	}

	add(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	}

	sub(v){
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}

	mult(v){
		this.x *= v.x;
		this.y *= v.y;

		return this;
	}

	div(v){
		this.x /= v.x;
		this.y /= v.y;

		return this;
	}

	magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	distance(other){
		return Math.sqrt(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2));
	}

	normalize(){
		let mag = this.magnitude();
		return this.div(new Vector2(mag, mag));
	}

	clone(){
		return new Vector2(this.x, this.y);
	}
}

export default Vector2