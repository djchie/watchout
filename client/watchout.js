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
  bestScore: 0,
  collision: 0
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

var updateCollisionCount = function() {
  d3.select('#collision-count').text(gameStats.collision.toString());
};

/* THE PLAYER */

var Player = function(playerGameOptions) {
  this.playerGameOptions = playerGameOptions;
  this.fill = '#ff6600';
  this.x = (playerGameOptions.width / 2);
  this.y = (playerGameOptions.height / 2);
  // this.angle = ;
  this.r = 10;
};

Player.prototype.render = function(gameBoard) {
  this.element = gameBoard.append('svg:circle')
    .attr('cx', this.x)
    .attr('cy', this.y)
    .attr('fill', this.fill)
    .attr('r', this.r);
  this.setupDragging();
};

Player.prototype.getX = function() {
  return this.x;
};

Player.prototype.setX = function(x) {
  var minX = this.playerGameOptions.padding;
  var maxX = this.playerGameOptions.width - this.playerGameOptions.padding;
  if (x <= minX) {
    this.x = minX;
  } else if (x >= maxX) {
    this.x = maxX;
  } else {
    this.x = x;
  }
};

Player.prototype.getY = function() {
  return this.y;
};

Player.prototype.setY = function(y) {
  var minY = this.playerGameOptions.padding;
  var maxY = this.playerGameOptions.height - this.playerGameOptions.padding;
  if (y <= minY) {
    this.y = minY;
  } else if (y >= maxY) {
    this.y = maxY;
  } else {
    this.y = y;
  }
};

Player.prototype.transform = function(options) {
  if (options.x !== undefined) {
    this.setX(options.x);
  }
  if (options.y !== undefined) {
    this.setY(options.y);
  }
  // d3(this).attr('transform', )
};

Player.prototype.moveAbsolute = function(x, y) {
  this.transform({x:x, y:y});
};

Player.prototype.moveRelative = function(dx, dy) {
  this.transform({x: (this.getX() + dx), y: (this.getY() + dy)});
};

Player.prototype.setupDragging = function() {
  var that = this;
  var dragMove = function() {
    that.moveRelative(d3.event.dx, d3.event.dy);
  };
  var drag = d3.behavior.drag().on('drag', dragMove);
  this.element.call(drag);
  // drag.call(d3.select(this));
};

var player = new Player(gameOptions).render(gameBoard);

/* ENEMIES */

var createEnemies = function() {
  var enemies = [];
  for (var i = 0; i < gameOptions.nEnemies; i++) {
    enemies.push({
      id: i,
      x: (Math.random() * 100),
      y: (Math.random() * 100),
    })
  }
  return enemies;
};

/* RENDERING THE GAME BOARD */

var player = {
  x: 0,
  y: 0
};

var render = function(enemy_data) {
  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemy_data, function(d) { return d.id;});
    
  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x); })
      .attr('cy', function(enemy) { return axes.y(enemy.y); })
      .attr('r', 10);

    enemies.exit()
      .remove();


    var checkCollision = function(enemy, cb) {
      var r = parseFloat(enemy.attr('r'));
      var minX = (parseFloat(enemy.attr('cx')) - r);
      var minY = (parseFloat(enemy.attr('cy')) - r);

      var maxX = (parseFloat(enemy.attr('cx')) + r);
      var maxY = (parseFloat(enemy.attr('cy')) + r);

      // if(player.x > minX && player.x < maxX && player.y > minY && player.y < maxY) {
      //   if (enemy.inCollision === false) {
      //     console.log("collided!");
      //     cb();
      //     enemy.inCollision = true;
      //   }
      // } else {
      //   enemy.inCollision = false;
      // }
    };

    // onCollision

    var onCollision = function() {
      updateBestScore();   
      gameStats.score = 0;
      gameStats.collision++;
      updateScore();  
      updateCollisionCount(); 
    };
    
    var transitionPlusCollisionDetection = function(endData) {
      
      var enemy = d3.select(this);
      
      var startPos = {
        x: parseFloat(enemy.attr('cx')),
        y: parseFloat(enemy.attr('cy'))
      };

      var endPos = {
        x: axes.x(endData.x),
        y: axes.y(endData.y)
      };

      return function(t) {
        checkCollision(enemy, onCollision);

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
    .tween('custom', transitionPlusCollisionDetection);
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

d3.select('svg')
  .on('mousemove', function() {
    player.x = d3.mouse(this)[0];
    player.y = d3.mouse(this)[1];
  })
  .on('mouseleave', function() {
    console.log("Left the border!");
    updateBestScore();
    gameStats.score = 0;
    gameStats.collision = 0;
    updateScore();
    updateCollisionCount();
  });

// d3.select('circle')
//   .on('mousemove', function() {
//     // debugger;
//     console.log("Hit a circle!");
//     updateBestScore();   
//     gameStats.score = 0;
//     gameStats.collision++;
//     updateScore();  
//     updateCollisionCount(); 
//   });
//SVGs covering a larger area than just the circle


