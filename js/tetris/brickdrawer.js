define(function(require, exports, module) {

var rand      = require('../wo/wo').rand;
var V         = require('../wo/vector');
var HSLColor  = require('./hslcolor');
var BrickType = require('./bricktypes');

/*
* 主题绘制器，内部
* 格式 { name : drawer }
*/

var default_color = new HSLColor(180,0,.47);
var themeDrawers = {
	// default drawer
	classic : function(ctx,x,y,type) {
		var unit = TetrisGame.unit;
		var px = x * unit, py = y * unit, side = unit*.15;

		// todo: {Color} => {HSLColor}
		var color    = type.color instanceof HSLColor ? type.color : default_color
		var color_ct = color.toString();
		var color_tp = color.multiplyComponent(1,.876,1.78).toString();
		var color_lr = color.multiplyComponent(1,1,.9).toString();
		var color_bt = color.multiplyComponent(1,1,.5).toString();

		ctx.translate(px,py);
		// 外内矩形各四个顶点
		var a = [0,0], b = [unit,0], c = [0,unit], d = [unit,unit];
		var A = [side,side], B = [unit-side, side],C = [side,unit-side], D = [unit-side,unit-side];

		var draw_area = function(points,color) {
			var first = points.shift();

			ctx.beginPath();
			ctx.moveTo(first[0],first[1]);
			points.forEach(function(p) {
				ctx.lineTo(p[0], p[1]);
			})
			ctx.closePath();

			ctx.fillStyle = color;
			ctx.fill();
		}

		var stroke_line = function(p1,p2,color) {
			
			ctx.beginPath();
			ctx.moveTo(p1[0],p1[1]);
			ctx.lineTo(p2[0], p2[1]);
			ctx.closePath();

			ctx.lineWidth   = 1;
			ctx.strokeStyle = color;
			ctx.stroke();
		}

		// 多边形，砖块五部分
		draw_area([a,A,B,b],color_tp) // 上
		draw_area([a,A,C,c],color_lr) // 左
		draw_area([b,B,D,d],color_lr) // 右
		draw_area([A,B,D,C],color_ct) // 中
		draw_area([c,C,D,d],color_bt) // 底

		// 消弱黑色的斜边
		stroke_line(A,a,color_tp);
		stroke_line(B,b,color_tp);
		stroke_line(C,c,color_bt);
		stroke_line(D,d,color_bt);

		ctx.translate(-px,-py);
	},
	window : function(ctx,x,y,type) {
		var unit = TetrisGame.unit;
		var x = x * unit, y = y * unit;
		var w = unit, h = unit, rad = unit/5;

		var hsl = type.color;
		ctx.strokeStyle = hsl.multiplyComponent(1,.98,.4).toString();
		ctx.fillStyle = hsl.toString();
		ctx.lineJoin = 'round';
		ctx.lineWidth = rad;

		ctx.strokeRect(x+rad/2, y+rad/2, w-rad, h-rad);
		ctx.fillRect(x+rad/2, y+rad/2, w-rad, h-rad);
	},
	bubble : function(ctx,x,y,type) {
		var unit = TetrisGame.unit;
		var pi = Math.PI, r = unit/2;
		var x = (x+1)*unit-unit/2, y = (y+1)*unit-unit/2
		ctx.save();
		ctx.translate(x,y);

		var radgrad = ctx.createRadialGradient(0,0,0,0,0,r);

		var color = type.color.toRGB();

		(3).times(function(i) {
			color.a = .1+i*.07;
			radgrad.addColorStop(.65+i*.1, color);
		});

		(7).times(function(i) {
			color.a = .5+i*.05;
			radgrad.addColorStop(.93+i*.01, color);
		})
		
		ctx.beginPath();
		ctx.fillStyle = radgrad;
		ctx.arc(0,0,r,0,pi*2,1);
		ctx.fill();

		// 高亮，反光部位
		var reflect_r = r/7;
		ctx.fillStyle = 'rgba(255,255,255,.8)';
		ctx.beginPath();		
		ctx.translate(-r/2,-r/2);
		ctx.rotate(-pi/4);
		ctx.scale(1,1/2);
		ctx.arc(0,0,reflect_r,0,pi*2,1);
		ctx.fill();

		ctx.translate(-x,-y);
		ctx.restore();
	}
}

/*
* 代理方法，注入主题绘制器，拦截所有调用，检查缓存：
* 有：使用缓存绘制单元格
* 无：缓存绘制后的单元格
*/
var cachedData = {};
Object.keys(themeDrawers).forEach(function(name) {
	var _old = themeDrawers[name]; 
	themeDrawers[name] = function(ctx,x,y,type) {
		var unit  = TetrisGame.unit, cache_key = name+'.'+type.id;
		var px    = x * unit, py = y * unit;

		var cache = cachedData[cache_key];
		if(cache){
			ctx.putImageData(cache,px,py);
		}else{
			_old.apply(null,arguments);
			cachedData[cache_key] = ctx.getImageData(px, py, unit, unit);
		}
	}
});

/*
* 提供给外部的砖块绘制 API 
*/
// private
var currentTheme = 'classic';
var brickDrawer = Object.create({},{
	themes : {
		get : function() { return Object.keys(themeDrawers) }
	},
	currentTheme : {
		get : function() { return currentTheme },
		set : function(value) {
			if( currentTheme !== value && this.themes.indexOf(value) > -1 ){
				currentTheme = value
			}
		}
	},
	randomizeTheme : {
		value : function() {
			var themes = this.themes.filter(function(t) {
				return t !== this.currentTheme;
			},this);
			
			this.currentTheme = themes[ rand(themes.length-1) ];			
		}
	},
	draw : {
		value : function(ctx,x,y,type) {
			themeDrawers[this.currentTheme].apply(null,arguments);
		}
	},
	/*
	* 绘制‘下一个’砖块预览
	* 起始坐标平移到 0，0，再绘制
	*/
	drawPreview : {
		value : function(brk) {
			if(!brk) return;

			var ctx = TetrisGame.nextContext, parts = brk.parts;

			var translate = function(vec){
			    return parts.map(function(p){
			        return p.add(vec);
			    });
			}
			var min_by = function(ary,prop){
			    return Math.min.apply(null, ary.map(function(p){ return p[prop]; }) )
			}
			var max_by = function(ary,prop){
			    return Math.max.apply(null, ary.map(function(p){ return p[prop]; }) )
			}
			
			var left_top = V([min_by(parts,'x'), min_by(parts,'y')]);
			var right_bottom = V([max_by(parts,'x'), max_by(parts,'y')])
			
			var translated = translate( left_top.mul(-1) );
			
			// var ins = function(v){ return v.inspect() };
			// console.log(left_top,right_bottom,translated.map(ins));

			this.resetCanvas(ctx, right_bottom.x-left_top.x+1, right_bottom.y-left_top.y+1);

			translated.forEach(function(p) {
				this.draw(ctx,p.x,p.y,brk.type);
			},this)
		}
	},
	resetCanvas : {
		value : function(ctx,uw,uh,scale) {
			var unit = TetrisGame.unit, w = uw * unit, h = uh * unit;
			ctx.canvas.width = w;
			ctx.canvas.height = h;

			ctx.canvas.style.width = w*scale+'px';
			ctx.canvas.style.height = h*scale+'px';
		}
	}
})

module.exports = brickDrawer;

});