/*
* 引导入口, 启动游戏
*/
define(function(require, exports, module) {
	
	var TetrisGame = require('./tetris/tetris');

	// 网格单位长度, 默认 40
	// TetrisGame.unit = 20;
	
	// 显示网格线, 默认 true
	// TetrisGame.showGrid = false;

	// 主题类型 ["classic", "window", "bubble"]
	TetrisGame.theme = 'classic';
	
	// canvas,列数，行数，缩放
	TetrisGame.init('#snake-game',10,20,1);
	// TetrisGame.init('#snake-game',10,20,.5);
	// TetrisGame.init('#snake-game',40,20,1);	
})