# snookerTerminal
一个简单的斯诺克命令行工具，可以用来看比赛和查一些基本数据

## 使用
`npm install snookerterminal -g`
安装完成之后即在命令行使用`snooker`命令

## API
### `-l --livescore`
输出当前正在进行的比分直播
### `-t --today`
输出今日赛程
### `-r --ranking [length]`
输出当前的世界排名，接收一个参数，表示输出至多少位，如16则表示输出当前世界排名的前16位
### `--interval [seconds]`
与比分直播共同使用，表示输出间隔，如果不提供则需要手动刷新
