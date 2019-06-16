var height = 480; //界面的高度
var width = 640;//界面的宽度

/*** 物理空间 ***/
function World() {
	//初始化空间和重力
	this.space = new cp.Space();//创建空间
	var v = cp.v;//cp.v是chipmunk中定义的二维空间矢量
	this.space.gravity = v(0, 100);//设置重力矢量，重力数值越大，下落加速度越大

	//添加空间的边界条件。需要设置边界的形状、弹性系数、摩擦系数。
	this.addBoundary = function() {
		//设置左边界。
		var left = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v(0, 0), v(0, height), 2));
		//设置边界的弹性系数。0.0表示完全非弹性碰撞，1.0表示弹性碰撞。
		left.setElasticity(0.5);
		//设置摩擦系数。0.0表示无摩擦。
		left.setFriction(1);

		//设置右边界。
		var right = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v(width, 0), v(width, height), 2));
		right.setElasticity(0.5);
		right.setFriction(1);

		//设置上边界。
		var top = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v(0, 0), v(width, 0), 2));
		top.setElasticity(0.5);
		top.setFriction(1);

		//设置底边界。
		var bottom = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v(0, height), v(width, height), 2));
		bottom.setElasticity(0.5);
		bottom.setFriction(1);

		//添加阻挡方块
		var blockBody = new cp.Body(Infinity, Infinity);
		blockBody.setPos(cp.v(width/2, height*2/3));
		blockBody.setAngle(0.1);//设置方块偏转角度
		var block = this.space.addShape(new cp.BoxShape(blockBody, 50, 50),);
		block.setElasticity(1);
		block.setFriction(1);
	}

	//添加球体。首先需要在空间中创建一个刚体，为其赋予质量、转动惯量；
	//然后需要指名刚体的形状，这里我们创建的是球体，所以为物体添加一个圆形的形状
	this.addBody = function() {
		var radius = 25;
		var mass = 1;
		//设置球体的转动惯量，这里使用库中的一个函数计算其惯量
		var moment = cp.momentForCircle(mass, 0, radius, cp.vzero);
		//在空间中创建球体
		var ballBody = new cp.Body(mass, moment);
		this.space.addBody(ballBody);
		ballBody.setPos(v(width/2, height/3));
		//为球体添加形状
		var ballShape = new cp.CircleShape(ballBody, radius, cp.vzero);
		this.space.addShape(ballShape);
		ballShape.setFriction(1);
		ballShape.setElasticity(0.7);
	}
}


/*** 在画布中实现可视化 ***/
function Canvas() {
	var _this = this;
	this.cns = document.getElementsByTagName('canvas')[0];//设置画布大小
	this.cns.height = height;
	this.cns.width =  width;
	this.ctx =  this.cns.getContext('2d');
	this.drawLine = function(ctx, a, b) {
		this.ctx.beginPath();
		this.ctx.moveTo(a.x, a.y);
		this.ctx.lineTo(b.x, b.y);
		this.ctx.stroke();
	};
	this.drawCircle = function(ctx, c, radius) {
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.arc(c.x, c.y, radius, 0, 2*Math.PI, false);
		this.ctx.fill();
		this.ctx.stroke();
	};
	this.draw = function(world) {	
		_this.ctx.strokeStyle = 'white';
		_this.ctx.lineCap = 'round';

		_this.ctx.clearRect(0, 0, _this.cns.width, _this.cns.height);
		_this.ctx.font = "16px sans-serif";
		_this.ctx.lineCap = 'round';
		world.space.eachShape(function(shape) {
			_this.ctx.fillStyle = 'red'
			shape.draw(_this.ctx);
		})
	}
	cp.PolyShape.prototype.draw = function(ctx) {
	    ctx.lineWidth = 2;
	    ctx.beginPath();
	    ctx.fillStyle = 'blue';

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
		_this.drawLine(ctx, this.ta, this.tb);
	};
	cp.CircleShape.prototype.draw = function(ctx) {
		_this.drawCircle(ctx, this.tc, this.r);
		// 显示球体中的一条半径，从而可以清楚观察到球体的转动
		_this.drawLine(ctx,this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
	};
}

var raf = window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(callback) {
		return window.setTimeout(callback, 1000 / 60);
	};
var drawFrame = function() {
	var dt = 1/60;
	//每dt个时间步内更新空间。
	world.space.step(dt);
	//刷新画布图像
	canvas.draw.call(this, world);

	raf(drawFrame);
};

var world = new World();//（1）创建物理空间；
world.addBoundary();//（2）指定空间边界；
world.addBody();//（3）创建空间中的物体；（4）创建空间中的形状；
var canvas = new Canvas();//（5）连接精灵与物体（实现物体可视化）；
drawFrame();
