define(function(require, exports, module) {

exports.array = {
	/*
	* Order an array by function or key
	* usage ->
	* orderBy(persons,function(){ return this.age }
	* orderBy(persons,'age')
	*/
	orderBy : function(ary,fn) {
		var f = typeof fn === 'function' ? fn : function(){ return this[fn] };
		var comparator = function(a,b){
			a = f.call(a,a), b = f.call(b,b);
			return a > b ? 1 : a < b ? -1 : 0;
		};
		return ary.slice().sort(comparator);
	},
	maxBy : function(ary,fn) {
		return this.orderBy(ary,fn).last();
	},
	minBy : function(ary,fn) {
		return this.orderBy(ary,fn).first();
	}
}

});