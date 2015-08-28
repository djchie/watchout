// start slingin' some d3 here.

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 30
};

var gameStats = {
  score: 0,
  bestScore: 0
};

var axes = {
  x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]),
  y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height])
};

var gameBoard = d3.select('.container').append('svg:svg')
            .attr('width', gameOptions.width)
            .attr('height', gameOptions.height);

console.log(gameBoard);

d3.select('.container > svg').append('svg');
var incrX = 0;
var incrY = 0;
for (var i = 0; i < gameOptions.nEnemies; i++) {
  incrX += 12;
  incrY += 12;
  d3.selectAll('.container > svg > svg').append('circle').attr('cx', incrX).attr('cy', incrY).attr('r', '10');
}

var updateScore = function() {
  d3.select('#current-score').text(gameStats.score.toString());
};

var updateBestScore = function() {
  if(gameStats.score > gameStats.bestScore) {
    gameStats.bestScore = gameStats.score;
    d3.select('#best-score').text(gameStats.bestScore.toString());
  }
};


//SVGs covering a larger area than just the circle
//