/*
* 按键检测
* input.isKeyPressed(32) === input.isKeyPressed('space')
*/

define(function(require, exports, module) {

var host = this;
var states = {};

var input = {
	states : states,
	init	: function(elem) {
		
	},
	// 获取某键状态
	state : function(key) {
		return this.states[this.queryKeyCode(key)];
	},
	// 是否处于按下状态
	isKeyDown : function(key) {
		var st = this.state(key);
		return !!st && st.pressed;
	},
	isKeyUp : function(key) {
		var st =  this.state(key);
		return !!st && !st.pressed;
	},
	// 是否按下过，限定一帧内检测
	isKeyPressed : function(key /*string or number*/) {
		var st = this.state(key);
		return !!st && (!st.locked && st.pressed);
	},
	// 外部锁定，在每帧结束
	lock : function() {
		var s = states;
		Object.keys(s).forEach(function(k) {
			if (s[k].pressed) s[k].locked = true;
		})
	},
	// 获取键值对应的字母
	letterFromKeyCode : function(keyCode) {
		return String.fromCharCode(keyCode).toLowerCase();
	},
	queryKeyCode	: function(key) {
		return typeof key === 'string' ? keyMap[key.toLowerCase()] : key;
	},
	// 是否有任意键按下
	anyKeyDown : function() {
		var s = states;
		return Object.keys(s).some(function(k,v) {
			return s[k].pressed;
		})
	}
};

var keyMap = {
	// 主要部分
	backspace :8,
	back      :8,
	tab       :9,
	'\t'      :9,
	space     :32,
	' '       :32,
	
	'return'  :13,
	enter     :13,
	
	capslock  :20,
	caps      :20,
	
	escape    :27,
	esc       :27,
	
	';'       :186,
	'-'       :187,
	'='       :189,
	'`'       :192,
	','       :188,
	'.'       :190,
	'/'       :191,
	'['       :219,
	']'       :221,
	'\''      :222,
	'\\'      :220,

	'semicolon' :186,
	'minus'     :187,
	'equal'     :189,
	'accent'    :192,
	'comma'     :188,
	'period'    :190,
	'slash'     :191,
	'lbracket'  :219,
	'rbracket'  :221,
	'apostrophe':222,
	'backslash' :220,
	
	cmd       :91,
	command   :91,
	win       :91,
	windows   :91,
	
	rcmd      :92,
	rcommand  :92,
	rwin      :92,
	rwindows  :92,
	
	menu      :93,
	shift     :16,
	ctrl      :17,
	alt       :18,
	
	// 中部功能键
	pageup    :33,
	pagedown  :34,
	end       :35,
	home      :36,
	left      :37,
	up        :38,
	right     :39,
	down      :40,
	insert    :45,
	ins       :45,
	'delete'  :46,
	del       :46,
	scrolllock:145,
	
	pause     :19,
	'break'   :19,
	pausebreak:19,
	
	// 小键盘区域
	numlock   :144,
	'num/'    :111,
	'num*'    :106,
	'mum+'    :107,
	'mum-'    :109,
	'mum.'    :110,
	center    :12,
	
	mum0      :96,
	num1      :97,
	num2      :98,
	num3      :99,
	num4      :100,
	num5      :101,
	num6      :102,
	num7      :103,
	num8      :104,
	num9      :105,
	
	// 固定
	a         :65,
	b         :66,
	c         :67,
	d         :68,
	e         :69,
	f         :70,
	g         :71,
	h         :72,
	i         :73,
	j         :74,
	k         :75,
	l         :76,
	m         :77,
	n         :78,
	o         :79,
	p         :80,
	q         :81,
	r         :82,
	S         :83,
	t         :84,
	u         :85,
	v         :86,
	w         :87,
	x         :88,
	y         :89,
	z         :90,
	//
	0         :48,
	1         :49,
	2         :50,
	3         :51,
	4         :52,
	5         :53,
	6         :54,
	7         :55,
	8         :56,
	9         :57,
	//
	f1        :112,
	f2        :113,
	f3        :114,
	f4        :115,
	f5        :116,
	f6        :117,
	f7        :118,
	f8        :119,
	f9        :120,
	f10       :121,
	f11       :122,
	f12       :123
}

Object.freeze(keyMap);
input.keyMap = keyMap;

host.addEventListener('keyup',function(e) {
	input.states[e.keyCode] = { pressed : false };
},false);

host.addEventListener('keydown',function(e) {
	var state = states[e.keyCode];
	// keydown 能够连续触发，需要保持锁定状态
	if (state) {
		state.pressed = true;
	} else {
		states[e.keyCode] = { pressed : true };
	}
},false);

module.exports = input;

});