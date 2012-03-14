define(function(require, exports, module) {

var stage = require('../wo/stage');

var inited = false, ctx = null;

var draw_grid = function () {
	ctx.beginPath();

	ctx.lineWidth = .1;
	ctx.strokeStyle = 'rgba(238,238,238,1)';

	var text = function (text, x, y, color) {
		ctx.font = '10px Tahoma';
		ctx.textAlign = 'center';
		ctx.fillStyle = color || 'rgba(204,204,204,.5)';
		ctx.fillText(text, x, y);
	}
	var unit = TetrisGame.unit, w = stage.width, h = stage.height;
	var row = h / unit, col = w / unit, half = unit / 2;

	row.times(function (y) {
		var end = unit * y
		col.times(function (x) {
			var begin = unit * x
			// 横轴
			ctx.moveTo(0, end)
			ctx.lineTo(w, end)
			// 纵轴
			ctx.moveTo(begin, 0)
			ctx.lineTo(begin, h)
			// debug 标记
			// text(x+','+y,begin+half,end+half)
		})
	})

	ctx.stroke()
	ctx.closePath();
};

exports.init = function(bg_ctx) {
	ctx = bg_ctx;
	inited = true;
};

exports.draw = function() {
	if(!inited) return;
	clear();
	draw_grid();
}

var clear = exports.clear = function() {
	ctx.clearRect(0,0,stage.width,stage.height);
} 

});