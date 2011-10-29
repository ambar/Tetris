/*
* 所有游戏逻辑
*/
define(function(require, exports, module) {

// requires lib objects
var wo = require('../wo/wo'),
	input        = require('../wo/input'),
	stage        = require('../wo/stage'),
	V            = require('../wo/vector'),
	Color        = require('../wo/color').Color,
	EventEmitter = require('../wo/events').EventEmitter,
	entities     = require('../wo/entities');

var $       = wo.$query
var pressed = input.letterFromKeyCode;
var Entity  = entities.Entity,GameText = entities.GameText;

// require game objects
var Brick       = require('./brick');
var TetrisWall  = require('./wall');
var brickDrawer = require('./brickdrawer');
var bg          = require('./background');

var host = this, win = host, doc = host.document;
var $score, $fps, $level;

// private props
var w, h; // 宽、高
var unit = 40, // 网络单位长度，
	scale        = 1, // 画布缩放比例
	fps          = 12, // 初始帧数
	fps_curr     = 12, //
	lvl_curr     = 0, // 
	lvl_up_score = 8000, // 
	score        = 0, //
	arrow_keys   = [37,38,39,40], // 方向键，禁止默认卷屏
	max_unit_x   = 0, // 横向最大单位
	max_unit_y   = 0, // 纵向最大单位
	game_lose    = false,
	game_started = false, 
	show_grid    = true, // 显示网格
	wall         = null, // 墙面地图
	grid         = null, // 背景网格
	paused_text  = null, // 暂停显示文本
	bg_ctx       = null, // 背景画布
	next_ctx     = null; // 预览‘下一个’画布

var unit_in_px = function(pixel) {
	return Math.ceil( pixel / unit )
};

var rand_pos = function() {
	return V([rand(max_unit_x-1),rand(max_unit_y-1)])
}

var gen_text = function(text) {
	var txt = new GameText(stage.width/2,stage.height/2,text,unit*1.5);
	var panel = document.querySelector('#snake-game-wrapper .panel')
	var fontFamily = document.defaultView.getComputedStyle(panel).getPropertyValue('font-family');
	// 'cursive, Comic Sans MS';
	txt.fontFamily = fontFamily;
	return txt
}

var game_init = function (canvas,cols,rows,scale) {
	w = unit * cols, h = unit * rows;
	
	stage.init(canvas,w,h,scale)

	max_unit_x = unit_in_px(w);
	max_unit_y = unit_in_px(h);

	$fps   = $('#tetris-fps')
	$score = $('#tetris-score')
	$level = $('#tetris-level')

	bg_ctx   = $('#snake-game-bg').getContext('2d')
	next_ctx = $('#snake-game-next').getContext('2d')

	bg_ctx.canvas.parentNode.style.width  = stage.width * scale + 'px';
  bg_ctx.canvas.parentNode.style.height = stage.height * scale + 'px';

	bg.init(bg_ctx);

	brickDrawer.resetCanvas(bg_ctx,cols,rows,scale);
	
	paused_text = gen_text('PAUSED');

	game_play();

	win.addEventListener('keydown',function(e) {
		var key = e.keyCode;
		// prevent page scroll
		if( arrow_keys.indexOf(key) > -1 ){
			e.preventDefault();
		}
		switch( pressed(key) ){
			case 'r' : {
				game_restart();
				break;
			}
			case 'p' : {
				stage.running = !stage.running;
				break;
			}
			case 'c' : {
				brickDrawer.randomizeTheme();
				brickDrawer.drawPreview(Brick.instances.next);
				if(game_lose){
					stage.drawAll();
				}
				break;
			}
			case 'd' : {
				TetrisGame.showGrid = !TetrisGame.showGrid;
				break;
			}
		}
	},false);

}

// 
var fib = function() {
	var iter = function(n,a,b,idx) {
		if(idx === ~~(n/2)) return n % 2 ? b : a;
		return iter(n,a+b,a+b+b,idx+1);
	}
	return function(n) {
		return iter(n,0,1,0)
	}
}();

 set_game_level = function(lvl) {	
 	if(lvl < lvl_curr) return;
	fps_curr = stage.fps = fps + (lvl-1) * 5;
	$level.text(lvl_curr = lvl);
}

var game_play = function() {
	if(game_started) return;
	
	reset_state();
	set_game_level(1);

	wall = new TetrisWall();
	wall.on('eraseRows',function(e,rows) {
		score += rows === 1 ? 100 : fib(rows+2) * 100;
		$score.text(score);

		set_game_level( Math.floor( score / lvl_up_score ) )
	})
	stage.add(wall);
		
	if(show_grid){
		bg.draw();
	}

	stage.on('update',function() {
		$fps && $fps.text(this.fpsNow);
	})

	Brick.spawn();

	stage.on('pause',function() {
		if( !game_lose ){
			stage.add(paused_text);
			stage.once('run',function() {
				stage.remove(paused_text);
			})
		}
	});

	/*brk = new Brick(6,7,BrickType.J,wall);
	brk.gravity = V.zero;
	brk.rotate();
	brk.rotate();
	brk.rotate();
	stage.add(brk)*/

	// brk = new Brick(6,7,BrickType.J);
	// stage.add( brk )
	// stage.add( new Brick(1,2,BrickType.O) )
	// stage.add( new Brick(5,2,BrickType.S) )	

	// stage.add( new Brick(1,7,BrickType.Z) )
	// stage.add( new Brick(8,9,BrickType.L) )

	// stage.add( new Brick(1,14,BrickType.T) )
	// stage.add( new Brick(7,14,BrickType.I) )

	// stage.add( new Brick(5,11,BrickType.U) )
	
}

var game_restart = function() {
	stage.reset().run();
	game_play();	
}
var reset_state = function() {
	$score.text(score = 0);
	lvl_curr  = 0;
	fps_curr  = stage.fps = fps;
	game_lose = game_started = false;
	Brick.resetInstances();	
}

var TetrisGame = Object.create({},{
	unit	: {
		get : function() { return unit },
		set : function(value) { return unit = value }
	},
	score : {
		get : function() { return score }
	},
	fps : {
		get : function() { return fps_curr }
	},
	showGrid : {
		get : function() { return show_grid },
		set : function(value) {
			if(!!value !== show_grid){
				show_grid = value;
				show_grid ? bg.draw() : bg.clear();
			}
		}
	},
	bgContext : {
		get : function() { return bg_ctx }
	},
	nextContext : {
		get : function() { return next_ctx }
	},
	maxCols : {
		get : function() { return max_unit_x }
	},
	maxRows : {
		get : function() { return max_unit_y }
	},
	wall : {
		get : function() { return wall }
	},
	theme : {
		get : function() { return brickDrawer.currentTheme },
		set : function(value) { brickDrawer.currentTheme = value }
	},
	init : {
		value : game_init
	},
	play : {
		value : game_play
	},
	restart : {
		value : game_restart
	}
});

Object.extend(TetrisGame,EventEmitter);

TetrisGame.on('lose',function() {
	game_lose = true;
	stage.add( gen_text('GAME OVER') );
	// dirty delay hack
	setTimeout(stage.pause.bind(stage));
})

module.exports = host.TetrisGame = TetrisGame;;

});