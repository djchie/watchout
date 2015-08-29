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
gameBoard.append('filter')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('id', 'fred')
          .append('feImage')
          .attr('xlink:href', 'fred.svg');
gameBoard.append('filter')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('id', 'mylittlepony')
          .append('feImage')
          .attr('xlink:href', 'mylittlepony.png');

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
//Player Constructor
var Player = function(playerGameOptions) {
  this.playerGameOptions = playerGameOptions;
  this.fill = '#ff6600';
  this.x = (playerGameOptions.width / 2);
  this.y = (playerGameOptions.height / 2);
  // this.angle = ;
  this.r = 25;
};

//Places player on board and adds attributes
Player.prototype.render = function(gameBoard) {
  this.element = gameBoard.append('svg:circle')
    .attr('class', 'player')
    .attr('cx', this.x)
    .attr('cy', this.y)
    .attr('fill', this.fill)
    .attr('r', this.r)
    .attr('filter', 'url(#mylittlepony)');
  this.setupDragging();
};
//Returns player x coordinate value
Player.prototype.getX = function() {
  return this.x;
};
//Sets player x coordinate value
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
//Returns player y coordinate value
Player.prototype.getY = function() {
  return this.y;
};
//Sets player y coordinate value
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

Player.prototype.setupDragging = function() {
  var that = this;
  var dragMove = function() {
    // that.moveAbsolute(d3.event.x, d3.event.y);
    that.element.attr('cx', function() {
      var minX = that.playerGameOptions.padding;
      var maxX = that.playerGameOptions.width - that.playerGameOptions.padding;
      var x = d3.event.x;
      if (x <= minX) {
        x = minX;
      } else if (x >= maxX) {
        x = maxX;
      }
      return x;
    }).attr('cy', function() {
      var minY = that.playerGameOptions.padding;
      var maxY = that.playerGameOptions.height - that.playerGameOptions.padding;
      var y = d3.event.y;
      if (y <= minY) {
        y = minY;
      } else if (y >= maxY) {
        y = maxY;
      }
      return y;
    })
  };
  var drag = d3.behavior.drag().on('drag', dragMove);
  this.element.call(drag);
};

var player = new Player(gameOptions);
player.render(gameBoard);

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

var render = function(enemy_data) {
  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemy_data, function(d) { return d.id;});
    
  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x); })
      .attr('cy', function(enemy) { return axes.y(enemy.y); })
      .attr('r', 25)
      .attr('filter', 'url(#fred)');

    enemies.exit()
      .remove();

  // onCollision
  var onCollision = function() {
    updateBestScore();   
    gameStats.score = 0;
    gameStats.collision++;
    updateScore();  
    updateCollisionCount(); 
  };

  // throttled onCollision
  var throttledCollision = _.throttle(onCollision, 1000, {trailing: false});

  var checkCollision = function(enemy, cb) {
    // var r = parseFloat(enemy.attr('r'));
    // var minX = (parseFloat(enemy.attr('cx')) - r);
    // var minY = (parseFloat(enemy.attr('cy')) - r);

    // var maxX = (parseFloat(enemy.attr('cx')) + r);
    // var maxY = (parseFloat(enemy.attr('cy')) + r);

    // var currX = (parseFloat(player.element.attr('cx')));
    // var currY = (parseFloat(player.element.attr('cy')));

    // if(currX > minX && currX < maxX && currY > minY && currY < maxY) {
    //   if (enemy.inCollision === false) {
    //     console.log("collided!");
    //     cb();
    //     enemy.inCollision = true;
    //   }
    // } else {
    //   enemy.inCollision = false;
    // }

    //*Players x value
    var pX = parseFloat(player.element.attr('cx'));
    //*Players y value
    var pY = parseFloat(player.element.attr('cy'));
    //*Player r value
    var pR = parseFloat(player.element.attr('r'));
    //*Enemies x value
    var eX = parseFloat(enemy.attr('cx'));
    //*Enemies y value
    var eY = parseFloat(enemy.attr('cy'));
    //*Enemy r value
    var eR = parseFloat(enemy.attr('r'));
    //*Calculate Math.sqrt((px+ex)^2 + (py + ey)^2)
    var pythag = (Math.sqrt(Math.pow((pX - eX), 2) + Math.pow((pY - eY), 2)));
    if(pythag < (eR + pR)) {
      cb();
      // if (enemy.inCollision === false) {
      //   console.log('collided!');
      //   cb();
      //   enemy.inCollision = true;
      // }
    } 
    // else {
    //   enemy.inCollision = false;
    // }
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
      checkCollision(enemy, throttledCollision);

      var enemyNextPos = {
        x: (startPos.x + (endPos.x - startPos.x) * t),
        y: (startPos.y + (endPos.y - startPos.y) * t)
      };

      // Uncomment below to stop enemies
      // return enemy.attr('cx', startPos.x)
      //   .attr('cy', startPos.y);

      return enemy.attr('cx', enemyNextPos.x)
        .attr('cy', enemyNextPos.y);
    };

  };

  return enemies.transition()
    .duration(500)
    .attr('r', 25)
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

// d3.select('svg')
  // .on('mousemove', function() {
  //   player.x = d3.mouse(this)[0];
  //   player.y = d3.mouse(this)[1];
  // })
  // .on('mouseleave', function() {
  //   updateBestScore();
  //   gameStats.score = 0;
  //   gameStats.collision = 0;
  //   updateScore();
  //   updateCollisionCount();
  // });

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


