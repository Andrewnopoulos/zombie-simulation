var planets = [];

var planetCount = 3;

var g = 100;
var thrustConstant = 0.0005;

var ship;

var dt;

var mouseDown = false;
var mouseInitialPosition = {x: 0, y: 0};

function setup()
{
	createCanvas(800, 700);

	frameRate(60);

	dt = 1 / frameRate();

	ship = new Ship(createVector(width/2, height/2));

	for (var i = 0; i < planetCount; i++)
	{
		planets.push(new Planet(createVector(random(0, width), random(0, height)), random(10, 50)));
	}
}

function draw()
{
	background(0);

	for (var i = 0; i < planets.length; i++)
	{
		planets[i].render();
	}

	ship.update();
}

function mousePressed()
{
	mouseInitialPosition.x = mouseX;
	mouseInitialPosition.y = mouseY;
	mouseDown = true;
}

function mouseReleased()
{
	mouseDown = false;
}

function Ship(position)
{
	this.position = position.copy();
	this.velocity = createVector(0, 0);
	this.thrustVector = createVector(0, 0);
	this.colour = color(130);
	this.wallColour = color(255);
	this.rocketColour = color(255, 128, 32);
	this.r = 30.0;
	this.thrusting = false;
}

Ship.prototype.update = function()
{
	this.thrusting = mouseDown;

	if (this.thrusting)
	{
		this.thrustVector = createVector(mouseX, mouseY).sub(createVector(mouseInitialPosition.x, mouseInitialPosition.y)).mult(thrustConstant);
	}

	this.gravitate();

	this.render();
}

Ship.prototype.gravitate = function()
{
	var acceleration = createVector(0, 0);

	for (var i = 0; i < planets.length; i++)
	{
		var vectorToPlanet = planets[i].position.copy().sub(this.position.copy());
		var gravityForce = g / vectorToPlanet.magSq();
		vectorToPlanet.normalize();
		vectorToPlanet.mult(gravityForce);
		acceleration.add(vectorToPlanet);
	}

	if (this.thrusting)
	{
		acceleration.add(this.thrustVector);
	}

	this.velocity.add(acceleration.mult(dt));
	this.position.add(this.velocity.mult(dt));
}

Ship.prototype.render = function() {
	// Draw a triangle rotated in the direction of velocity
	var theta = this.thrustVector.heading() + radians(90);
	push();
	translate(this.position.x,this.position.y);
	rotate(theta);

	if (this.thrusting)
	{
		fill(this.rocketColour);
		noStroke();
		beginShape();
		vertex(-this.r/2, this.r);
		vertex(0, this.r*2);
		vertex(this.r/2, this.r);
		endShape(CLOSE);
	}

	fill(this.colour);
	stroke(this.wallColour);
	strokeWeight(1);
	beginShape();
	vertex(0, -this.r*2);
	vertex(-this.r, this.r*2);
	vertex(0, this.r);
	vertex(this.r, this.r*2);
	endShape(CLOSE);

	pop();
  }

function Planet(position, radius)
{
	this.position = position.copy();
	this.radius = radius;
	this.colour = color(random(0, 255), random(0, 255), random(0, 255));
	this.atmosphereColour = color(random(0, 255), random(0, 255), random(0, 255));
}

Planet.prototype.render = function()
{
	fill(this.colour);
	stroke(this.atmosphereColour);
	strokeWeight(3);
	ellipse(this.position.x, this.position.y, this.radius);
}