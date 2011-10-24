define(function(require, exports, module) {

var wo = require('../wo/wo'),
	input = require('../wo/input'),
	stage = require('../wo/stage'),
	V = require('../wo/vector'),
	Entity = require('../wo/entities').Entity;

var BrickType = require('./bricktypes');
var drawer = require('./brickdrawer');
var util = require('./util');

/*var EMPTY = 0;*/

var Brick = Entity.extend({
	wall : null,
	parts : [],
	shape : [],
	position : V.zero,
	gravity : V.down,
	init : function(x,y,type,wall) {
		this._super();
		this.wall = wall;
		this.type = type;

		this.position = V([x,y])
		this.shape = this.type.shape.slice();
		this.parts = Brick.mapShape(this.position,this.shape);
		
		// 防止它出生就失重了 =_=
		this._input_locked = input.isKeyDown('down');
	},
	draw : function(ctx) {
		var type = this.type;
		this.parts.forEach(function(p) {
			drawer.draw(ctx,p.x,p.y,type)
		})
	},
	/*旋转不能导致砌砖，只能重力才能*/
	move : function(direction) {
		if( !direction || direction.eq(V.zero) ){
			return false;
		}
		var down = direction === this.gravity;
		var new_parts = this.mapParts(direction);

		// 与已有砖块碰撞 or 与地面碰撞
		if( this.wall.collideWith(new_parts) ){
			if( down ){
				this.emit('remove');
				this.wall.add(this);
			}
			return false;
		}

		// 与左右墙碰撞
		if( !down && this.wall.edgeCollideWith(new_parts) ){
			return false;
		}

		this.parts = new_parts;
		this.position = this.position.add(direction)

		return true;
	},
	moveDown : function() {
		this.move(this.gravity);
	},
	// try translate
	mapParts : function(vector) {
		return this.parts.map(function(p) {
			return p.add(vector);
		})
	},
	update : function() {		
		
		var direction;
		// isKeyDown  isKeyPressed
		if( input.isKeyDown('left') ){
			direction = V.left;
		}
		if( input.isKeyDown('right') ){
			direction = V.right;
		}
		// 左右
		this.move(direction);

		if( input.isKeyDown('up') ){
			this.rotateThrottled();
		}
		
		// 让砖块欢快地坠落
		if( !this._input_locked && input.isKeyDown('down') ){
			stage.fps = 60;
			this.moveDown();
			return;
		}else if( input.isKeyUp('down') ){
			stage.fps = TetrisGame.fps;
			this._input_locked = false;
		}

		// hack:提高旋转的优先级
		if( stage.frameCount % 3 ) return;
		this.moveDown();
	},
	// 内部调用
	rotate : function() {
		var new_shape = Brick.rotateShape(this.shape);
		var new_parts = Brick.mapShape(this.position, new_shape )
		// todo 靠墙变形 
		if( !this.wall.collideWith(new_parts) && !this.wall.edgeCollideWith(new_parts) ){
			this.shape = new_shape;
			this.parts = new_parts;
		}
	},
	// 可视速度内的持续变形能力，‘高手’或心急的人使用，也许不要太快
	rotateThrottled : wo.throttle(100,function() {
		this.rotate();
	})
});



/*
* 旋转一个形状(二维数组定义)
* 默认顺时针旋转，第二个参数为 true 时直接转置它
* @shape {array} 
* @transpose {bool} 
*/
Brick.rotateShape = function(shape,transpose){ 
	var ret = [], row, rows = shape.length, cols = shape[0].length, transpose = !!transpose;
	cols.times(function(y){
		ret.push(row = [])
		rows.times(function(x){
			row[transpose ? 'push' : 'unshift']( shape[x][y] )
		})
	})
	return ret;
}
/*
* 以一个形状(二维数组)的左下角为参照位置，把它映射成一个位置列表(一维数组)
* 零为空位，全部舍弃
* @pos {vector}
* @shape {array}
*/
Brick.mapShape = function(pos,shape) {
	shape =  shape.slice().reverse()
	var ret = [], rows = shape.length, cols = shape[0].length;
	rows.times(function(x){
		cols.times(function(y){
			shape[x][y] && ret.push( pos.add( V([y,-x]) ) )
		});
	});
	return ret;
}

/*
* 随机生成一个砖块
* 使整体外形部分，横向置中，纵向恰在屏幕之外
*/
Brick.random = function() {
	var types = Object.keys(BrickType), type = BrickType[ types[wo.rand(types.length-1)] ];
	var shape = type.shape , h = shape.length, w = shape.first().length;
	
	// var brk = new Brick( 0,0, BrickType.L, wall );
	var brk = new Brick( Math.ceil( (TetrisGame.maxCols-w)/2 ), -h, type, TetrisGame.wall );
	return brk;
}

/*
* 生成一个游戏用的砖块
* 当屏幕中还有活动的砖块时，返回 null 
*/
Brick.spawn = function() {

	if( Brick.instances.current ) return null;
	if( !Brick.instances.next ){
		Brick.instances.next = Brick.random()
	};

	var brk = Brick.instances.current = Brick.instances.next;

	// 让底部出现在屏幕首行
	var vec_btm = util.array.maxBy(brk.parts,'y');
	var translate = V( [0,-vec_btm.y] );
	var new_parts = brk.mapParts(translate);

	if( TetrisGame.wall.collideWith(new_parts) ){
		TetrisGame.emit('lose');
		return null;
	}

	brk.parts = new_parts;
	brk.position = brk.position.add(translate);

	// draw next
	drawer.drawPreview( Brick.instances.next = Brick.random() );

	brk.once('remove',function() {
		// 被拼到墙壁后重置帧率，防止连续下坠
		stage.fps = TetrisGame.fps;
		Brick.instances.current = null;
	})
	stage.add(brk);

	return brk;
}

Brick.instances = {
	next : null,
	current : null,
}

Brick.resetInstances = function() {
	Brick.instances.current = Brick.instances.next = null;
}

module.exports = Brick;

});