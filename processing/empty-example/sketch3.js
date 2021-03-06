var planets = [];

var planetCount = 4;

var g = 300000;
var thrustConstant = 50;

var ship;

var dt = 0;

var mouseDown = false;
var mouseInitialPosition = {x: 0, y: 0};

var vectorDimensions = {x: 80, y: 70};

var vectorField = [];

var renderVectorField = false;

function setup()
{
	createCanvas(800, 700);

	frameRate(60);

	respawnShip();

	for (var i = 0; i < planetCount; i++)
	{
		planets.push(new Planet(createVector(random(0, width), random(0, height)), random(10, 50)));
	}

	calculateVectorFields();
}

function calculateVectorFields()
{
	vectorField = new Array(vectorDimensions.x);
	for (var i = 0; i < vectorDimensions.x; i++)
	{
		vectorField[i] = new Array(vectorDimensions.y);
	}

	for (var x = 0; x < vectorDimensions.x; x++)
	{
		for (var y = 0; y < vectorDimensions.y; y++)
		{
			var position = createVector(width * x / vectorDimensions.x, height * y / vectorDimensions.y);

			var acceleration = createVector(0, 0);

			for (var i = 0; i < planets.length; i++)
			{
				var vectorToPlanet = planets[i].position.copy().sub(position.copy());
				distanceFromPlanet = vectorToPlanet.mag();
				var gravityForce = g / vectorToPlanet.magSq();
				vectorToPlanet.normalize();
				vectorToPlanet.mult(gravityForce);
				acceleration.add(vectorToPlanet);
			}

			magnitude = acceleration.mag();
			if (magnitude > 70)
			{
				acceleration.setMag(70);
			}

			vectorField[x][y] = acceleration.mult(0.05);
		}
	}
}

function drawVectorField()
{
	for (var x = 0; x < vectorDimensions.x; x++)
	{
		for (var y = 0; y < vectorDimensions.y; y++)
		{
			var position = createVector(width * x / vectorDimensions.x, height * y / vectorDimensions.y);

			stroke(128);
			strokeWeight(1);
			line(position.x, position.y, position.x+vectorField[x][y].x, position.y+vectorField[x][y].y);
		}
	}
}

function respawnShip()
{
	ship = new Ship(createVector(width/2, height/2));
}

function draw()
{
	background(0);

	dt = 1 / frameRate();

	for (var i = 0; i < planets.length; i++)
	{
		planets[i].render();
	}

	ship.update();

	if (renderVectorField)
	{
		drawVectorField();
	}
}

function mousePressed()
{
	mouseInitialPosition.x = mouseX;
	mouseInitialPosition.y = mouseY;
	mouseDown = true;

	return false;
}

function mouseDragged()
{
	return false;
}

function mouseReleased()
{
	mouseDown = false;
	return false;
}

function Ship(position)
{
	this.position = position.copy();
	this.velocity = createVector(0, 0);
	this.thrustVector = createVector(0, 0);
	this.colour = color(130);
	this.wallColour = color(255);
	this.rocketColour = color(255, 128, 32);
	this.r = 4.0;
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
		distanceFromPlanet = vectorToPlanet.mag();
		if (distanceFromPlanet < planets[i].radius/1.5)
		{
			respawnShip();
		}
		var gravityForce = g / vectorToPlanet.magSq();
		vectorToPlanet.normalize();
		vectorToPlanet.mult(gravityForce);
		acceleration.add(vectorToPlanet);
	}

	if (this.thrusting)
	{
		acceleration.add(this.thrustVector.copy().mult(dt));
	}

	this.velocity.add(acceleration.mult(dt));
	this.position.add(this.velocity.copy().mult(dt));
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