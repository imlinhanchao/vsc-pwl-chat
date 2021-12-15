# 摸鱼派聊天室 VSCode 扩展

基于摸鱼打工人社区——[摸鱼派](https://pwl.icu)开放 API 开发的聊天室扩展，可以在里面边写 Bug 边愉快地吹水摸鱼。 。

## 功能

- 💬 基本聊天吹水；
- 🧧 领取积分红包；
- 😎 内置表情(按下`:`加字母调出表情列表)和 `@` 提示；

![](media/preview.png)

## 扩展设置

还没有。

## Release Notes

### 0.0.2
- 加入积分红包领取功能。
- 加入`@`和内置表情提示。

### 0.0.1
- 完成初版。

## 前端调试说明
1. 按下 `Ctrl + Shift + P` 选择 `Task: Run Task`，运行 `vue serve` Task。
2. 按 `F5` 启动，调试前端代码使用 VSCode 的 Developer Tools (`Ctrl + Shift + I`)。
3. 在 Developer Tools 找到 `webviewview-pwl-chat-chatview` 中的 `active-frame` 中的 `localhost`，修改前端代码 (`views`目录) 会实时更新。
-----------------------------------------------------------------------------------------------------------
**Enjoy!**
