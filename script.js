//board
let board;
let boardwidth=360;
let boardheight=640;
let context;

//bird
let birdwidth=34;
let birdheight=24;
let birdx=boardwidth/8;
let birdy=boardheight/2;

//pipe;
let pipewidth=64;
let pipeheight=512;
let pipex=boardwidth;
let pipey=0;
let pipearray=[];

let toppipeimg;
let bottompipeimg;

//game physics
let velocityx=-2;

//bird-dynamics
let velocityup=0;
// let gravitydown=0.4;
function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
let gravitydown = isMobile() ? 0.3 : 0.4;

//game-over
let gameover=false;

let score=0;

let count=0;

let spikenumber=[];
let invsibility=[];
let growshrink=[];
let shield=[];
let movepipe=[];

let spiketopimg;
let spikebottomimg;
let shieldbg;
let invsibilityimg;

let lastJumpTime =0;
const JUMP_COOLDOWN = 200;

let bird = {
    x: birdx,
    y: birdy,
    width: birdwidth,
    height: birdheight
};

let shieldimg;
let isinvisible=false;
let activeshield=false;
let invis=false;

let tempsc=0;
let growsc=0;
let shrinksc=0;
let lastTime = 0;

let shrink=false;
let grow=false;

let wingsound=new Audio("./sfx_wing.wav");
let hitsound=new Audio("./sfx_hit.wav");
let diesound=new Audio("./sfx_die.wav");
let pointsound=new Audio("./sfx_point.wav");
let swooshingsound=new Audio("./sfx_swooshing.wav");

window.onload=function(){
    board=document.getElementById("board");
    board.height=boardheight;
    board.width=boardwidth;
    context=board.getContext("2d");

    birdimg=new Image();
    birdimg.src="./flappybird.png";
    birdimg.onload=function(){
        context.drawImage(birdimg,birdx,birdy,birdwidth,birdheight);
    }

    toppipeimg=new Image();
    toppipeimg.src="./toppipe.png";
    bottompipeimg=new Image();
    bottompipeimg.src="./bottompipe.png";

    spiketopimg=new Image();
    spiketopimg.src="./spikestop.png"
    spikebottomimg=new Image();
    spikebottomimg.src="./spikesbottom.png"

    shieldimg=new Image();
    shieldimg.src="./shield.png";

    shieldbg=new Image();
    shieldbg.src="./shieldbg1.png"

    invsibilityimg=new Image();
    invsibilityimg.src="./invisiblity1.png";

    spikenumber=generateLCGNumbersInIncreasingOrder(50, 1, 100);
    console.log(spikenumber);
    invsibility=generateLCGNumbersInIncreasingOrder(20, 1, 100);
    shield=generateLCGNumbersInIncreasingOrder(20, 1, 100);
    growshrink=generateLCGNumbersInIncreasingOrder(20, 1, 100);
    movepipe=generateLCGNumbersInIncreasingOrder(50, 1, 100);

    requestAnimationFrame(update);
    setInterval(placepipe,1500);
    document.addEventListener("keydown",move);
    board.addEventListener("touchstart", move);
}

function generateLCGNumbersInIncreasingOrder(size, min, max, a = 1664525, c = 1013904223, m = 2 ** 32) {
    let seed = Math.floor(Math.random() * m);
    const randomNumbers = [];
    let current = seed;
    for (let i = 0; i < size; i++) {
        current = (a * current + c) % m;
        const randomNumber = Math.floor((current / m) * (max - min + 1)) + min;
        randomNumbers.push(randomNumber);
    }
    randomNumbers.sort((a, b) => a - b);
    return randomNumbers;
}

function update(currentTime){
    requestAnimationFrame(update);
    if(gameover){
        return;
    }
    context.clearRect(0,0,board.width,board.height);
    velocityup += gravitydown;
    bird.y+=velocityup;
    bird.y=Math.max(bird.y,0);
    if(!grow&&!shrink&&growshrink.includes(score)){
        swooshingsound.play();
        if(Math.random()>0.5){
            grow=true;
            growsc=score;
            bird.width=68;
            bird.height=48;
        }
        else{
            shrink=true;
            shrinksc=score;
            bird.width=17;
            bird.height=12;
        }
    }
    if(grow&&Math.abs(growsc-score)>=3){
        grow=false;
        bird.width=34;
        bird.height=24;
    }
    if(shrink&&Math.abs(shrinksc-score)>=3){
        bird.width=34;
        bird.height=24;
        shrink=false;
    }
    if(activeshield)
        context.drawImage(shieldbg,bird.x-12.5,bird.y-12.5,bird.width+25,bird.height+25);
    context.drawImage(birdimg,bird.x,bird.y,bird.width,bird.height);
    if(bird.y>boardheight){
        gameover=true;
        diesound.play();
    }
    for(let i=0;i<pipearray.length;i++){
        // pipearray[i].x+=velocityx;
        let temp=pipearray[i];
        temp.x+=velocityx;
        if(!invis){
            context.drawImage(temp.img,temp.x,temp.y,temp.width,temp.height);
            if(temp.move&&Math.abs(temp.x-bird.x)>100){
                temp.y+=temp.he;
                temp.sy+=temp.he;
            }
            if(temp.hasspike && Math.abs(temp.x-bird.x)<60)
                context.drawImage(temp.simg,temp.x,temp.sy,temp.width,temp.sheight);
            if(temp.hasshield)
                context.drawImage(shieldimg,temp.x,temp.y+pipeheight+boardheight/8,temp.width,temp.sheight);
            if(temp.hasinvis)
                context.drawImage(invsibilityimg,temp.x+temp.width/2-temp.width/3,temp.y+pipeheight+boardheight/8-temp.width/3,temp.width/1.5,temp.width/1.5);
        }
        else{
            context.globalAlpha = 0.5;
            context.drawImage(temp.img,temp.x,temp.y,temp.width,temp.height);
            if(temp.hasspike && Math.abs(temp.x-bird.x)<60)
                context.drawImage(temp.simg,temp.x,temp.sy,temp.width,temp.sheight);
            if(temp.hasshield)
                context.drawImage(shieldimg,temp.x,temp.y+pipeheight+boardheight/8,temp.width,temp.sheight);
            if(temp.hasinvis)
                context.drawImage(invsibilityimg,temp.x+temp.width/2-temp.width/3,temp.y+pipeheight+boardheight/8-temp.width/3,temp.width/1.5,temp.width/1.5);
            context.globalAlpha = 1.0;
        }
        if(!temp.passed&&bird.x>temp.x+pipewidth){
            score+=0.5
            temp.passed=true;
        }
        let helper={
            x:temp.x,
            y:temp.y+pipeheight+boardheight/8,
            width:temp.width,
            height:temp.sheight
        }
        let helper2={
            x:temp.x+temp.width/2-temp.width/3,
            y:temp.y+pipeheight+boardheight/8-temp.width/3,
            width:temp.width/1.5,
            height:temp.width/1.5
        }
        if(temp.hasshield && detectCollision(bird,helper)){
            activeshield=true;
            temp.hasshield=false;
            pointsound.play();
        }
        if(temp.hasinvis&&detectCollision(bird,helper2)){
            invis=true;
            temp.hasinvis=false;
            tempsc=score;
            pointsound.play();
        }
        if(detectCollision(bird,temp)){
            if(!activeshield && !invis){
                gameover=true;
                hitsound.play();
            }
            if(activeshield && !invis){
                activeshield=false;
                pipearray.splice(i,1);
                i--;
                score+=0.5;
            }
        }
        if(invis&&Math.abs(tempsc-score)==3)
            invis=false;
    }

    while(pipearray.length>0 && pipearray[0].x + pipewidth<0)
        pipearray.shift();

    context.fillStyle = "white";
    context.font="30px sans-serif";
    context.fillText(Math.floor(score), 5, 30);

    if (gameover) {
        context.fillText("GAME OVER", 5, 60);
        context.fillText("PRESS SPACE",5,90);
    }
}

function placepipe(){
    if(gameover){
        return;
    }
    count++;
    let sp=false;
    let sh=false;
    let inn=false;
    let mv=false;
    let h=0.5;
    if(spikenumber.includes(count)){
        sp=true;
        console.log("Spike generated at count:", count);
    }
    if(shield.includes(count)){
        sh=true;
    }
    if(!sh&&invsibility.includes(count))
        inn=true;
    if(movepipe.includes(count)){
        mv=true;
        if(Math.random()<0.5)
            h=-0.5;
    }
    let randomy=pipey-pipeheight/4-Math.random()*(pipeheight/2);
    let openspace=boardheight/4;
    let toppipe={
        img:toppipeimg,
        x:pipex,
        y:randomy,
        width:pipewidth,
        height:pipeheight,
        passed:false,
        hasspike:sp,
        hasshield:sh,
        hasinvis:inn,
        move:mv,
        he:h,
        simg:spiketopimg,
        sheight:boardheight/25,
        sy:randomy+pipeheight
    }
    let bottompipe={
        img:bottompipeimg,
        x:pipex,
        y:randomy+pipeheight+openspace,
        width:pipewidth,
        height:pipeheight,
        passed:false,
        hasspike:sp,
        hasshield:false,
        hasinvis:false,
        move:mv,
        he:h,
        simg:spikebottomimg,
        sheight:boardheight/25,
        sy:randomy+pipeheight+openspace-boardheight/25
    }
    pipearray.push(toppipe);
    pipearray.push(bottompipe);
}

function move(e){
    const isTouch = e.type === "touchstart";
    const isSpaceKey = e.code === "Space";
    if ((isTouch || isSpaceKey) && gameover) {
        bird.y=birdy;
        gameover=false;
        pipearray=[];
        score=0;
        count=0;
        shrink=false;
        grow=false;
        activeshield=false;
        invis=false;
        tempsc=0;
        bird.width=34;
        bird.height=24;
        spikenumber=generateLCGNumbersInIncreasingOrder(50, 1, 100);
        shield=generateLCGNumbersInIncreasingOrder(10, 1, 100);
        invsibility=generateLCGNumbersInIncreasingOrder(10, 1, 100);
        movepipe=generateLCGNumbersInIncreasingOrder(50, 1, 100);
        growshrink=generateLCGNumbersInIncreasingOrder(20, 1, 100);
    }
    if(!gameover && (isTouch || e.code === "ArrowUp")){
        // birdy=birdy+velocityup;
        // velocityup=-6;
        velocityup = e.type === "touchstart" ? -8 : -6;
        wingsound.play();
        lastJumpTime = currentTime;
    }
}

function detectCollision(a, b) {
    if(b.hasspike){
        return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.sy + b.sheight &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.sy;    //a's bottom left corner passes b's top left corner
    }
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
