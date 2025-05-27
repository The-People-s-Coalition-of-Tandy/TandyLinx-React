import React from 'react';
import Sketch from 'react-p5';

const WheatSketch = () => {
  let growers = [];

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
    p5.background('#00000000');
    p5.frameRate(100);
    for(let i = 0; i < 100; i++) {
      growers[i] = new Grower(p5);
    }
  };

  const draw = (p5) => {
    growers.forEach(grower => grower.update(p5));
  };

  class Grower {
    constructor(p5) {
      this.x = p5.random(p5.width);
      this.y = p5.height;
    }
    
    update(p5) {
      if(this.y < p5.random(p5.height-100)) {
        this.y = p5.height;
        this.x = p5.random(p5.width);
      }
      
      p5.stroke('#5cad64');
      p5.strokeWeight(1.5);
      p5.point(this.x, this.y);
      
      const r = p5.floor(p5.randomGaussian(10, 2));
      if(r < 8) {
        this.x++;
      } else if(r > 11) {
        this.x--;
      } else {
        this.y--;
      }
    }
  }

  return <Sketch setup={setup} draw={draw} />;
};

export default WheatSketch; 