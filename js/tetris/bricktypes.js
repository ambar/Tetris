/*
* 所有砖块(Tetrominoes)形状及颜色

* ref : http://en.wikipedia.org/wiki/File:Tetrominoes_IJLO_STZ_Worlds.svg
Z hsv(0,100%,94%)
L hsv(40,100%,94%) 
O hsv(60,100%,94%) 
H hsv(120,100%,94%)
J hsv(240,100%,94%)
T hsv(280,100%,94%)
I hsv(180,100%,94%)

*/

define(function(require, exports, module) {

var HSLColor = require('./hslcolor');

// todo : 颜色应该与形状弱相关
// var BrickType 
module.exports = {
	Z : {
		color : new HSLColor(0,1,.47),
		shape : [
			[1,1,0],
			[0,1,1]
		]
	},
	L : {
		color : new HSLColor(40,1,.47),
		shape : [
			[1,1,1],
			[1,0,0]
		]
	},
	O : {
		color : new HSLColor(60,1,.47),
		shape : [
			[1,1],
			[1,1],
		]
	},
	S : {
		color : new HSLColor(120,1,.47),
		shape : [
			[0,1,1],
			[1,1,0]
		]
	},
	I : {
		color : new HSLColor(180,1,.47),
		shape : [
			[0,0,0,0],
			[1,1,1,1],
			[0,0,0,0]
		]
	},
	J : {
		color : new HSLColor(240,1,.47),
		shape : [
			[1,1,1],
			[0,0,1]
		]
	},
	T : {
		color : new HSLColor(280,1,.47),
		shape : [
			[0,1,0],
			[1,1,1]
		]
	},
	U : {
		color : new HSLColor(320,1,.47),
		shape : [
			[1,0,1],
			[1,1,1]
		]
	},
}

});