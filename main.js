console.log(`JS file loaded!`);

const canvas= document.getElementById('canvas');
const ctx= canvas.getContext('2d');
const new_button= document.getElementById('new_button');
const auto_button= document.getElementById('auto_button');
const throw_button= document.getElementById('throw_button');

//ratio: 2:1
canvas.width=  2000;
canvas.height= 1000;

const ball_radius= 30;
const gravity= 1;
const fps= 60, dt= Math.ceil(1000/fps);
const collision_loss= 0.9;
const friction= 0.95;

//draw rules
const show_trail= false;

const thickness_ball_border= 5;
const color_ball_border= `rgb(0, 0, 0)`;
const color_ball_inner= `rgba(255, 149, 0, 1)`;


function draw_circle(x,y,r,col_inner,col_border,thickness){
    ctx.fillStyle=`black`;

    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);

    ctx.fillStyle= col_inner;
    ctx.fill();
    ctx.lineWidth= thickness;
    ctx.strokeStyle= col_border;
    ctx.stroke();
}

function draw_line(x1,y1,x2,y2,col,width){
    ctx.strokeStyle= col;
    ctx.lineWidth= width;

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function draw_text(x,y,text,size){
    ctx.font= `${size}px Arial`;
    ctx.fillStyle=`black`;
    ctx.fillText(text,x,y);
}

function clear_canvas(){
    ctx.fillStyle=`white`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

class Ball{
    constructor(x, y, sx, sy, wait=false){
        this.x= x;
        this.y= y;
        this.s_x= sx;
        this.s_y= sy;
        this.wait= wait;
    }

    draw(){
        draw_circle(this.x, this.y, ball_radius,color_ball_inner,color_ball_border,thickness_ball_border);
    }

    update(){
        if (this.wait)
            return;
        this.x+=this.s_x;
        this.y+=this.s_y;

        this.s_y+=gravity;

        if (this.y+ball_radius>canvas.height && this.s_y>0){
            this.s_y= -(this.s_y-gravity)*collision_loss;
            this.s_x= this.s_x*friction;
        }

        if (this.x+ball_radius>canvas.width && this.s_x>0){
            this.s_x= -this.s_x*collision_loss;
            this.s_y= this.s_y*friction;
        }

        if (this.x-ball_radius<0 && this.s_x<0){
            this.s_x= -this.s_x*collision_loss;
            this.s_y= this.s_y*friction;
        }
    }

    collision_circle(other){
        let dist= Math.sqrt(Math.pow((this.x-other.x))+Math.pow(this.y-other.y));
        return dist<=ball_radius*2;
    }
}

let obj_list=[];

new_button.onclick= ()=>{
    obj_list.push(new Ball(1000,500,(Math.floor(Math.random()*10)+1)*((Math.floor(Math.random()*2)===0)?1:-1),0));
};

let waiting_ball= [];
throw_button.onclick= ()=>{
    let _new= new Ball(Math.floor(Math.random()*1150+750), 700, 0, 0, true);
    waiting_ball.push(_new);
    obj_list.push(_new);
};


let spawning_interval_id= null;
auto_button.onclick= ()=>{
    if (spawning_interval_id!=null){
        clearInterval(spawning_interval_id);
        spawning_interval_id= null;
    }
    else{
        obj_list.push(new Ball(1000,500,(Math.floor(Math.random()*10)+1)*((Math.floor(Math.random()*2)===0)?1:-1),0));
        spawning_interval_id= setInterval(()=>{
            obj_list.push(new Ball(1000,500,(Math.floor(Math.random()*10)+1)*((Math.floor(Math.random()*2)===0)?1:-1),0));
        },dt*5);
    }
};

function sleep(ms){
    return new Promise(result => setTimeout(result,ms));
}

let mouse_x= 0, mouse_y= 0, testX=0, testY=0;

async function run(){
    while (true){
        let t_start= Date.now();

        if (!show_trail)
            clear_canvas();

        for (let id=0; id<obj_list.length; id++)
            obj_list[id].update();

        for (let id=0; id<obj_list.length; id++)
            obj_list[id].draw();

        draw_line(0, 500, 100, 500, 'black', 10);

        sleeptime= dt-Date.now()+t_start;
        if (sleeptime>0)
            await sleep(sleeptime);
    }
};

run();

canvas.addEventListener('mousemove', (event)=>{
    const rect= canvas.getBoundingClientRect();
    mouse_x= (event.clientX-rect.left)*2-20,
    mouse_y= (event.clientY-rect.top)*2-10;
});

canvas.addEventListener('mousedown', (event)=>{

    for (const obj of waiting_ball){
        obj.s_x= Math.min(Math.max(Math.trunc((mouse_x-obj.x)/10),-30), 30);
        obj.s_y= Math.min(Math.max(Math.trunc((mouse_y-obj.y)/10),-40), 40);
        obj.wait= false;
    }
    waiting_ball.length= 0;
});