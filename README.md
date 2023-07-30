# 番茄小说阅读助手

自动滚动页面 + 快捷键翻页

## 使用

使用油猴脚本需要首先安装 TamperMonkey 拓展，也就是俗称的[油猴拓展](https://www.tampermonkey.net/index.php)

脚本安装地址：<https://greasyfork.org/zh-CN/scripts/472045-番茄小说阅读助手>

## 配置

没时间出配置 UI，暂时需要手动更改`localStorage`，key 为 `fanqie-zhushou-config`

#### 主配置（config）

| 字段名称          | 字段描述                                           | 默认值      |
| :---------------- | :------------------------------------------------- | :---------- |
| version           | 配置缓存版本号（若版本号不一致则讲重置为默认配置） | 20230730002 |
| width             | 阅读器宽度，支持百分比和 px                        | 80%         |
| hotKeys           | 快捷键（详见快捷键表）                             | -           |
| autoScrollSpeed   | 自动滚动速度，单位毫秒                             | 50          |
| autoJumpPageSpeed | 到底部后，等待多少秒自动翻页，单位毫秒             | 5000        |

#### 快捷键（config.hotKeys）

| 字段名称        | 字段描述           | 默认值     |
| :-------------- | :----------------- | :--------- |
| lastChapter     | 上一章快捷键       | ArrowLeft  |
| nextChapter     | 下一章快捷键       | ArrowRight |
| closeAutoScroll | 关闭自动滚动快捷键 | Escape     |

## 更新

### v0.2
- 支持上下无限滑动分页

### v0.1

- 快捷键翻页，`<-` 上一章 `->` 下一章，`-` 减慢页面滚动速度 `+` 加快页面滚动速度
- 工具条中新增自动页面滚动开关按钮，点击后开启，再次点击后关闭或`Esc`关闭
- 默认阅读视图宽度调整为 80%
- 去除工具条中的下载按钮
- 开启自动页面滚动后，滚动到底部将在 5s 后自动切换下一章

## 演示

![image](https://github.com/null-object-0000/fanqie-novel-assistant/assets/15605610/001a9940-85c4-40d4-b42b-3643e6af1c6a)
