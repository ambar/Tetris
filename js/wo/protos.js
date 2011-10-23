// protos
define(function(require, exports, module) {

	HTMLElement.prototype.bind = function (type,fn) {
		this.addEventListener(type,fn,true);
		return this;
	}
	
	HTMLElement.prototype.text = function (text) {
		this.textContent = text;
		return this;
	}

	Number.prototype.times = function(action,scope){
		var i = 0, n = this.valueOf(), scope = scope || this;
		n < 0 && (n=0);
		while(i<n)
			action.call(scope,i++);
	};

	Array.prototype.first = function(){
	    return this[0];
	}
	
	Array.prototype.last = function(){
		return this[this.length-1];
	}
	
	Array.prototype.removeAt = function(idx,num) {
		return this.splice(idx,num || 1);;
	}
	
	Array.prototype.remove = function(value,greedy) {
		var ls = this, i = 0, len = ls.length;
		for(;i<len;i++){
			if( ls[i]===value ){
				ls.removeAt(i);
				if(!greedy) break;
			}
		}
		return ls;
	}

});