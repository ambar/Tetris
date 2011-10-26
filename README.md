我第三个动画游戏。

# 俄罗斯方块

## 试玩
[Demo](http://ambar.github.com/Tetris/)

## 截图
![preview.png](https://github.com/ambar/Tetris/raw/master/preview.png)

## 起源

* [俄羅斯方塊](zh.wikipedia.org/zh/俄羅斯方塊)
* [Tetris](http://en.wikipedia.org/wiki/Tetris)

## 所得

见 [NOTE.md](https://github.com/ambar/Tetris/blob/master/NOTE.md) 总结

游戏代码用 AMD 方式组织，加载器挑选了国人写的 [seajs](https://github.com/seajs/seajs)。

## 发布

使用 [spm](https://github.com/seajs/spm):

```
spm build game.js --combine
```

所有模块文件将打包到一个文件——这里默认位置是‘__build/game.js’。

然后用 AMD 加载器加载它，游戏就成功运行了。比如 seajs 的方式：

```
<script src="js/sea.js" data-main="__build/game.js"></script>
```

## 使用

```
// 网格单位长度, 默认 40
// TetrisGame.unit = 20;

// 显示网格线, 默认 true
TetrisGame.showGrid = true;

// 主题类型 ["classic", "window", "bubble"], 默认 classic
// TetrisGame.theme = 'window';

// canvas,列数，行数，缩放
TetrisGame.init('#snake-game',10,20,1);
// TetrisGame.init('#snake-game',10,20,.5);
```