var population

function setup()
{
	createCanvas(640, 360);

	population = new Population();

	for (var i = 0; i < 50; i++)
	{
		var h = new Entity(createVector(random(0, width/2), random(0, height)));
		population.addHuman(h);

		var z = new Entity(createVector(random(width/2, width), random(0, height)));
		population.addZombie(z);
	}
}

function draw()
{
	background(51);
	population.run();
}

function mousePressed()
{
	population.addHuman(new Entity(createVector(mouseX, mouseY)));
}

function Population()
{
	this.humans = [];
	this.zombies = [];
}

Population.prototype.run = function()
{
	for (var i = 0; i < this.humans.length; i++)
	{
		this.humans[i].updateHuman(this.zombies);
		this.humans[i].borders();
	}
	for (var i = 0; i < this.zombies.length; i++)
	{
		this.zombies[i].updateZombie(this.humans);
		this.zombies[i].borders();
	}
}

Population.prototype.addHuman = function(h)
{
	this.humans.push(h);
}

Population.prototype.addZombie = function(z)
{
	this.zombies.push(z);
}

function Entity(position)
{
	this.position = position.copy();
	this.velocity = createVector(0, 0);
	this.acceleration = createVector(0, 0);
	this.maxSpeed = 1.0;
	this.maxForce = 0.05;
	this.r = 2.0;
	this.detectionRadius = 50;
}

Entity.prototype.borders = function()
{
	if (this.position.x < -this.r)  this.position.x = width +this.r;
	if (this.position.y < -this.r)  this.position.y = height+this.r;
	if (this.position.x > width +this.r) this.position.x = -this.r;
	if (this.position.y > height+this.r) this.position.y = -this.r;
}

// zombie update
Entity.prototype.updateZombie = function(humans)
{
	var fol = this.follow(humans);

	this.applyForce(fol);

	this.update();

	this.render(color(255, 0, 0));
}

// human update
Entity.prototype.updateHuman = function(zombies)
{
	var avoid = this.avoid(zombies);

	avoid.mult(1.5);

	this.applyForce(avoid);

	this.update();

	this.render(color(0, 255, 0));
}

Entity.prototype.update = function()
{
	this.velocity.add(this.acceleration);
	this.velocity.limit(this.maxspeed);
	this.position.add(this.velocity);

	this.acceleration.mult(0);
}

Entity.prototype.render = function(colour)
{
	var theta = this.velocity.heading() + radians(90);
	fill(colour);
	stroke(200);
	push();
	translate(this.position.x,this.position.y);
	rotate(theta);
	beginShape();
	vertex(0, -this.r*2);
	vertex(-this.r, this.r*2);
	vertex(this.r, this.r*2);
	endShape(CLOSE);
	pop();
}

Entity.prototype.applyForce = function(force)
{
	this.acceleration.add(force);
}

Entity.prototype.avoid = function(zombies)
{
	var steer = createVector(0, 0);
	var count = 0;

	for (var i = 0; i < zombies.length; i++)
	{
		var d = p5.Vector.dist(this.position, zombies[i].position);

		if ((d > 0) && (d < this.detectionRadius))
		{
			var diff = p5.Vector.sub(this.position, zombies[i].position);
			diff.normalize();
			diff.div(d);
			steer.add(diff);
			count++;
		}
	}

	if (count > 0)
	{
		steer.div(count);
	}

	if (steer.mag() > 0)
	{
		steer.normalize();
		steer.mult(this.maxSpeed);
		steer.sub(this.velocity);
		steer.limit(this.maxForce);
	}

	return steer;
}

// find closest human and route towards them
Entity.prototype.follow = function(humans)
{
	var targetDist = 1000000;
	var targetPos = createVector(0, 0);
	for (var i = 0; i < humans.length; i++)
	{
		var d = p5.Vector.dist(this.position, humans[i].position);

		if (d < targetDist)
		{
			targetPos = humans[i].position;
			targetDist = d;
		}
	}

	var steer = p5.Vector.sub(targetPos, this.position);

	if (steer.mag() > 0)
	{
		steer.normalize();
		steer.mult(this.maxSpeed);
		steer.sub(this.velocity);
		steer.limit(this.maxForce);
	}

	return steer;
}