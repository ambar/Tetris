/*
* 墙面
* 属性：网格地图，宽度为舞台最大单位列数，高度为舞台最大行数
*/
define(function(require, exports, module) {

var wo     = require('../wo/wo');
var stage  = require('../wo/stage');
var Entity = require('../wo/entities').Entity;

var Brick  = require('./brick');
var drawer = require('./brickdrawer');

var TetrisWall = Entity.extend({
	map   : [],
	width : 0,
	height: 0,
	init : function() {
		this._super();

		this.width = TetrisGame.maxCols;
		this.height = TetrisGame.maxRows;

		// template row, fill with zero
		var tmplRow = wo.repeat(0,this.width);

		Object.defineProperties(this,{
			rows : {
				get : function() { return this.map }
			},
			cols : {
				get : function() { return Brick.rotateShape(this.map,true) }
			},
			tmplRow : {
				get : function() { return tmplRow.slice() }
			}
		});

		this.map = [];
		this.height.times(function() {
			this.map.push(this.tmplRow)
		},this);

	},
	draw : function(ctx) {
		var self = this;
		this.map.forEach(function(row,y) {
			row.forEach(function(type,x) {
				type && drawer.draw(ctx,x,y,type);
			})
		})
	},
	inspect : function(full,empty) {
		full || (full = '■')
		empty || (empty = '□')
		var lf = '\n', sp = ' ';
		var results = this.map.map(function(row) {
			return row.map(function(type) {
				return type && full || empty
			}).join(sp)
		});
		return lf + results.join(lf) + lf;
	},
	update : function() {
		
	},
	/*
	* occupy the empty slot
	* @brk {Brick}
	*/
	add : function(brk) {
		var map = this.map;
		// var valid = this.collideWith(brk.parts);
		brk.parts.forEach(function(p) {
			if(p.x>=0 && p.x <=this.width && p.y >=0 && p.y <=this.height)
			map[p.y][p.x] = brk.type;
		},this);
		stage.remove(brk);
		this.eraseRows();
		Brick.spawn()
	},
	/*getBrickType : function(x,y) {
		return this.map[x][y] || null;
	},*/
	/*
	* detect every cell and bottom edge collision
	* @vectors {Array}
	*/
	collideWith : function(vectors) {
		var map = this.map, height = this.height;
		return vectors.some(function(v) {
			var row = map[v.y];
			return v.y >= height || (row && row[v.x]);
		})
	},
	/*detect left and right edge collision*/
	edgeCollideWith : function(vectors) {
		var width = this.width;
		return vectors.some(function(p) {
			return p.x < 0 || p.x >= width;
		})
	},
	eraseRow : function(idx) {
		// var map = this.map.slice();
		var map = this.map;
		map.splice(idx,1);
		map.unshift(this.tmplRow);
		// this.map = map;
	},
	eraseRows : function() {
		var rows = this.getFullRows(), len = rows.length;
		if(len){
			rows.forEach(this.eraseRow, this)
			this.emit('eraseRows', len)
		}
	},
	getFullRows : function() {
		return this.rows
			.map(function(row, i) {
				var full = row.every(function(e) {
					return e !== 0;
				});
				return full && i
			})
			.filter(Boolean)
	}
});

module.exports = TetrisWall;

});