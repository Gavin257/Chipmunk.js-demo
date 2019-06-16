/**** Setup for the physic space ****/
var space = new cp.Space();
space.gravity = cp.v(0, 400);
space.sleepTimeThreshold = 0.5;
space.collisionSlop = 0.3;
var mouse = cp.v(0,0);

var blockRow = 0;
var gameState = true;

function init() {
    //Game State
    shootReady = true;
    score = 0,  ballLeft = 0, ballCount = 5;
    ballArray = [];
    blockArray = [];

    var ball = new Image();
    var block = new Image();
    var triangle = new  Image();
    var img = new Image();
    ball.src = "./source/ball.png";
    block.src = "./source/block.jpg";
    triangle.src = "./source/triangle.png";
    img.src = "./source/bg.jpg";

    canvas = document.getElementsByTagName("canvas")[0];
    canvas.height = 600;
    canvas.width = 400;
    ctx = canvas.getContext("2d");
    img.onload = function() {
        draw();
    }

    var i = 0;
    for (var i = 0; i < ballCount; i++) {
        ballArray[i] = addBall();
        ballArray[i].setPos(cp.v(200, 40));
        ballArray[i].applyForce(cp.v(0, -400), cp.vzero);
        ballArray[i].shapeList[0].group = "ball";
    }

    addBlock();
    addBlock();
    
}
init();
//Set up ground and walls.
var ceiling = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(10, 30), cp.v(390, 30), 2));
ceiling.setElasticity(1);
ceiling.setFriction(1);
ceiling.setCollisionType("CEILTYPE");

var ground = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(10, 590), cp.v(390, 590), 2));
ground.setElasticity(0);
ground.setFriction(1);
ground.setCollisionType("GROUNDTYPE");

var left = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(10, 30), cp.v(10, 590), 2));
left.setElasticity(1);
left.setFriction(0);

var right = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(390, 30), cp.v(390, 590), 2));
right.setElasticity(1);
right.setFriction(0);

var left_slope = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(10, 550), cp.v(190, 590), 2));
left_slope.setElasticity(0);
left_slope.setFriction(0);
left_slope.setCollisionType("SLOPETYPE");

var right_slope = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(390, 550), cp.v(210, 590), 2));
right_slope.setElasticity(0);
right_slope.setFriction(0);
right_slope.setCollisionType("SLOPETYPE");

function addBlock() {
    var width = 35;
    var height = 35;
    var mass = width * height * 1/1000;
    var radius = 20;
    var edge = 36;
    var lastBlockPositionX = 50;
    var offsetY = 90;
    var indexArray = [[50, 100, 150, 200, 250, 300, 350], 
                    [75, 125, 175, 225, 275, 325]];
    var blockNum = 2 + Math.floor(Math.random() * 2);

    for (var i = 0; i < blockArray.length; i++) {
        blockArray[i].p.y -= 50;
    }
    for (var j = 0; j < blockNum; j++) {
        var block = new cp.Body(Infinity, Infinity);
        blockArray.push(block);
        var ix = Math.floor(Math.random() * indexArray[blockRow%2].length);
        var tx = indexArray[blockRow%2][ix] //+ Math.floor(Math.random() * 20 - 10);
        var ty = canvas.height - offsetY// - Math.floor(Math.random() * 20 - 10);
        indexArray[blockRow%2].splice(ix, 1);
        block.setPos(cp.v(tx, ty));
        var ang = Math.random() * 2 - 1;
        block.setAngle(ang);

        var shapeSheet = [new cp.BoxShape(block, width, height),
        new cp.CircleShape(block, radius, cp.vzero),
        new cp.PolyShape(block, [-edge/2, -0.29*edge, 0, 0.58*edge, edge/2, -0.29*edge], cp.vzero)]
        shape = space.addShape(shapeSheet[Math.floor(3 * Math.random())]);
        shape.setFriction(0.3);
        shape.setElasticity(1);
        shape.setCollisionType("BLOCKTYPE");
        shape.life = 1 + Math.floor(Math.random() * score);      
    }
    blockRow++;
}

function addBall(x, y) {
    var x = x || 200;
    var y = y || 40;
    var radius = 10;
    var mass = 1;
    var moment = cp.momentForCircle(mass, 0, radius, cp.vzero);

    var ballBody = new cp.Body(mass, moment);
    this.space.addBody(ballBody);
    ballBody.setPos(cp.v(x, y));

    var ballShape = new cp.CircleShape(ballBody, radius, cp.vzero);
    this.space.addShape(ballShape);
    ballShape.setFriction(1);
    ballShape.setElasticity(0.6);
    ballShape.setCollisionType("BALLTYPE");

    return ballBody;
}

//Lock On
function lockOn() {
    var lockOnReady = false;
    var x, y, distance, distanceX, distanceY, sin, cos;
    var mindis = 170, maxdis = 400;
    var origin = cp.v(200, 40);
    var markX, markY;
    var markNum = 8;
    var markBall = [];
    canvas.onmousemove = function(e) {
        if (shootReady) {
            e.preventDefault();
            //var rect = canvas.getBoundingClientRect();
            x = e.clientX //- rect.left * (canvas.width / rect.width);
            y = e.clientY //- rect.top * (canvas.height / rect.height);
            distanceX = x - origin.x;
            distanceY = y - origin.y;
            distance = Math.sqrt(Math.pow((distanceX), 2) + Math.pow((distanceY), 2));       
            sin = distanceY / distance;
            cos = distanceX / distance;
            // //limit the length of line between mindis and maxdis.
            // if (distance < mindis || distance > maxdis)  {
            //     var ratio = (distance < mindis) ? mindis/distance : maxdis/distance;
            //     distance = distance * ratio;
            //     distanceX = distanceX * ratio;
            //     distanceY = distanceY * ratio;
            // }
            if (markBall.length != 0) {
                for (var i = 0; i < markBall.length; i ++) {
                    markX = origin.x + distanceX / markNum * (i + 1);
                    markY = origin.y + distanceY / markNum * (i + 1);
                    markBall[i].setPos(cp.v(markX, markY));
                }
            }
        }
    }
    canvas.onmousedown = function(e) {
        if (shootReady && distance) {
            if (lockOnReady) {
                for (var i = 0; i < markNum; i++) {
                    var shape = markBall[i].shapeList[0];
                    space.removeShape(shape);
                }
                var j = 0;
                for (var j = 0; j < ballCount; j++) {
                    //use IIFE to create a closure for setTimeout().
                    (function(j) {
                    setTimeout(function() {
                        var v0 = 500;
                        ballArray[j].setVel(cp.v(v0*cos, v0*sin));
                        }, j * 100);
                    })(j);
                }  
                lockOnReady = false; 
                shootReady = false;           
            } else {
                for (var i = 0; i < markNum; i ++) {
                    markBall[i] = new cp.Body(Infinity, Infinity);
                    markX = origin.x + distanceX / markNum * (i + 1);
                    markY = origin.y + distanceY / markNum * (i + 1);
                    markBall[i].setPos(cp.v(markX, markY));
                    var radius = 5;
                    var shape = space.addShape(new cp.CircleShape(markBall[i], radius, cp.vzero));
                    lockOnReady = true;
                }
            }
        } 
    }
}
lockOn();

//Collision Callback
var impulse = function(arbiter, space) {
    [ball, block] = arbiter.getShapes();
    if (ball.body.vx < 1e-8 && ball.body.vy < 1e-8) { //when the ball's velocity is slow enough, we think it static.
        ball.body.vy = -300;
    } 
}
var postStepRemove = function(block) {
    for (var i = 0; i < blockArray.length; i++) {
        if (blockArray[i] == block.body) {
            blockArray[i] = blockArray[blockArray.length - 1];
            blockArray.length--;
        }
    }
    space.removeShape(block);
}
var seperate = function(arbiter, space) {
    [ball, block] = arbiter.getShapes();
    block.life--;
    score++;
    if (block.life == 0) { //cannout set up like "block.life <= 0", which will result in removing the block twice.
        space.addPostStepCallback(postStepRemove.bind(null, block)); //use closure to remove blocks that life run out.
    }
    ball.body.f = cp.vzero;
}
space.addCollisionHandler("BALLTYPE", "BLOCKTYPE", 0, 0, impulse, seperate);

var presolve = function(arbiter, space) {
    [ball, slope] = arbiter.getShapes();
    ball.body.f = cp.vzero;
    return true;
} 
space.addCollisionHandler("BALLTYPE", "SLOPETYPE", 0, presolve, 0, 0);

var begin = function(arbiter) {
    [ball, ground] = arbiter.getShapes();

    ball.body.setPos(cp.v(200, 40));  
    ball.body.vx = 0;
    ball.body.vy = 0;
}

var resetNum = 0;
var reset = function(arbiter) {
    [ball, ground] = arbiter.getShapes();
    ball.body.f = cp.v(0, -400);
    ball.body.vx = 0;
    ball.body.vy = 0;

    resetNum++;
    if (resetNum == ballCount ) {
        space.addPostStepCallback(addBlock);
        shootReady = true;
        resetNum = 0;
        isGameOver();
    } 
}
space.addCollisionHandler("BALLTYPE", "GROUNDTYPE",begin, 0, 0, reset);

function isGameOver() {
    for(var i = 0; i < blockArray.length; i++) {
        if(blockArray[i].p.y <= 60) {
            gameState = false;
            shootReady = false;
            return;
        }
    }
}
/**** Visualization ****/
cp.PolyShape.prototype.draw = function(ctx)
{
    ctx.lineWidth = 1;
    ctx.beginPath();

    var verts = this.tVerts;
    var len = verts.length;
    var lastPoint = new cp.Vect(verts[len - 2], verts[len - 1]);
    ctx.moveTo(lastPoint.x, lastPoint.y);

    for(var i = 0; i < len; i+=2){
        var p = new cp.Vect(verts[i], verts[i+1]);
        ctx.lineTo(p.x, p.y);
    }
    ctx.fill();
    ctx.stroke();
};
cp.SegmentShape.prototype.draw = function(ctx) {
    ctx.lineWidth = Math.max(1, this.r * 2);
    drawLine(ctx, this.ta, this.tb);
};
cp.CircleShape.prototype.draw = function(ctx) {
    drawCircle(ctx, this.tc, this.r);
};
var drawLine = function(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
};
var drawCircle = function(ctx, c, radius) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
};
var drawRect = function(ctx, pos, size) {
    var pos_ = pos;
    var size_ = cp.v.sub(cp.v.add(pos, size), pos_);
    ctx.fillRect(pos_.x, pos_.y, size_.x, size_.y);
};

var draw = function() {
    //Add label
    //left
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font="20px microsoft yahei";
    ctx.fillStyle = "rgba(255,255,255)";
    ctx.textAlign = "left";
    ctx.fillText("Score: "+score, 10, 20);
    //right
    ctx.textAlign = "right";
    ctx.fillText("TotalBall: "+ ballCount, 395, 20);
    //center
    this.space.eachShape(function(shape) {
        ctx.fillStyle = "rgba(255,255,255)";
        ctx.strokeStyle = "rgba(255,255,255)";
        shape.draw(ctx);
        if (shape.life) {
            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillText(shape.life, shape.body.p.x+5, shape.body.p.y+5);
        }
    });
    //GameOver mark
    if(!gameState) {
        ctx.font = "40px Verdana";
        ctx.fillStyle = "#6DE16B";
        ctx.fillText("GAMEOVER", 310, 310);
    }
}
var raf = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

/*** Run the physic space ***/
drawFrame = function(time) {
    this.space.step(1/60);
    draw.call(this);
    raf(drawFrame);
}
drawFrame(0);