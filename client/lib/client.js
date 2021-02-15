'use strict';

class Client{
    constructor(config){
        this.canvas = null;
        this.context = null;
        this.scale = 1;
        this.bgColor = 'rgb(137, 196, 158)';

        this.then = 0;
        this.unprocessed = 0;
        this.ticks = 0;
        this.frameID = null;

        this.init();
    }

    init(){
        this.createCanvas();
        window.addEventListener('resize', (evnt) => {
            this.resize();
        });
    }

    start(){
        this.then = performance.now();
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    run(now){
        let delta = (now - this.then) / 1000.0;
        
        let ticksThisFrame = 0;
        this.unprocessed += delta;
        while(this.unprocessed > (1000.0 / 20.0) / 1000.0){

            this.tick((1000.0 / 20.0) / 1000.0); //20/sec
            this.unprocessed -= (1000.0 / 20.0) / 1000.0;

            this.ticks++;
            ticksThisFrame++;
            if(ticksThisFrame >= 240){
                console.error('PANIC! Spiral of death.');
                this.unprocessed = 0;
                break;
            }
        }

        this.update(delta);
        this.draw();

        this.then = now;
        this.frameID = requestAnimationFrame(this.run.bind(this));
    }

    tick(delta){
    }

    update(delta){
    }

    draw(){
        this.clearCanvas();
    }

    createCanvas(){
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.resize();

        this.context = this.canvas.getContext('2d');
    }

    clearCanvas(){
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize(){
        let w = window.innerWidth;
        let h = window.innerHeight;
    
        if(this.canvas.width !== w/this.scale || this.canvas.height !== h/this.scale){
            this.canvas.width = w/this.scale;
            this.canvas.height = h/this.scale;
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
        }
    }
}

export default Client;