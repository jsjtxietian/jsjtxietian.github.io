---
title: 差生文具多之我的UE开发环境
tags:
  - GameDev
date: 2025-09-24
---



时隔4年重回Unreal开发，当然要发挥程序员的折腾精神稍微折腾下开发套件啦，毕竟差生文具多。

## Editor

我其实还是稍微纠结了下编辑器选什么的，现在的组合是[10x editor](https://www.10xeditor.com/)读代码&写代码 + 时不时起vs2022来debug。

先说下需求，我目前是要UE引擎项目进行源码阅读、修改和Debug，所以我希望它针对UE这么大的C++代码仓库，浏览代码和编写代码能尽可能快、准，启动速度也要快（其实是对各大编辑器的一次压力测试）。其实既然时不时需要调试的话，至少调试器这边只有vs和Rider这两个选择了，[raddebugger](https://github.com/EpicGamesExt/raddebugger) 或者[RemedyBG](https://remedybg.itch.io/remedybg)都还不太行，搜了下对UE调试还没说能到开箱即用的标准。

说下我研究下来的针对我的需求场景的编辑器体验：

* VS2022，debug体验不错，但是写代码体验太差了，界面有点丑，C++支持的准确度还行，但是慢不跟手。简单体验了下vs2026确实好一些，至少性能上体感能好一些，等正式版和UE的官方支持之后我应该会切过去，后面再观察吧。
* 10x editor：
  * 优点是真的快，智能提示、浏览代码、搜索、转到定义、查找引用、启动速度等等各种方面都是最快的；另外插件系统不错，可以自己写python，我就让ai写了个类似于gitlens的针对特定行blame然后打开网页的插件，很舒服；和VS的集成也很好，一键呼起VS，断点同步各种都有。用10x确实能像作者所说，因为the editor doesn't get in the way，所以我可以being in the zone.
  * 缺点嘛，首先是付费的，75rmb一个月；其次，小bug有，我高强度用了一个月已经提了两三个issue了，其他bug还好，C++ parser的bug会影响我对它的信任；最后就是，写代码的时候错误提示展示比较一般，往往编译了才发现有问题。感觉最主要的还是，10x要付钱，容易让我吹毛求疵。

* Rider，是真的不错，各方面都很均衡，速度很快，编码体验也不错，Rider理论上是付费的但我也在白嫖中。我不喜欢的点在于，功能太多太复杂了，默认那个界面花里胡哨的，我花了很大的力气关掉所有gutter图标、各种各样的代码智能检查（我就算知道了UE这个函数可以改成static我也不会去改啊）、莫名其妙在Explorer里把UE仓库的文件标成青色背景、意义不明的顶栏菜单等等。一通折腾下来看着和vscode的界面差不多了，终于舒服了。
* vscode，zed，fleet这些都不太行：vscode和zed都是基于clangd的，很折腾，也许ykiko的[clice](https://github.com/clice-io/clice)成了能好些；fleet说了UE支持不在考虑范围内。

其实就编辑器而言，最好的组合大概是resharper c++插件 + vscode上，那我应该很高兴去用，有vscode的编码体验+插件生态和jetbrain的C++支持就太爽了。另外就是有时候也要去看看ts或者python代码，确实vscode不错。目前是10x editor阅读代码 + 写代码，必要时起vs2022调试（所有编辑器的键位都以vscode为准）。主要是反正有下文介绍的live++，大部分时候不需要起Debugger，所以写代码体验好就行。题外话，我挺喜欢用两款独立的软件分别负责代码编写和调试的，本来做的事情其实就不太一样。

说实话可能以后不想折腾了还是会用Rider吧，各项能力都比较均衡，而且已经被我调教好了。



### Update clangd

研究了下clangd和Unreal，太长不看：基本可以work，但是UE那边tooling有点差。

简单用了下，占用内存10G左右，准确度没啥大问题，速度会卡下，第一次加载很慢很慢。我现在是客户端和引擎两个平行的文件夹，UE的build工具只会生成一个compile commands，我把里面的东西手动拆开来到两个文件夹里面，客户端的归客户端，引擎的归引擎，这俩文件夹放在一个workspace里是可用的。另外就是要跑单独的命令来生成compile commands，如果要每次build都自动生成是要改东西的，这算是UE不重视，不是clangd的问题。

`UnrealBuildTool.exe -Target=ProductEditor Win64 Development -project="xxx.uproject" -mode=GenerateClangDatabase`

优势是基于vscode，可以看其他脚本不用切换editor，另外gitlens等插件很加分。



## Live++

Live++是Unreal4.22开始支持的live coding背后的技术，可以hot reload C++代码。我就直接关掉UE自带的那个Live Coding，加上这个插件[LivePP2](https://github.com/brickadia/LivePP2)稍微设置下就行。只要不改头文件（因为不会跑UBT或者UHT），不管是改客户端的C++代码还是引擎的C++代码，也不管编辑器是10x还是vs还是rider，通通Ctrl+Alt+F11热重载，5s就能看到反馈，如风一般的写码体验。

很喜欢[官网上](https://liveplusplus.tech/testimonials.html)这个Quote，我们搞游戏的是这样的:

> Programmers are supposed to be smart. Stopping execution of a program, rebuilding, linking the entire codebase and restarting the whole process has never seemed a smart thing to do.

当然Live++是有限制的，官网有写一些，我自己也遇到过问题问了下开发者：[Hot reload UE_LOG's content does not work](https://github.com/MolecularMatters/lpp_public/issues/23)，但这些相比其带来的迭代速度提升，都是小问题。甚至Debug crash都能如风一样，见[Fixing bugs in style with Live++](https://blog.s-schoener.com/2024-12-16-liveplusplus-debug/)，基于SEH能做到很酷的事情。

甚至还有hot deoptimize这种debug神器，来自[Erik Jansson](https://x.com/CaffeineViking/status/1850074293519974589)：

> using debug builds to debug your game is a great way to waste time. it can take minutes to load into a production level. release with symbols is the way to go, and if I need source line-level precision I just recompile the offending file with Live++ without optimizations.

当然，又是一个付费工具。10欧一个月，我直接买了一年。这钱花得值，至少我不会和给10x付钱时候一样稍微有点犹豫。



## AI

简单提一下我现在用的AI工具：

* Gemini 2.5 pro，在网页上日常问点编程问题，也会用来deep research一个我不怎么熟悉的领域，挺好用的，谷歌也大方，学生可以免费用（虽然我不是）。
* Qwen code，说实话代码能力我觉得一般，但是读读比较独立的代码也够了（可能是因为我没充钱，白嫖的每天2000免费次数）。优势就是cli工具的优势，以及白嫖额度够高。

选择这俩的原因，一是因为可以白嫖，二是受到公司ip的限制，所以选择也不多。以后会去试试Claude Code + Kimi/ds or Codex之类，不过写代码暂时也不是我工作的瓶颈，就还好。


### Update Claude Code

试了下glm和ds，都还可以，ds聪明些。用来读代码非常方便，写UE C++就算了，除非我拆很细，但那时候我自己都写完了。



## Profiler

Profiler可以单独起一篇文章，这里大概说下我现在针对windows上UE CPU优化的探索：

* 先看Unreal insights，Unreal自带的性能分析工具。确实UE5的好用了很多，trace server的理念也很好。因为是Unreal引擎自身的打点，所以信息很多，看WP加载、函数耗时、Task依赖等都很好用。
* 基于采样的[Superluminal](https://superluminal.eu/)，win上采样频率可以到8k hz，适合细看Unreal insights找到的耗时很高的函数，或者整体上看下整个时间段内热点在哪儿。当然，又是一个付费工具:) 免费的WPA或者vtune也都可以，Superluminal相对用着更顺滑一些，有一些统计功能很好用，也会捕捉线程之间的同步关系。我觉得唯一一个小的可以改进的地方就是希望支持一下火焰图这种可视化方式，我之前稍微研究了下把win下录制的etl文件丢给[samply](https://github.com/mstange/samply)然后转成firefox profiler可以读取的火焰图，但是那个库的pdb读取有点[问题](https://github.com/mstange/samply/issues/677)，后面有时间准备用C#自己写个。
  * Update：见[从ETW到Firefox Profiler火焰图](https://jsjtxietian.github.io/2025/10/21/etw2gecko/)
* 还是不知道为啥耗时就上芯片商提供的[Intel® VTune™ Profiler](https://www.intel.com/content/www/us/en/docs/vtune-profiler/get-started-guide/2025-4/overview.html)，这我以前写过，不细说[CPU性能 —— 单核篇](https://jsjtxietian.github.io/2024/08/19/perf_single_core/)

做Win平台真开心啊，工具多且好用。



## 总结

首先吐槽下，自己真就是一个付费上班。

自己就是做性能的，所以我选工具，除了功能以外，最看重的就是能不能提升我的迭代速度，那一般来说工具本身的性能肯定也要很好。

我太了解自己了，编译要等20分钟的时候，怎么可能继续工作呢，肯定去刷刷知乎 or X摸鱼啊，所以我很认同[Wassim Alhajomar](https://x.com/Wassimulator/status/1957805300716622213)：

> The reason we need better software isn’t just to "shave milliseconds".  When a simple build takes minutes, the cost of iteration rewires your brain. You stop exploring ideas and start avoiding them. And that’s fatal, because iteration is the essence of invention.  Slow tools don’t just waste time. They reshape thought, teaching you to fear the very process that drives progress. Bad software doesn’t kill productivity. It strangles imagination.

我偏爱的这三个，10x，Superluminal和Live++都符合这一点。而且他们基本都算是个人开发的，没有大公司病，接受反馈和迭代都很快，找他们也能找到人：我给10x提的几个bug大部分都是隔天修完，也可以去discord直接找作者问；Live++的作者github issue也基本隔天回，在X也很活跃；Superluminal更绝，工具里就有个chat按钮可以直接和作者聊天问问题。所以我愿意支持他们，因为我希望他们能继续让游戏开发变得更加舒适。这些工具（也包括[raddebugger](https://github.com/EpicGamesExt/raddebugger)和[File Pilot](https://filepilot.tech/)等）给我展示了软件可以变得更快更好，如果以后我有自己的产品也希望它能如此，让使用者有如沐春风的感觉。

基本的工具探索现在已经差不多了，以后我进入新的领域应该会继续进行新的工具试用与探索，或者vibe coding自己写。我认为不断优化自己的工具是很重要的，能让我多点时间摸鱼。当然我承认这里有一种对于完美的焦虑，往好了说是我刻意优化自己的习惯，往坏了说是完美主义的焦虑，我其实不希望大部分的时间和情绪都消耗在这种最优选择的陷阱里，所以目前就这样也挺好。

