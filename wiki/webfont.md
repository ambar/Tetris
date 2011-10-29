## 兼容性

ie支持eot格式
firefox、chrome支持ttf

各浏览器都支持 **woff**，优点：

> Cross-browser, web-only font format that uses gzip compression. IE9+, FF3.6+, Chrome 5+

我使用的字体'Dot Matrix'来自：
http://dionaea.com/information/fonts.php

## 自己服务器

需要预先定义 @font-face 选择器，并且可以任意命名字体：

```
@font-face { 
	font-family: DotMatrixBold; 
	src: url('media/dotmbold-webfont.woff') format("woff"); 
} 
```

字体多格式转换工具，转换后有多种排版格式预览，极力推荐：
[@FONT-FACE GENERATOR](http://www.fontsquirrel.com/fontface/generator)

## google 服务器

资源列表：
http://www.google.com/webfonts

只要加入 link 就可以了：

```
<link href='http://fonts.googleapis.com/css?family=Sancreek|The+Girl+Next+Door' rel='stylesheet' type='text/css'>
```

## MIME

.eot	application/vnd.ms-fontobject
.ttf	application/octet-stream
.woff	application/x-font-woff

## 有价值链接

[Bulletproof @font-face syntax](http://paulirish.com/2009/bulletproof-font-face-implementation-syntax/)
[Web fonts with @font-face](http://www.css3.info/preview/web-fonts-with-font-face/)
[CSS @ Ten: The Next Big Thing](http://www.alistapart.com/articles/cssatten)
[WOFF 使用指南](http://www.typeisbeautiful.com/2010/01/1903)