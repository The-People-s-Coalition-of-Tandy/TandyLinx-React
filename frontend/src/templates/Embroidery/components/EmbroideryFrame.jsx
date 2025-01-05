import React from 'react';
import Sketch from 'react-p5';
// Import images directly
import blueImg from '../assets/Embroidery/blue.png';
import embWhiteImg from '../assets/Embroidery/emb3White1.png';
import ukraineImg from '../assets/Embroidery/ukraine1.png';
import embroiderWhiteImg from '../assets/Embroidery/embroider2white.png';

const EmbroideryFrame = ({ containerRef }) => {
  const images = [blueImg, embWhiteImg, ukraineImg, embroiderWhiteImg];
  const BORDER_WIDTH = 70;
  let embroidery = [];
  let loadedImages = [];

  const preload = (p5) => {
    // Preload all images
    loadedImages = images.map(img => p5.loadImage(img));
  };

  class Snake {
    constructor(p5, direction, seed, imageIndex) {
      this.directions = ["RIGHT", "DOWN", "LEFT", "UP"];
      this.noiseIncrement = seed;
      this.bendTime = p5.noise(seed) * BORDER_WIDTH;
      this.direction = direction;
      this.seed = seed;
      this.radius = p5.random(5, 15);
      this.speed = 2; // Uniform speed
      this.img = loadedImages[imageIndex];
      p5.strokeWeight(0.5);
  
      switch (this.directions[this.direction]) {
        case "RIGHT":
          this.x = p5.noise(seed) * BORDER_WIDTH;
          this.y = 0;
          break;
        case "LEFT":
          this.y = 0;
          this.x = p5.width - p5.noise(seed) * BORDER_WIDTH;
          break;
        case "UP":
          this.x = 0;
          this.y = p5.height - p5.noise(seed) * BORDER_WIDTH;
          break;
        case "DOWN":
          this.x = 0;
          this.y = p5.noise(seed) * BORDER_WIDTH;
          break;
        default:
          this.x = 0;
          this.y = 0;
      }
    }
  
    update(p5) {
      this.noiseIncrement += 0.01; // Ensure consistent increments
      const noiseValue = p5.noise(this.noiseIncrement);
  
      switch (this.directions[this.direction]) {
        case "RIGHT":
          this.x += this.speed;
          this.y = noiseValue * BORDER_WIDTH;
          p5.image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.x > (p5.width - BORDER_WIDTH + this.bendTime - this.radius)) {
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "DOWN":
          this.y += this.speed;
          this.x = noiseValue * BORDER_WIDTH + p5.width - BORDER_WIDTH;
          p5.push();
          p5.translate(this.x, this.y);
          p5.rotate(90);
          p5.image(this.img, 0, 0, this.radius, this.radius);
          p5.pop();
  
          if (this.y > (p5.height - BORDER_WIDTH + this.bendTime - this.radius)) {
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "LEFT":
          this.x -= this.speed;
          this.y = noiseValue * BORDER_WIDTH + p5.height - BORDER_WIDTH;
          p5.image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.x < (this.bendTime + this.radius)) {
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "UP":
          this.y -= this.speed;
          this.x = noiseValue * BORDER_WIDTH;
          p5.push();
          p5.translate(this.x, this.y);
          p5.rotate(90);
          p5.image(this.img, 0, 0, this.radius, this.radius);
          p5.pop();
  
          if (this.y < (0 + this.bendTime + this.radius)) {
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        default:
          break;
      }
    }
  }
  
  const setup = (p5, canvasParentRef) => {
    if (!containerRef.current) return;
    
    const canvas = p5.createCanvas(
      containerRef.current.offsetWidth + BORDER_WIDTH, 
      containerRef.current.offsetHeight + BORDER_WIDTH
    );
    canvas.parent(canvasParentRef);
    
    p5.background(0, 0, 0, 0);
    
    for (let i = 0; i < 20; i++) {
      embroidery[i] = new Snake(
        p5,
        p5.floor(p5.random(0, 4)),
        p5.random(0, 100),
        p5.floor(p5.random(0, loadedImages.length))
      );
    }
    
    p5.noiseDetail(8, 0.6);
    p5.imageMode(p5.CENTER);
    p5.angleMode(p5.DEGREES);
    p5.rectMode(p5.CENTER);
    
    setTimeout(() => p5.noLoop(), 6000);
  };

  const draw = (p5) => {
    embroidery.forEach(snake => snake.update(p5));
  };

  return <Sketch preload={preload} setup={setup} draw={draw} />;
};

export default EmbroideryFrame; 