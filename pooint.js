class Pooint {
    constructor(pos,fixed = false,constraints = [],radius = 5.0,mass = 1.0) {
        this.pos = pos;
        this.prevPos = pos;
        this.fixed = fixed;
        this.radius = radius;
        this.constraints = constraints;
        this.mass = mass;
    }

    render(vertexMap){
        for(let i = 0; i < this.constraints.length; i++){
            const id = this.constraints[i];
            let v = vertexMap[id];
            fill(0);
            stroke(0);
            line(this.pos.x,this.pos.y,this.pos.z,v.pos.x,v.pos.y,v.pos.z);
        }
       
    }

}