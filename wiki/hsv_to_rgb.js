
/*
// web color
rgb(255,0,0)
rgba(255,0,0,1)
rgb(100%,0%,0%)
rgba(100%,0%,0%,1)
hsl(0,100%,47%)


http://en.wikipedia.org/wiki/HSV_color_space
http://zh.wikipedia.org/zh-sg/HSL和HSV色彩空间
http://www.w3.org/TR/css3-color/
*/

var hsv_to_rgb = function(h,s,v) {
	var hi = Math.floor(h / 60),
    f = (h / 60) - hi,
		p = v * (1 - s),
		q = v * (1 - f*s),
		t = v * (1 - (1-f) * s);
	
	switch(hi){
		case 0 : return [v,t,p]
		case 1 : return [q,v,p]
		case 2 : return [p,v,t]
		case 3 : return [p,q,v]
		case 4 : return [t,p,v]
		case 5 : return [v,p,q]
	}
}

console.log( hsv_to_rgb(180,1,.94) );

