let wheat = function(p){

    let growers = [];

    p.setup = function() {
      p.createCanvas(innerWidth, innerHeight);
      p.background('#00000000');
      p.frameRate(100);
      for(let i=0;i<100;i++){
        growers[i] = new grower();
      }
    }
    
    p.draw = function() {
      for (let i=0;i<growers.length;i++){
        growers[i].update();
      }
    }
    
    class grower{
      constructor(){
        this.x = p.random(p.width);
        this.y = p.height;
      }
      
      update(){
        if(this.y<p.random(p.height-100)){
        this.y=p.height;
        this.x=p.random(p.width);
      }
      
      p.stroke('#5cad64')
      p.strokeWeight(1.5);
      p.point(this.x, this.y);
      
      const r = p.floor(p.randomGaussian(10, 2));
      if(r<8){
        this.x++;
      } else if(r>11){
        this.x--;
      } else {
        this.y--;
      }
      }
    }
}


function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

window.addEventListener('resize', debounce(() => {
  // wheat = new p5(wheat, "wheat");
}, 250));

wheat = new p5(wheat, "wheat");