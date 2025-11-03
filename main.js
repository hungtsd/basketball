console.log(`JS file loaded!`);

const canvas= document.getElementById("canvas");
const ctx= canvas.getContext("2d");
const new_button= document.getElementById("new_button");
const auto_button= document.getElementById("auto_button");

//ratio: 2:1
canvas.height= 1000;
canvas.width=  2000;

const ball_radius= 30;
const gravity= 1;
const fps= 60, dt= Math.floor(1000/fps);
const collision_loss= 1;
const friction= 1;

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
    constructor(x,y){

        this.x= x;
        this.y= y;
        this.s_x= (Math.floor(Math.random()*10)+1)*((Math.floor(Math.random()*2)===0)?1:-1);
        this.s_y= 0;
    }

    draw(){
        draw_circle(this.x, this.y, ball_radius,color_ball_inner,color_ball_border,thickness_ball_border);
    }

    update(){
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
    obj_list.push(new Ball(1000,500));
};


let spawning_interval_id= null;
auto_button.onclick= ()=>{
    if (spawning_interval_id!=null){
        clearInterval(spawning_interval_id);
        spawning_interval_id= null;
    }
    else{
        obj_list.push(new Ball(1000,500));
        spawning_interval_id= setInterval(()=>{
            obj_list.push(new Ball(1000,500));
        },dt);
    }
};

function sleep(ms){
    return new Promise(result => setTimeout(result,ms));
}

let frame_count=0, current_fps= 0;
let last_frame_count=0, last_dt= dt, sleeptime= 0;

async function run(){
    while (true){
        let t_start= Date.now();

        frame_count++;

        if (!show_trail)
            clear_canvas();

        for (let id=0; id<obj_list.length; id++)
            obj_list[id].update();

        for (let id=0; id<obj_list.length; id++)
            obj_list[id].draw();

        let splitid= 200;
        for (let id1=0; id1<splitid; id1++){
            for (let id2=splitid; id2<obj_list.length; id2++)
                obj_list[id1].collision_circle(obj_list[id2]);
        }

        draw_text(20,30,`FPS: ${current_fps}, Entity count: ${obj_list.length}`,30);
        draw_text(20,70,`Data: ${last_frame_count}, ${last_dt}, ${sleeptime}`);

        sleeptime= dt-Date.now()+t_start;
        if (sleeptime>0)
            await sleep(sleeptime);
    }
};

let time_last= Date.now();

setInterval(()=>{
    let time_now= Date.now();
    current_fps= Math.floor(frame_count*1000/(time_now-time_last));
    
    last_frame_count= frame_count;
    last_dt= time_now-time_last;

    time_last= time_now;
    frame_count= 0;
},500);


run();
