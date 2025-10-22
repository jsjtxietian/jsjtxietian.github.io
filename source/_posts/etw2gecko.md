---
title: 从ETW到Firefox Profiler火焰图
tags:
  - Perf
  - Vibe
date: 2025-10-21
---

如在[之前一篇blog](https://jsjtxietian.github.io/2025/09/24/unreal_tool/#Profiler)中所说，要在Windows上看C++游戏的性能的话，Superluminal非常好用，数据收集非常全面，但有一个小问题是在可视化展示方面——如果我想优化某个特定函数，想观察到那个特定函数内部的时间分布情况，或者我想看一段时间内整体的性能消耗，Superluminal自带的Callgraph和Function list有点费眼睛（Source & Disassembly视图则只有一层），不如火焰图直观。

之前研究[Simpleperf](https://jsjtxietian.github.io/2025/02/12/simpleperf/)的时候就很喜欢[Firefox Profiler](https://profiler.firefox.com/)的火焰图UI，在我看来除了火焰图本身的优点以外，值得一提的是：

* 不需要安装什么东西，Firefox Profiler就是个网页，用着不舒服也可以自己fork下来修改
* 数据格式是开源的，[processed-profile-format.md](https://github.com/firefox-devtools/profiler/blob/main/docs-developer/processed-profile-format.md)，方便自己进行后处理
* 借用[这里](https://android.googlesource.com/platform/system/extras/+/master/simpleperf/doc/view_the_profile.md#Firefox-Profiler-great-chronological-UI)所说：Firefox Profiler has a great chronological view, as it doesn't pre-aggregate similar stack traces like pprof does. 对游戏而言可以观察不同时间段的性能变化，也可以缩放到某一帧去看当帧的耗时情况，很灵活
* 使用起来比较流畅，视觉设计也还行，搜索、过滤等等功能都挺实用，而且自带分享

所以现在的问题变成了，给定了Superluminal采集的ETW数据的情况下，该怎么把其转化为Firefox Profiler支持的格式。

当时我脑子里有这个想法，但是在忙其他的就没有太仔细地研究。后面机缘巧合偶然看到这个Rust写的flamegraph库[flamegraph-rs/flamegraph](https://github.com/flamegraph-rs/flamegraph)，虽然不符合我的需求（多说一句，在Win上还支持基于[DTrace](https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/dtrace)的采样，挺有意思的），但是发现Readme里介绍了[mstange/samply](https://github.com/mstange/samply)，samply is a command line CPU profiler which uses the Firefox profiler as its UI，这不就是我想要的么！试用了下确实挺不错的，符合需求，作者很强，也是firefox profiler的核心贡献者。而且更进一步，不仅实现了异步符号化，还集成了source view——在火焰图的函数上双击即可跳转到源代码进行查阅。

但是我在我们游戏测试的时候发现了一个严重的问题，samply依赖的PDB解析工具会crash: [thread 'tokio-runtime-worker' panicked when Symbolicating](https://github.com/mstange/samply/issues/677)，大概率是这个crate: [afranchuk/pdb](https://github.com/afranchuk/pdb)的实现有哪里有问题，所以被我否了（倒不是我不想给它修，PDB毕竟不是公开的文件格式，会有点麻烦）。相比之下我发现的另一个issue: [Unreal's GameThread is missing in profile.json but present in .etl file](https://github.com/mstange/samply/issues/674)，倒是小问题了，只要作者同意随手就可以修了。

又是一段时间的停滞，期间我有想过让AI vibe coding一个端到端解决这个需求的工具，果不其然都失败了；也让Gemini和Perplexity都去搜索了下相应的工具和库，也没给出啥insight，但AI找到了这个库[TraceEventLibrary](https://github.com/microsoft/perfview/blob/main/documentation/TraceEvent/TraceEventLibrary.md)，确实是有用的。

然后因为WPA的火焰图实在是用起来不太舒服，我偶然找到了[profile-explorer](https://github.com/microsoft/profile-explorer)，准备玩玩。然后我突然看到了那个项目有个github的tag，[etw · GitHub Topics](https://github.com/topics/etw)，在下面就找到了我想要的，[xoofx/ultra: An advanced profiler for .NET Applications on Windows](https://github.com/xoofx/ultra)。没想到啊没想到，最后还是靠tag这么古老的方案，而AI没帮上忙。当然我也理解，ultra上写着大大的`for .NET Applications on Windows`，AI大概也没意识到其实这也可以用来直接采样native的程序。

简单玩了下之后，给作者提了几点来讨论：[Issues when use ultra to profile native cpp game ](https://github.com/xoofx/ultra/issues/24)，作者没回我就点了个赞，倒是也还行。我自己fork下来简单改了改把我提的前两点都改了，基本能用了。当然这主要是给.Net程序用的，里面有一些我不需要的东西，但暂时不影响也不去管了。下次我再需要大量进行profile的时候应该会再改改测测，加点我想要的东西（Update：刚说完就来了俩要用到这个的活儿，乌鸦嘴啊）。

说实话这么细分的需求，没啥人做我是理解的，能找到的感觉真好（不用自己去解析ETW了）。然后一路下来发现那么多工具都可以参与讨论改进，参与开源还是挺开心的其实。





