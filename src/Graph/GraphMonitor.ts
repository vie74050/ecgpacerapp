import { IGraphOptions } from "../Interfaces";
import { nX } from "../UI/DisplayPanel";

/** Creates canvas graph. */
export class GraphMonitor {
    CANVAS_ID: string;
    CANVAS: HTMLCanvasElement;
    CTX: CanvasRenderingContext2D;
    GETY: Function;

    x: number;
    continueAnimation: boolean;

    //defaults
    HEIGHT: number = 200;
    WIDTH: number = 600;
    LINE_COLOUR: string = "#22ff22ff";
    nDIVX: number = 10;

    constructor(canvasId: string, opts?: IGraphOptions) {
        this.CANVAS_ID = canvasId;
        this.HEIGHT = opts?.HEIGHT ? opts.HEIGHT : this.HEIGHT;
        this.WIDTH = opts?.WIDTH ? opts.WIDTH : this.WIDTH;
        this.LINE_COLOUR = opts?.LINE_COLOUR ? opts.LINE_COLOUR : this.LINE_COLOUR;
        this.GETY = opts?.GETY ? opts?.GETY : Pulse;
        this.nDIVX = opts?.nDIVX ? Number(opts?.nDIVX) : Number(nX.value);

        let canvas = document.getElementById(this.CANVAS_ID) as HTMLCanvasElement;
        let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        
        this.CANVAS = canvas;
        this.CTX = ctx;
        this.x = -1;
        this.continueAnimation = false;
          
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT + 10; // for xaxis
        canvas.setAttribute("style", "width:"+this.WIDTH + "px; " + "height:"+this.HEIGHT+"px");

        window.addEventListener('playpause', this.playPause);
        nX.addEventListener("change", this.updatenX); 
        
        this.init(); 
    }

    private init = () => {
        //console.log(this.context);
        this.drawAxis(this.nDIVX);
        this.continueAnimation = true;
        this.animate();
    };

    private drawAxis(numDivX: number = 10) {
        let ctx = this.CTX, w = this.WIDTH, h = this.HEIGHT, canvh = this.CANVAS.height;
        let dx = w / numDivX;

        //console.log(w,numDivX,dx);
        ctx.clearRect(0, 0, w, canvh);
        ctx.moveTo(0.5, canvh + 0.5);
        ctx.strokeStyle = "#ffffff";
        // ticks
        for (let x = 0; x <= numDivX; x++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(x * dx, canvh - 5);
            ctx.lineTo(x * dx, canvh);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.moveTo(-1, h / 2);
    }

    private animate = () => {
        const width = this.WIDTH;
        const height = this.HEIGHT;
        const line_w = 0.02;
        const ctx = this.CTX;
        const x = this.x;
        const y = this.GetYatX(x);

        if (this.continueAnimation) {
            requestAnimationFrame(this.animate);
        }

        if (x % width == 0) {
            ctx.beginPath();
            ctx.moveTo(0.5, y + 0.5);
        } else if (x % width == width - 1) {
            ctx.closePath();
            ctx.clearRect(0, 0, width, height + 0.5);
        } else {
            ctx.lineTo(x % width, y);
            ctx.lineWidth = line_w;
            ctx.strokeStyle = this.LINE_COLOUR;
            ctx.stroke();
        }
        this.x++;
    };

    get X(): number { return this.x; }
    set X(x: number) { this.x = x; }
    set Y(fn: (x: number) => {}) { this.GETY = fn; }
    set nX(n: number) { this.nDIVX = n; this.drawAxis(n); }

    playPause = () => {
        //console.log("pp");
        this.continueAnimation = !this.continueAnimation;
        if (this.continueAnimation) {
            requestAnimationFrame(this.animate);
        }
    };

    updatenX = () => {
        this.nX = Number(nX.value);
        this.X = -1; 
        //console.log(nX);
    };

    GetYatX = (x: number): number => { return this.GETY(x); };

    Label = (s: string, x: number, y: number, size?:number ) => {
        const ctx = this.CTX;
        ctx.font = typeof size !== 'undefined'? size+"px Arial" : "9px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(s, x, y);
    }
}

//** GRAPHING Helper Fns ****************************************************//

export function Pulse(t: number, x: number, a: number, w: number): number {
    return -a * Math.exp(-0.5 * Math.pow((t - x) / w, 2));
}