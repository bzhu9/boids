// Get the canvas element
const canvas = document.getElementById('boids');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randomSpeed() {
  return Math.random() * 5 - 2.5;
}
DRAW_TRAIL = false;
COLOR_ON = true;
// Add an event listener to create a boid when the canvas is clicked
canvas.addEventListener('click', createBoid, false);

// Add an event listener for key 't'
document.addEventListener('keydown', function(event) {
  if (event.key === 't') {
    DRAW_TRAIL = !DRAW_TRAIL;
  }
  if (event.key === 'c') {
    COLOR_ON = !COLOR_ON;
  }
  if (event.key === 'r') {
    boids = [];
  }
});


function createBoid(event) {
  const heads = [
    "#FF8C9B", // Red
    "#FFBFA9", // Orange
    "#7ACF7A", // Green
    "#558CF4", // Blue
    "#BEBEEA", // Indigo
    "#B35CB3"  // Violet
  ];
  
  const r = Math.floor(Math.random() * heads.length);
  for (let i = 0; i < 100; i++) {
    const x = event.clientX + Math.random() * 50 - 25;
    const y = event.clientY + Math.random() * 50 - 25;
    const dx = randomSpeed();
    const dy = randomSpeed();
    const boid = new Boid(x, y, dx, dy, heads[r], heads[r]+"66");
    boids.push(boid);
  }
}
// Create an array to store the boids
var boids = [];

function distance(boid1, boid2) {
  const dx = boid1.x - boid2.x;
  const dy = boid1.y - boid2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Define the boid class
class Boid {
  constructor(x, y, dx, dy, color = "#558cf4") {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.visualRange = 55;
    this.group = Math.round(Math.random());
    this.biasval = 0.001;
    this.history = [];
    this.color = color;
    
    // Red: #FFB6C1 Orange: #FFDAB9 Yellow: #FFFFE0 Green: #98FB98 Blue: #ADD8E6 Indigo: #E6E6FA Violet: #EE82EE
    
  }

  update() {
    // Update the position of the boid
    this.x += this.dx;
    this.y += this.dy;
    this.history.push([this.x, this.y])
    this.history = this.history.slice(-20);

    // Wrap around the canvas edges
    // if (this.x < 0) this.x = canvas.width;
    // if (this.x > canvas.width) this.x = 0;
    // if (this.y < 0) this.y = canvas.height;
    // if (this.y > canvas.height) this.y = 0;
  }
  
  keepWithinBounds() {
    const margin = 100;
    const turnFactor = 0.2;
    const width = canvas.width;
    const height = canvas.height;
  
    if (this.x < margin)
      this.dx += turnFactor;
    
    if (this.x > width - margin)
      this.dx -= turnFactor;
    
    if (this.y < margin)
      this.dy += turnFactor;
    
    if (this.y > height - margin)
      this.dy -= turnFactor;
  }

  limitSpeed() {
    const speedLimit = 6;
    const minSpeed = 3;
  
    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (speed > speedLimit) {
      this.dx = (this.dx / speed) * speedLimit;
      this.dy = (this.dy / speed) * speedLimit;
    }
    if (speed < minSpeed) {
      this.dx = (this.dx / speed) * minSpeed;
      this.dy = (this.dy / speed) * minSpeed;
    }
  }
  
  flyTowardsCenter() {
    const centeringFactor = 0.0005; // adjust velocity by this %
  
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;
  
    for (let otherBoid of boids) {
      if (otherBoid !== this) {
        if (distance(this, otherBoid) < this.visualRange) {
          centerX += otherBoid.x;
          centerY += otherBoid.y;
          numNeighbors += 1;
        }
      }
    }
  
    if (numNeighbors) {
      centerX = centerX / numNeighbors;
      centerY = centerY / numNeighbors;
  
      this.dx += (centerX - this.x) * centeringFactor;
      this.dy += (centerY - this.y) * centeringFactor;
    }
  }

  avoidOthers() {
    const minDistance = 8; // The distance to stay away from other boids
    const avoidFactor = 0.05; // Adjust velocity by this %
    let moveX = 0;
    let moveY = 0;
    for (let otherBoid of boids) {
      if (otherBoid !== this) {
        if (distance(this, otherBoid) < minDistance) {
          moveX += this.x - otherBoid.x;
          moveY += this.y - otherBoid.y;
        }
      }
    }
  
    this.dx += moveX * avoidFactor;
    this.dy += moveY * avoidFactor;
  }

  matchVelocity() {
    const matchingFactor = 0.05; // Adjust by this % of average velocity
  
    let avgDX = 0;
    let avgDY = 0;
    let numNeighbors = 0;
  
    for (let otherBoid of boids) {
      if (otherBoid !== this) {
        if (distance(this, otherBoid) < this.visualRange) {
          avgDX += otherBoid.dx;
          avgDY += otherBoid.dy;
          numNeighbors += 1;
        }
      }
    }
  
    if (numNeighbors) {
      avgDX = avgDX / numNeighbors;
      avgDY = avgDY / numNeighbors;
  
      this.dx += (avgDX - this.dx) * matchingFactor;
      this.dy += (avgDY - this.dy) * matchingFactor;
    }
  }

  bias() {
    const maxbias = 0.01;
    const biasIncrement = 0.00004;
    const biasFactor = 0.05;
    if (this.group) {
      // bias towards right
      if (this.dx > 0)
        this.biasval = Math.min(maxbias, this.biasval + biasIncrement)
      else
        this.biasval = Math.max(biasIncrement, this.biasval - biasIncrement)
      this.dx = (1 - this.biasval) * this.dx + (this.biasval * 1)
    }
    else {
      // bias towards left
      if (this.dx < 0)
        this.biasval = Math.min(maxbias, this.biasval + biasIncrement)
      else
        this.biasval = Math.max(biasIncrement, this.biasval - biasIncrement)
      this.dx = (1 - this.biasval) * this.dx + (this.biasval * (-1))
    }
  }

  draw() {
    const angle = Math.atan2(this.dy, this.dx);
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.translate(-this.x, -this.y);
    if (COLOR_ON)
      ctx.fillStyle = this.color;
    else
      ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 7, this.y + 2.8);
    ctx.lineTo(this.x - 7, this.y - 2.8);
    ctx.lineTo(this.x, this.y);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    if (DRAW_TRAIL) {
      if (COLOR_ON)
        ctx.strokeStyle = this.color + "66";
      else
        ctx.strokeStyle = "#00000066";
      ctx.beginPath();
      ctx.moveTo(this.history[0][0], this.history[0][1]);
      for (const point of this.history) {
        ctx.lineTo(point[0], point[1]);
      }
      ctx.stroke();
    }
  }
}

// Create a function to initialize the boids
function initBoids() {
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const dx = randomSpeed();
    const dy = randomSpeed();
    const boid = new Boid(x, y, dx, dy);
    boids.push(boid);
  }
}

// Create a function to update and draw the boids
function animate() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each boid
  for (const boid of boids) {
    boid.avoidOthers();
    boid.flyTowardsCenter();
    boid.matchVelocity();
    boid.keepWithinBounds();
    boid.bias();
    boid.limitSpeed();
    boid.update();
    boid.draw();
  }

  // Call the animate function recursively
  requestAnimationFrame(animate);
}

// Call the resizeCanvas function to resize the canvas
resizeCanvas();

// Call the initBoids function to initialize the boids
// initBoids();

// Call the animate function to start the animation
animate();
