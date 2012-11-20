define(function(require, exports, module) {

	module.exports =
		window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback,element){
			window.setTimeout(callback, 1000 / 60);
		};

});