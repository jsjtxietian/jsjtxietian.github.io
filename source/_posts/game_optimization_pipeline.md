---
title: 游戏性能优化管线(施工中)
tags:
  - GameDev
  - Performance
date: 2024-10-17
---



## 游戏优化的特点

* 游戏优化讲究的是在一帧的时间内，很快地完成1000件不同的事情。游戏性能最直观的标准是帧率，每帧时间越短，帧率自然越高。但是帧率本身是分层的目标：30帧，60帧，120帧等等。举个例子，如果frame pacing没处理好的话，不稳定的40帧的给玩家带来的体验是不如稳定的30帧的。
* Everything has a budget, and you need to keep to it so the game is playable. 卡顿非常影响体验，所以需要为最坏情况打算。
* 游戏本身的模块相当多，每个模块的逻辑都有区别，很难有一招鲜吃遍天的情况，更别提GPU相关的优化所需要的手段和CPU的就完全不同，都需要具体分析。
* 游戏项目一般时间紧迫，很多时候只能抓大放小，定位瓶颈然后制定计划优化。要考虑投入产出比，优化的风险（是否可热更）。优化是权衡的艺术，砍美术资源当然是最快的优化方案，但是会让美术、策划不高兴。



## 流程与工具

### 规范

* 整体：确定目标硬件和目标性能，硬件分档，制定每一档的性能目标。

* 美术：尽可能早设立和使用每一档的美术标准，包括地图、模型、贴图、特效（粒子）的制作规范等等，完善相应的资源静态与动态检查工具（特效性能检测工具、地图离线检测、自动跑图等）。
  * 进阶：美术提前按重要性分层，按照性能压力可以依次关闭不重要的显示效果。

* 代码：确立代码规范，静态代码分析工具，可以在提交代码前就报警：例如高频GC操作、在Update中打log等。




### Benchmark

* 定时自动性能测试（自动跑图、Replay等）并记录数据，发现明显的性能regression自动报警。
  * 进阶：可以有自动化的归因，例如发现了FPS的regression，可以自动diff出耗时变长的模块；发现内存变多，可以自动抓快照对比出变多的内存条目；启动/加载时间变长，自动对比分析出变长的原因。

* 定时资源轮播、对比：在目标机型上加载所有的资源，可以记录加载资源的耗时、内存等；可以进行不同版本之间的比较，资源数量的控制。



### 趁手工具

* 代码中尽早准备好相关的接口，可以做到按性能配置加载不同配置的资源、特效等
* GM开关，可以一键加载或关闭任意UI组件/地图区块/特效等，定位热点资源很有用；信息Panel，显示当前关键的性能数据
* 内网/本地热更机制 or 类似的加速迭代的机制 or 极快的打包速度，有利于修复性能问题时候的迭代速度
* 有一个强大的工具组，开发数个典型的性能测试场景（包括图形、脚本等等），并尽量保持跨版本的稳定性，可以当作性能测试与优化的playground
* 全自动化的性能对比机制，比如给一个包，指定某个机型，对比其打开关闭某个功能/开关之后的性能，自动形成性能报告提供给开发来分析。方便做某个活动开启 or 关闭的性能分析，或者是某个优化的效果对比。



## 他山之石

### Automated Testing and Profiling for Call of Duty

[Automated Testing and Profiling for Call of Duty - YouTube](https://www.youtube.com/watch?v=8d0wzyiikXM)

安利了buildbot，但是还是觉得不够好，自己写了一个叫compass的系统，负责打包、测试等。

主要职责：

* **CI**（Triggers for every check-in, aim to complete < 30 minutes, multiple builds in parallel）：Compile game code and tools code；Converting assets；Running the game on 3-4 maps on all platforms；Other tests: Device Debug, Dedicated Server, Unit tests.

* **All Maps**（Complete < 1h, one build at a time）：Boot testing every map in the game.

* **Release Build**：Build a full packaged version of the game；These builds are sent to QA or can potentially be put on disc；Can take a while to complete

* **Branch Maintenance**：Automatic merge down from stable->less stable；Gated merges are managed from less stable -> stable ones



一目了然的可视化：

![image-20241105125643594](./../Assets/game_optimization_pipeline/image-20241105125643594.png)

一些特点：

* 如果commit太多，build server会自动跳过一些task
* 可以把鼠标悬浮到红色的方块上直接预览报错是啥
* 自动测试自带截图，方便trouble shooting
* 把资源监控也集成到了管线中，例如，可以查看shader编译后的数量变化、资源分类大小等等，并且查看是哪条commit导致的变化
* Nightly性能监控：QA跑地图，记录下觉得卡的地方；Compass会自动把player传送到那些地方，静止30s，并且录制性能数据；悬浮可以预览截图与变化，点击方格可以去到详细信息

![image-20241105163652046](./../Assets/game_optimization_pipeline/image-20241105163652046.png)

![image-20241105163704645](./../Assets/game_optimization_pipeline/image-20241105163704645.png)



关于错误处理：

* Error Key，一句话总结失败原因；Error Bucket包含所有有相同的Error Key的task；Error Book，记录了所有build过程中遇到过的问题，方便trouble shoot
* Auto Retry，可以根据Error Bucket来配置



其他一些点：Compass Configuration as Code（Python），讨论了一些优劣点。利用Puppet来分发软件，考虑迁移到Windows Docker。Metrics tracking/graphing using InflusxDB/Grafana



### ENGINE OPTIMIZATION POWERED BY BIG DATA 

Life of an expert:

* FIND a suspicious function
* GATHER more information
* COMPARE & dig the code
* ISSUE IDENTIFIED?

主要是在讲用大数据和AI加速这个过程。



从这张图来看，他们的引擎似乎主要以Task为基础，而且Task可以关联到asset等信息，主要的信息就是以Task为基础，这应该极大方便了数据的收集与整合，也方便Profile。

![image-20241105205732725](./../Assets/game_optimization_pipeline/image-20241105205732725.png)



A performance analysis pipeline. 长期的数据收集：

![image-20241105210902937](./../Assets/game_optimization_pipeline/image-20241105210902937.png)

经过Data transformation，数据的保存也是分两份的：

![image-20241105210851019](./../Assets/game_optimization_pipeline/image-20241105210851019.png)

分析阶段，Dashboard以Task为基础，很“数据分析”：

![image-20241105210634386](./../Assets/game_optimization_pipeline/image-20241105210634386.png)

![image-20241105210739492](./../Assets/game_optimization_pipeline/image-20241105210739492.png)

Asset projection，感觉就是个Outlier检测：

![image-20241105210535314](./../Assets/game_optimization_pipeline/image-20241105210535314.png)



利用xAI来帮助专家找到bottleneck和regression，pinpoint the tasks that are delaying your frames：

![image-20241105211255379](./../Assets/game_optimization_pipeline/image-20241105211255379.png)

Train a neural network on tasks execution time, task lineage and children to predict by how much a given task would delay a frame. dataset comes from years of manually annotated profiling files that engineers have collected, analyzed and proposed fixes for. Hyperparameters are updated Bi-monthly：

![image-20241105211333621](./../Assets/game_optimization_pipeline/image-20241105211333621.png)

In the end, when one of our play session contains a regression - or delay for a frame - a profiling file is collected and automatically analyzed. 

We pass the task through the neural net to estimate each task's weight in the captured regression.

Using these weights, engineers know which tasks are the most likely to be causing the frame delay by increasing the e2e time of the critical path. 

They can focus their time where it matters the most to reach the frame generation time.



### PUSHING THE LIMITS OF VIDEO GAME PERFORMANCE

思考过程：

* IS Y MS TOO MUCH FOR X?
* DOES IT ALWAYS HAPPEN?
* DOES IT HAPPEN ON ALL PLATFORMS ?
* WHAT’S THE IMPACT ON THE FRAME ?
* Question your life choices and make you reconsider your engine optimization specialty.



也提到了上一篇的管线



进一步，引入SZZ，predict the performance impact of a code change without actually profiling it & predict the likelihood that a given change will make us break our frame timing

TASK SCHEDULER SELECTION







## 草稿

TODO:

* 游戏 + 动态追踪技术 ？ => 模仿帧同步的高性能log打点
* 关键指标的收集（影响性能的核心数据）



## 总结

欢迎提issue交流：[Issues · jsjtxietian/jsjtxietian.github.io](https://github.com/jsjtxietian/jsjtxietian.github.io/issues)

