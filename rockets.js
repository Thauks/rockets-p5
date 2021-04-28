var population;
var amount = 300
var lifespan = 320;
var force = 0.55;
var count = 0;
var gen = 0;
var genP;
var lifeP;
var target;


var rx;
var ry;
var rw;
var rh;

function setup() {
  createCanvas(1800, 900);
  population = new Population();
  lifeP = createP();
  genP = createP();
  rx = width/2;
  ry = 5*height/8;
  rw = width/2;
  rh = 10;
  target = createVector(width/2, 50);
}

function draw() {
  background(51);
  noStroke();
  fill(255,0,0);
  ellipse(target.x, target.y, 30, 30);
  fill(255);
  ellipse(target.x, target.y, 20, 20);
  fill(255,0,0);
  ellipse(target.x, target.y, 10, 10);
  population.run();
  lifeP.html("Cycles: "+count);
  genP.html("Gen: " + gen);
  
  rectMode(CENTER);
  fill(200);
  rect(rx,ry,rw,rh);
  
  count++;
  if (count == lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
    gen++;
    hits = 0;
  }
}

function Population() {
  this.rockets = [];
  this.psize = amount;
  this.pool = [];
  
  for (var i = 0; i < this.psize; i++ ){
    this.rockets[i] = new Rocket();
  }
  
  this.evaluate = function(){
    var maxfit = 0;
    for (var i = 0; i < this.psize; i++){
      this.rockets[i].calcFitness();
      if (this.rockets[i].fitness > maxfit){
        maxfit = this.rockets[i].fitness;
      }
    }
    for (var i = 0; i < this.psize; i++){
      this.rockets[i].fitness /= maxfit;
    }
    this.pool = [];
    for (var i = 0; i < this.psize; i++){
      var n = this.rockets[i].fitness *700;
      for (var j = 0; j < n; j++) {
        this.pool.push(this.rockets[i]);
      }
    }
  }
  
  this.selection = function(){
    var newRockets = [];
    for (var i = 0; i < this.rockets.length; i++){
      var ParentA = random(this.pool).DNA;
      var ParentB = random(this.pool).DNA;
      var child = ParentA.crossover(ParentB);
      child.mutate();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }
  
  this.run = function() {
    for (var i = 0; i < this.psize; i++ ){
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }
  
}

function DNA(genes) {
  if (genes){
    this.genes = genes;
  } else{
    this.genes = [];
    for (var i = 0; i < lifespan; i++){
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(force);
    }
  }
  
  this.crossover = function (partner) {
    var newdna = [];
    var mid = floor (random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++){
      if (i > mid){
        newdna[i] = this.genes[i];
      }else{
        newdna[i] = partner.genes[i];
      }
    }
    return new DNA(newdna);
  } 
  
  this.mutate = function(){
    for (var i = 0; i < this.genes.length; i++){
      if (random(1)< 0.0000000001){
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(force);
      }
    }
  }
}

function Rocket(dna) {
  this.pos = createVector(width/2, height);
  this.vel = createVector();
  this.acc = createVector();
  if (dna){
    this.DNA = dna;
  }else{
    this.DNA = new DNA();
  }
  this.fitness = 0;
  this.completed = false;
  this.crashed = false;

  this.applyforce = function(force) {
    this.acc.add(force);
  }
  
  this.calcFitness = function(){
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d,0, width,width,0);
    if (this.completed){
      this.fitness *= 10000;
    }
    if (this.crashed){
      this.fitness /= 10000;
    }
  }
  
  this.update = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (!this.completed && d<10){
      this.completed = true;
      this.pos = target.copy();
    }
    
    if (this.pos.x > rx - rw/2 && this.pos.x < rx + rw/2 && this.pos.y > ry && this.pos.y < ry + rh) {
      this.crashed = true
    }
    
    if (this.pos.x > width-10 || this.pos.x < 10){
      this.crashed = true;    
    }
    
    if (this.pos.y > height || this.pos.y < 10){
      this.crashed = true;    
    }    
    
    this.applyforce(this.DNA.genes[count]);
    if (!this.completed && !this.crashed){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  }

  this.show = function() {
    push();
    noStroke();
    if (this.completed){
      fill(0,255,0, 175);
    }else if(this.crashed){
      fill(255,0,0,175);
    }else {
      fill(255, 175);
    }
    translate(this.pos.x, this.pos.y);
    rotate(PI);
    rotate(this.vel.heading()+HALF_PI);
    triangle(5,-5,0,10,-5,-5)
    pop();
  }

}