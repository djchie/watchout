// start slingin' some d3 here.

/* SETUP THE ENVIRONMENT */

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

/* SETUP THE GAME BOARD */

// Axes
var axes = {
  x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]),
  y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height])
};

// Game Board (svg region)
var gameBoard = d3.select('.container').append('svg:svg')
            .attr('width', gameOptions.width)
            .attr('height', gameOptions.height);

// Scores
var updateScore = function() {
  d3.select('#current-score').text(gameStats.score.toString());
};

var updateBestScore = function() {
  if(gameStats.score > gameStats.bestScore) {
    gameStats.bestScore = gameStats.score;
    d3.select('#best-score').text(gameStats.bestScore.toString());
  }
};

/* THE PLAYER */



/* ENEMIES */

var createEnemies = function() {
  var enemies = [];
  for (var i = 0; i < gameOptions.nEnemies; i++) {
    enemies.push({
      id: i,
      x: (Math.random() * 100),
      y: (Math.random() * 100)
    })
  }
  return enemies;
};

/* RENDERING THE GAME BOARD */

var render = function(enemy_data) {
  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemy_data, function(d) { return d.id;});
    // debugger;
  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x); })
      .attr('cy', function(enemy) { return axes.y(enemy.y); })
      .attr('r', 10);

    enemies.exit()
      .remove();

    // checkCollision
    // onCollision
    
    var tweenWithCollisionDetection = function(endData) {
      
      var enemy = d3.select(this);
      
      var startPos = {
        x: parseFloat(enemy.attr('cx')),
        y: parseFloat(enemy.attr('cy'))
      };

      var endPos = {
        x: axes.x(endData.x),
        y: axes.y(endData.y),
      };

      return function(t) {
        // checkCollision(enemy, onCollision);

        var enemyNextPos = {
          x: (startPos.x + (endPos.x - startPos.x) * t),
          y: (startPos.y + (endPos.y - startPos.y) * t)
        };

        return enemy.attr('cx', enemyNextPos.x)
          .attr('cy', enemyNextPos.y);
      };

    };

  return enemies.transition()
    .duration(500)
    .attr('r', 10)
  .transition()
    .duration(2000)
    .tween('custom', tweenWithCollisionDetection);
};



/* PLAY THE GAME! */

var play = function() {
  var gameTurn = function() {
    newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  }

  var increaseScore = function() {
    gameStats.score++;
    updateScore();
  }

  gameTurn();
  setInterval(gameTurn, 2000);
  setInterval(increaseScore, 50);
}

play();


//SVGs covering a larger area than just the circle
//






// console.log(gameBoard);

// d3.select('.container > svg').append('svg');
// var incrX = 0;
// var incrY = 0;
// for (var i = 0; i < gameOptions.nEnemies; i++) {
//   incrX += 12;
//   incrY += 12;
//   d3.selectAll('.container > svg > svg').append('circle').attr('cx', incrX).attr('cy', incrY).attr('r', '10');
// }