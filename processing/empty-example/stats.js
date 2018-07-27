function Stats()
{
    this.averageHumanSearchSize = 0;
    this.numberOfHumanSearches = 0;

    this.averageZombieSearchSize = 0;
    this.numberOfZombieSearches = 0;
}

Stats.prototype.reset = function()
{
    this.averageHumanSearchSize = 0;
    this.numberOfHumanSearches = 0;

    this.averageZombieSearchSize = 0;
    this.numberOfZombieSearches = 0;
}

Stats.prototype.render = function()
{
    textSize(18);
    stroke(255);
    fill(255);
    var zombieText = "Average Zombie search size: " + Math.round(this.averageZombieSearchSize) + " / " + population.zombies.length;
    text(zombieText, 0, 18);
    var humanText = "Average Human search size: " + Math.round(this.averageHumanSearchSize) + " / " + population.humans.length;
    text(humanText, 0, 36);
}

Stats.prototype.addHumanDataPoint = function(humanData)
{
    this.averageHumanSearchSize += humanData;
    this.numberOfHumanSearches++;
}

Stats.prototype.addZombieDataPoint = function(zombieData)
{
    this.averageZombieSearchSize += zombieData;
    this.numberOfZombieSearches++;
}

Stats.prototype.average = function()
{
	if (this.numberOfHumanSearches != 0)
        this.averageHumanSearchSize = this.averageHumanSearchSize / this.numberOfHumanSearches;

    if (this.numberOfZombieSearches != 0)
        this.averageZombieSearchSize = this.averageZombieSearchSize / this.numberOfZombieSearches;
}