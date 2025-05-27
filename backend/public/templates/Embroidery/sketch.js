let embroideryFrame = function (p) {
  let images = ['/templates/Embroidery/Embroidery/blue.png', '/templates/Embroidery/Embroidery/emb3White1.png', '/templates/Embroidery/Embroidery/ukraine1.png', '/templates/Embroidery/Embroidery/embroider2white.png' ]
  let x = 0
  let rotation = 0
  
  let BORDER_WIDTH = 70;
  let div = document.querySelector("#mainDiv");
  
  let embroidery = [];

  
  p.setup = function() {
    var embroideryCanvas = p.createCanvas(div.offsetWidth + BORDER_WIDTH, div.offsetHeight + BORDER_WIDTH);
    embroideryCanvas.parent("mainDiv")
  
    p.background(0,0,0,0);
  
    for (let i = 0; i < 20; i++) {
      embroidery[i] = new snake(p.floor(p.random(0,4)), p.random(0, 100), images[p.floor(p.random(0,3))]);
    }
    x = 0
    p.noiseDetail(8, .6)
  
    p.imageMode(p.CENTER);
    p.angleMode(p.DEGREES);
    p.rectMode(p.CENTER);
    
    setTimeout(() => {p.noLoop()}, 6000)
    // frameRate()
  }
  
  p.draw = function() {
    for (let i = 0; i < embroidery.length; i++) {
      embroidery[i].update();
    }
  }
  
  
  class snake {
    constructor(direction, seed, image) {
      this.directions = ["RIGHT", "DOWN", "LEFT", "UP"];
  
      this.noiseIncrement = seed;
      this.bendTime = p.noise(seed) * BORDER_WIDTH;
      this.direction = direction;
      this.seed = seed
      this.radius = p.random(5, 15);
      this.img = p.loadImage(image);
      p.strokeWeight(0.5);
  
      switch (this.directions[this.direction]) {
        case "RIGHT":
          this.x = p.noise(seed) * BORDER_WIDTH;
          this.y = 0;
          break;
        case "LEFT":
          this.y = 0;
          this.x = p.width - p.noise(seed) * BORDER_WIDTH;
          break;
        case "UP":
          this.x = 0;
          this.y = p.height - p.noise(seed) * BORDER_WIDTH;
          break;
        case "DOWN":
          this.x = 0;
          this.y = p.noise(seed) * BORDER_WIDTH;;
          break;
  
        default:
          this.x = 0;
          this.y = 0;
      }
  
    }
  
    update() {
      switch (this.directions[this.direction]) {
        case "RIGHT":
          this.x += this.radius;
          this.noiseIncrement += 0.01;
          this.y = p.noise(this.noiseIncrement + 0.01) * BORDER_WIDTH;
          p.image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.x > (p.width - BORDER_WIDTH + this.bendTime - this.radius)) {
            this.y--;
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "DOWN":
          this.y += this.radius;
          this.noiseIncrement += 0.01;
          this.x = p.noise(this.noiseIncrement + 0.01) * BORDER_WIDTH + p.width - BORDER_WIDTH;
          p.push();
          // Translate to the origin of the shape
          p.translate(this.x, this.y);
          // Rotate around the origin
          p.rotate(90);
          // Because we've translated to the origin, we draw the square at 0, 0
          p.image(this.img, 0, 0, this.radius, this.radius);
          // Restore the state saved with push();
          p.pop();
          // image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.y > (p.height - BORDER_WIDTH + this.bendTime - this.radius)) {
            this.x--;
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "LEFT":
          this.x -= this.radius;
          this.noiseIncrement += 0.01;
          this.y = p.noise(this.noiseIncrement + 0.01) * BORDER_WIDTH + p.height - BORDER_WIDTH;
          p.image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.x < (this.bendTime + this.radius)) {
            this.y--;
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        case "UP":
          this.y -= this.radius;
          this.x = p.noise(this.noiseIncrement) * BORDER_WIDTH;
          this.noiseIncrement += 0.01;
  
          p.push();
          // Translate to the origin of the shape
          p.translate(this.x, this.y);
          // Rotate around the origin
          p.rotate(90);
          // Because we've translated to the origin, we draw the square at 0, 0
          p.image(this.img, 0, 0, this.radius, this.radius);
          // Restore the state saved with push();
          p.pop();
          // image(this.img, this.x, this.y, this.radius, this.radius);
  
          if (this.y < (0 + this.bendTime + this.radius)) {
            this.x++;
            this.direction = (this.direction + 1) % 4;
            this.noiseIncrement = this.seed;
          }
          break;
  
        default:
          break;
      }
    }
  }   
}

const embroidery = new p5(embroideryFrame);