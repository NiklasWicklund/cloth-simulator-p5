w = 300;
h = 300;

class Cloth {
    constructor(rows,cols,size,center) {
        this.rows = rows;
        this.cols = cols;
        this.size = size;
        this.center = center;
        this.verticesMap = {};
        this.init();
        this.grabbed = null;

        this.angle = createVector(0,0,0);

        this.idle_correction = 0.001; //The threshold for when the cloth is deemed idle
        
    }
    init() {
        for(let r = 0; r < this.rows; r++){
            let fixed = false; //(r == 0); // fix the first row
            for(let c = 0; c < this.cols; c++){
                const id = r * this.cols + c;
                let constraints = [];
                if(c > 0){
                    constraints.push(id-1);
                }
                if(r > 0){
                    constraints.push(id-this.cols);
                }
                if(c < this.cols-1){
                    constraints.push(id+1);
                }
                if(r < this.rows-1){
                    constraints.push(id+this.cols);
                }
                let x = this.center.x + (c - this.cols/2) * this.size;
                let y = this.center.y + (r - this.rows/2) * this.size;
                //Shift some in z direction based on col
                let z = this.center.z;
                  //this.center.z;
                let pos = createVector(x,y,z);
                let v = new Pooint(pos,fixed,constraints);
                this.verticesMap[id] = v;
            }
        }
        //Fix left top and right top
        this.verticesMap[0].fixed = true;
        this.verticesMap[this.cols-1].fixed = true;
    }
    grab(pos){
        this.grabbed = this.closestVertex(pos);
    }
    release(){
        this.grabbed = null;
    }

    closestVertex(pos){
        let closest = null;
        let dist = 10000000;
        let threshold = 10;
        for(let id in this.verticesMap){
            let v = this.verticesMap[id];
            let d = p5.Vector.dist(pos,v.pos);
            if(d < dist && d < threshold){
                closest = id;
                dist = d;
            }
        }
        if(closest != null){
            return closest;
        }
        return null;
    }

    verletIntegration(dt,force){
        let drag = 0.02;
        //Initalize max_vel_diff as max int
        let max_vel_diff = 100000000;
        for(let id in this.verticesMap){
            let v = this.verticesMap[id];
            if(v.fixed){continue;}
            let posCopy = createVector(v.pos.x,v.pos.y,v.pos.z);
            const gravity = createVector(0,981.0,0);
            //apply force to the vertex
            gravity.add(force);
            let acc = p5.Vector.mult(gravity,dt*dt*v.mass);
            let dPos = p5.Vector.sub(v.pos,v.prevPos);
            if(dPos.mag() < max_vel_diff && dPos.mag() > 0.0){
                max_vel_diff = dPos.mag();
            }
            let posTmp = p5.Vector.mult(dPos,1.0-drag);
            let res = p5.Vector.add(posTmp,acc);
            v.pos.add(res);
            v.prevPos = posCopy;
        }
        if(this.grabbed != null){
            let v = this.verticesMap[this.grabbed];
            v.pos.x = mouseX - w/2;
            v.pos.y = mouseY - h/2;
        }
        return max_vel_diff;
    }
    update(dt){
        
        let max_movement = this.verletIntegration(dt,0);
        if(max_movement < this.idle_correction && this.grabbed == null){
            this.applyRandomForce();
        }
        for(let i = 0; i < 4; i++){
            this.satisfyConstraints();
        }

    }

    removeAt(pos){
        let id = this.closestVertex(pos);
        if(id != null){
            this.deleteVertex(id);
        }
    }

    removeRandom(){
        let keys = Object.keys(this.verticesMap);
        let id = keys[Math.floor(Math.random()*keys.length)];
        this.deleteVertex(id);
    }
    deleteVertex(id){
        delete this.verticesMap[id];
    }
    satisfyConstraints(){

        // Calculate the total amount of correction done
        for(let id in this.verticesMap){
            let v = this.verticesMap[id];
            
            let nonExistent = []; // list of constraints that don't exist anymore, the vertex has been deleted
            for(let i = 0; i < v.constraints.length; i++){
                if(this.verticesMap[v.constraints[i]] == undefined){
                    nonExistent.push(i);
                    continue;
                }
                if(v.fixed){continue;}
                const id2 = v.constraints[i];
                let v2 = this.verticesMap[id2]; // vector it should fix constraint to
                let delta = p5.Vector.sub(v2.pos,v.pos);
                let len = delta.mag();
                let diff = (len - this.size)/len;
                //if the other vertex is fixed, move this one only
                if(v2.fixed){
                    v.pos.add(p5.Vector.mult(delta,diff));
                }else{
                    let offset = p5.Vector.mult(delta,diff*0.5);
                    v.pos.add(offset);
                    v2.pos.sub(offset);
                }
                
            }
            // remove non existent constraints
            for(let i = 0; i < nonExistent.length; i++){
                v.constraints.splice(nonExistent[i],1);
                console
            }

        }
    }
    applyRandomForce(){
        //applies random force to all vertices
        //generate random force
        let force = createVector(Math.random()*15000-500,Math.random()*15000-500,Math.random()*15000-500);
        this.verletIntegration(1.0/60.0,force);
    }
    render(){
        for(let id in this.verticesMap){
            this.verticesMap[id].render(this.verticesMap);
        }
    }

}