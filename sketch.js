var cloth;
let lmb_down = false;
let shift_down = false;

w = 300;
h = 300;

rows = 15;
cols = 15;
size = 5;

last_interaction = 0;
max_idle_time = 5;
let slider;
function setup() {
    slider = createSlider(2, 25, 5,1);
    rows = cols = slider.value();
    size = w/(rows*2);
    slider.position(10, 10);
    slider.style('width', '80px');

    var canvas = createCanvas(w, h, WEBGL);
    canvas.parent('sketch-holder');
    canvas.style('display', 'flex');
    cloth = new Cloth(rows, cols,size,createVector(0,0,0));

    
}
function windowResized() {
    resizeCanvas(w, h);
}

function draw(){
    
    val = slider.value();
    if(rows != cols || rows != val){
        rows = cols = val;
        size = w/(rows*2);
        cloth = new Cloth(rows, cols,size,createVector(0,0,0));
    }
    background(255);
    //Calculate dt
    //Draw square at top left
    let dt = 1.0/60.0;
    last_interaction += dt;
    if(last_interaction > max_idle_time){
        last_interaction = 0;
        //cloth.applyRandomForce();
    }
    cloth.update(dt);
    cloth.render();
}
function mouseReleased(event){
    lmb_down = event.button == 0;
    cloth.release();
}
function mousePressed(event){
    if(shift_down){return;}
    last_interaction = 0;
    lmb_down = event.button == 0;
    let x = mouseX - w/2;
    let y = mouseY - h/2;
    cloth.grab(createVector(x,y,0));
}
function mouseDragged(event){
    if(!shift_down){return;}
    last_interaction = 0;
    let x = mouseX - w/2;
    let y = mouseY - h/2;
    cloth.removeAt(createVector(x,y,0));
}

function keyPressed(event){
    // if R is pressed, reset the cloth
    if(event.key == 'r'){
        last_interaction = 0;
        cloth = new Cloth(rows, cols,size,createVector(0,0,0));
    }
    // if space is pressed
    if(event.key == ' '){
        last_interaction = 0;
        cloth.removeRandom();
    }
    if(event.key == 'Shift'){
        shift_down = true;
    }
}
function keyReleased(event){
    if(event.key == 'Shift'){
        shift_down = false;
    }
}
