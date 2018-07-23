var population;
var graph;

function setup()
{
	createCanvas(800, 700);

	population = new Population();
	graph = new Graph(0, 600, 800, 100);

	for (var i = 0; i < 80; i++)
	{
		var h = new Entity(createVector(random(0, width), random(0, height)));
		population.addHuman(h);
	}

	for (var i = 0; i < 5; i++)
	{
		var z = new Entity(createVector(random(0, width), random(0, height)));
		z.maxSpeed = 1.3;
		z.infected = true;
		population.addZombie(z);
	}
}

function draw()
{
	background(51);
	population.run();
	graph.updateValues(population.humans.length, population.zombies.length);
	graph.displaySelf();
}

function mousePressed()
{
	if (graph.overBox(mouseX, mouseY))
	{
		graph.toggleVisibility();
	}
	else
	{
		population.addHuman(new Entity(createVector(mouseX, mouseY)));
	}
}

function Population()
{
	this.humans = [];
	this.zombies = [];
	this.humanTree = new Quadtree({x: 0, y: 0, width: 800, height: 700}, 100, 4);
	this.zombieTree = new Quadtree({x: 0, y: 0, width: 800, height: 700}, 100, 4);
}

Population.prototype.run = function()
{
	this.humanTree.clear();
	this.zombieTree.clear();
	// add a random human somewhere in the map
	if (this.humans.length < 60)
	{
		var timeBetweenSpawns = (this.humans.length * 2) + 100;
		if (frameCount % timeBetweenSpawns == 0)
		{
			var h = new Entity(createVector(random(0, width), random(0, height)));
			this.addHuman(h);
		}
	}

	// populate quadtrees
	for (var i = 0; i < this.humans.length; i++)
	{
		this.humanTree.insert(this.humans[i]);
	}
	for (var i = 0; i < this.zombies.length; i++)
	{
		this.zombieTree.insert(this.zombies[i]);
	}

	for (var i = 0; i < this.humans.length; i++)
	{
		this.humans[i].updateHuman(this.zombies);
		this.humans[i].borders();
	}
	for (var i = 0; i < this.zombies.length; i++)
	{
		this.zombies[i].updateZombie(this.humans, this.zombies);
		this.zombies[i].borders();
	}

	for (var i = this.zombies.length-1; i >= 0; i--)
	{
		var z = this.zombies[i];
		if (z.isDead())
		{
			this.zombies.splice(i, 1);
		}
	}

	for (var i = this.humans.length-1; i >= 0; i--)
	{
		var h = this.humans[i];
		if (h.infected)
		{
			this.addZombie(h);
			this.humans.splice(i, 1);
		}
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
	this.x = this.position.x;
	this.y = this.position.y;
	this.velocity = createVector(0, 0);
	this.acceleration = createVector(0, 0);
	this.maxSpeed = 1.0;
	this.maxForce = 0.05;
	this.width = 1;
	this.height = 1;
	this.r = 2.0;
	this.detectionRadius = 100;
	this.zombielifetime = 20;
	this.infected = false;
}

Entity.prototype.borders = function()
{
	if (this.position.x < -this.r)  this.position.x = width +this.r;
	if (this.position.y < -this.r)  this.position.y = height+this.r;
	if (this.position.x > width +this.r) this.position.x = -this.r;
	if (this.position.y > height+this.r) this.position.y = -this.r;
}

Entity.prototype.isDead = function()
{
	return this.zombielifetime < 0;
}

Entity.prototype.bite = function(human)
{
	this.zombielifetime = 20;
	
	human.infected = true;
	human.maxSpeed = 1.3;
}

// zombie update
Entity.prototype.updateZombie = function(humans, zombies)
{
	// this.zombielifetime -= (1.0/frameRate());
	if (frameCount % 60 == 0)
	{
		this.zombielifetime -= 1;
	}

	var sep = this.separate(zombies);
	var fol = this.follow(humans);

	sep.mult(1.5);
	fol.mult(1.0);

	this.applyForce(sep);
	this.applyForce(fol);

	this.update();

	this.render(color(255, 0, 0));
}

// human update
Entity.prototype.updateHuman = function(zombies)
{
	var avoid = this.avoid(zombies);

	if (avoid.mag() == 0)
	{
		// console.log("Magnitude is zero");
		this.applyForce(-this.velocity);
	}

	this.applyForce(avoid);

	this.update();

	this.render(color(0, 255, 0));
}

Entity.prototype.update = function()
{
	this.velocity.add(this.acceleration);
	this.velocity.limit(this.maxspeed);
	this.position.add(this.velocity);
	this.x = this.position.x;
	this.y = this.position.y;

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

	var elements = population.zombieTree.retrieve(this);

	for (var i = 0; i < elements.length; i++)
	{
		var d = p5.Vector.dist(this.position, elements[i].position);

		if ((d > 0) && (d < this.detectionRadius))
		{
			var diff = p5.Vector.sub(this.position, elements[i].position);
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

Entity.prototype.separate = function(zombies)
{
	var desiredSeparation = 5.0;
	var steer = createVector(0,0);
	var count = 0;

	var elements = population.zombieTree.retrieve(this);

	for (var i = 0; i < elements.length; i++)
	{
		var d = p5.Vector.dist(this.position, elements[i].position);

		if (d > 0 && d < desiredSeparation)
		{
			var diff = p5.Vector.sub(this.position, elements[i].position);
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
	var infectionDist = 4;
	var targetDist = 1000000;
	var targetPos = createVector(0, 0);

	var elements = population.humanTree.retrieve(this);

	for (var i = 0; i < elements.length; i++)
	{
		var d = p5.Vector.dist(this.position, elements[i].position);

		if (d < targetDist)
		{
			targetPos = elements[i].position;
			targetDist = d;
		}

		if (d < infectionDist)
		{
			this.bite(elements[i]);
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