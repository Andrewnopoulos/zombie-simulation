


function Graph(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.humanPop = [];
    this.zombiePop = [];

    this.visible = true;
}

Graph.prototype.toggleVisibility = function()
{
    this.visible = ! this.visible;
}

Graph.prototype.overBox = function(inputX, inputY)
{
    return inputX > this.x && inputX < this.x + this.width &&
        inputY < this.y + this.height && inputY > this.y;
}

Graph.prototype.updateValues = function(newHumanVal, newZombieVal)
{
    for (var i = 1; i < this.width; i++)
    {
        this.humanPop[i-1] = this.humanPop[i];
        this.zombiePop[i-1] = this.zombiePop[i];
    }

    this.humanPop[this.width - 1] = -(newHumanVal / 100) * this.height + this.y + this.height;
    this.zombiePop[this.width - 1] = -(newZombieVal / 100) * this.height + this.y + this.height;
}

Graph.prototype.displaySelf = function()
{
    if (! this.visible)
    {
        noFill()
        stroke(200);
        rect(this.x, this.y, this.width, this.height);
    }
    else
    {
        fill(100);
        noStroke();
        rect(this.x, this.y, this.width, this.height);

        for (var i = 1; i < this.width; i++)
        {
            stroke(color(0, 255, 0));
            point(i, this.humanPop[i]);

            stroke(color(255, 0, 0));
            point(i, this.zombiePop[i]);
        }
    }
}