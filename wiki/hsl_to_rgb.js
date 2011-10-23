/* 
http://www.w3.org/TR/css3-color/

HOW TO RETURN hsl.to.rgb(h, s, l): 
   SELECT: 
  l<=0.5: PUT l*(s+1) IN m2
  ELSE: PUT l+s-l*s IN m2
   PUT l*2-m2 IN m1
   PUT hue.to.rgb(m1, m2, h+1/3) IN r
   PUT hue.to.rgb(m1, m2, h    ) IN g
   PUT hue.to.rgb(m1, m2, h-1/3) IN b
   RETURN (r, g, b)

HOW TO RETURN hue.to.rgb(m1, m2, h): 
   IF h<0: PUT h+1 IN h
   IF h>1: PUT h-1 IN h
   IF h*6<1: RETURN m1+(m2-m1)*h*6
   IF h*2<1: RETURN m2
   IF h*3<2: RETURN m1+(m2-m1)*(2/3-h)*6
   RETURN m1

*/

/*
hue 色相 0°~360°
saturation 饱和度 0~1
lightness 亮度 0~1
*/

function hsl_to_rgb(h,s,l) {
    var m1,m2,r,g,b, h = h / 360;

    if(l <= .5) m2 = l * (s + 1);
    else m2 = l + s - l * s;

    m1 = l * 2 - m2
    r = hue_to_rgb(m1, m2,h + 1/3);
    g = hue_to_rgb(m1, m2,h );
    b = hue_to_rgb(m1, m2,h - 1/3);

    return [r,g,b].map(function(n) {
      return Math.round(n*0xff)
    });
}

function hue_to_rgb(m1, m2, h) {
    if ( h < 0 ) h += 1;
    if ( h > 1 ) h -= 1;
    if ( h*6 < 1 ) return m1 + (m2 - m1) * 6 * h;
    if ( h*2 < 1 ) return m2;
    if ( h*3 < 2 ) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
}

console.log( hsl_to_rgb(180, 1, .47) );