---
title: Simpleperf踩坑记
tags:
  - GameDev
  - Performance
date: 2025-02-12
---





在写[游戏性能优化管线](https://jsjtxietian.github.io/2024/10/17/game_optimization_pipeline/)的时候，我就想着能不能自己在现在的项目里推动一下相关的建设。正好问了问在腾讯搞metaperf的朋友，他们metaperf的采集端在安卓上确实只是 simpleperf 的封装，所以我想在自己做的游戏上也试试simpleperf，对于做帧率优化和卡顿优化应该是不小的帮助，尤其是目前我们并没有采样release下堆栈的手段，可观测性极差。



## 踩坑

遇到的主要的坑是，**对于libunity.so，simpleperf采样出来之后解出来的symbol名字错到离谱**，最开始并不知道该怎么查。

最开始我发现的信息是libil2cpp.so的符号是正确被解出来了，但是libunity.so的错误了，于是首先就是怀疑是不是libunity.so本身有问题。后面通过自己造了个crash对着看了下，发现so里的符号和地址对应没问题。

此时就进入了乱猜时间，是不是和unity的strip engine code的设置有关、是不是和unity版本有关(unity2022还是unity2018)、是不是`gecko_profile_generator.py`脚本有问题、是不是手机上还残存了上一个包的符号文件、是不是和ndk版本有关（比如要和做包的版本一致）、是不是和手机有关等等。实验组合的数量爆炸了，我有点没有方向，像无头苍蝇一样疯狂乱试（我记得自己之前有采样到过正确的，但是概率很低）。

后面想到，perfetto也可以采样堆栈，是不是可以看看perfetto采样的结果，来交叉对比下是libunity.so的问题，还是simpleperf的问题。果然perfetto用unity2022的libunity.so解符号也是错的，我当时就觉得是不是so有问题。但这就进入死路了，明明之前发现so里的地址和符号对应没问题，难道是unity的so有啥神奇之处导致这俩工具都坏了？而且libil2cpp.so是可以正常解的。我自己用官方的版本做了个demo来看，发现也有这个问题。

后面在和吉林小伙聊的时候，我自己发现了一个奇怪的log: `local_symbolizer.cc:526 Correcting load bias by 5505024 for /data/app/xxx/lib/arm64/libunity.so`，对应到代码大概是：

```c++
 if (binary->load_bias > load_bias) { 
   // On Android 10, there was a bug in libunwindstack that would incorrectly 
   // calculate the load_bias, and thus the relative PC. This would end up in 
   // frames that made no sense. We can fix this up after the fact if we 
   // detect this situation. 
   load_bias_correction = binary->load_bias - load_bias; 
   PERFETTO_LOG("Correcting load bias by %" PRIu64 " for %s", 
                load_bias_correction, mapping_name.c_str()); 
 } 
```

看着就有问题，因为我造crash的时候用的地址并没有偏移，也就是说perfetto为了修图里说的bug (这里：[e7228a7 - platform/external/perfetto - Git at Google](https://android.googlesource.com/platform/external/perfetto/+/e7228a7))，自己帮我偏移了一个值导致符号名字错乱，issue提了：[Perfetto incorrectly resolves symbol names in libunity.so · Issue #1005 · google/perfetto](https://github.com/google/perfetto/issues/1005)

然后吉林小伙帮我逆向了下，把这个if直接nop掉了，然后我测了下，对于unity2022的libunity.so，结果对了；perfetto用unity2018的libunity.so就不会有这个log，因此一直是对的。到这里为止其实pertetto已经没问题了，但是由于项目的测试机安卓版本都很低，还是需要研究下simpleperf的。因此就开始怀疑是unity2022的libunity.so本身有点问题，导致perfetto和simpleperf都做了一些操作绕过这个问题。但是我简单看了看simpleperf的代码，并没有类似的代码，但我还是先提了issue：[BUG Simperf incorrectly resolves symbol names in libunity.so · Issue #2125 · android/ndk](https://github.com/android/ndk/issues/2125)

此时对于unity2022的libunity.so**似乎**找到了问题，但是simpleperf解unity2018的libunity.so依然有问题：不知为啥出来的符号只有一层，所以没法形成libunity.so内部的调用堆栈。我能确定perfetto解unity2018的libunity.so没有问题，simpleperf相关的只能继续去试。后面我发现，对于no strip engine code的包，simpleperf解不出名字，但是有正确的裸地址形成的堆栈，我下意识就怀疑是不是simpleperf就不支持strip过的so，虽然我觉得有点没道理（crash堆栈都可以解），但是这里也说不要strip：Click on **Player Settings** and set the Stripping Level property to Disabled（[Simpleperf  | Android NDK  | Android Developers](https://developer.android.com/ndk/guides/simpleperf)）

后面再细看发现，我们出包时候，对于no strip engine code的包，不会生成libunity.so的符号文件；也就是说，当不给libunity的符号的时候，simpleperf能采出正确的裸地址堆栈。我当时的笔记是：

> simpleperf跑18的strip过的libunity只有一层符号，跑没strip的可以有原始的堆栈，但是一旦给了符号就还是只有一层。
>
> 跑22的libunity有堆栈错误，也可能只有一层 ; 不提供符号 libunity的大部分会被解到 _MultiplyMatrixArrayWithBase4x4_NEON。

另外我提的关于simpleperf的issue有人回我了，我学到可以使用`simpleperf dump perf.data`来debug（好心人是教我怎么看build id，看下so和对应符号文件是不是build id能对应上），我dump了一下不提供符号文件时unity2022的libunity.so下跑出来的perf.data，发现虽然大部分被解到了矩阵乘法，但是裸地址是对的（我自己写了脚本调用llvm-addr2line来解，被解到`_MultiplyMatrixArrayWithBase4x4_NEON`算是预期之内，因为so本身确实没啥符号）；dump了一下提供符号文件时unity2022跑出来的perf.data，发现确实堆栈只有一层，裸地址就有问题。

此时，问题终于清晰了：**和是不是no strip无关，如果我提供libunity.so给手机上的simpleperf来让其在手机上直接解符号名字，就会出问题**（传`-lib xxx`给`app_profiler.py`，符号文件默认会被推到` /data/local/tmp/native_libs/`）；如果我不提供符号，则simpleperf能采样到正确的裸地址，然后我可以自己写脚本来解（后面研究发现也不需要自己写，把相同build id的符号文件丢进binary_cache然后传给其他report相关的脚本即可）。unity2018和2022的区别在于，如果推送符号，对于2018，结果是正确的但是只有一层；对于2022，结果就是错误的。

其实我早就想看下裸的地址堆栈，但是因为2022下不提供符号 libunity的大部分会被解到`_MultiplyMatrixArrayWithBase4x4_NEON`，我就以为simpleperf没这个功能（或者说，我下意识以为simpleperf的perf.data不保留裸地址，也是看到dump才知道其实perf.data里面除了符号还是记录了地址的，但是转到 gecko-profile.json就没了）。后面也是在一次次的实验中，大概了解了simpleperf的工作原理，还是小伙说得对，不要用太高层的脚本封装，从底层去理解这些（小伙还说simpleperf采的地址指定是正确的，因为这是系统支持的，小伙真是好人）。确实最开始没想到问题在这里，没想到地址在哪边resolve是造成这个bug的原因，我已经在simpleperf的issue中提供了一些发现，等官方来看看吧。

接下来就很简单了：使用`app_profiler`的时候，不要提供`-lib`参数，等拿到了perf.data之后，把符号文件丢进binary_cache，然后提供`--symfs .\binary_cache`给其他report的脚本来解符号。这么做还有一个原因，我们的libil2cpp.so太大了（将近2G），armv7的手机本来也不可能在手机上去解libil2cpp的符号。



## What if

就我个人而言，我当然是觉得我很欢迎去下下来simpleperf的源码慢慢调试的，但是时间有限，这本身也是我的side project，不可能花那么多时间去慢慢debug，因此采取了比较快速的试错法来研究。回头看有很多的what if：

* 如果一开始就记录下每次的实验条件与log，那么后面可能不会有那么多次无效实验，可以翻看之前的试验记录来确认问题（当然也不能对自己太严苛，虽说要记录所有东西，但是在不知道问题的时候，很可能也不知道该记录什么）。
* 如果一开始更加专注一些，不要让实验的scope太大（条件组合数量爆炸），也能节约很多精力。整体来看，虽然对比perfetto和simpleperf、unity2018还是2022的libunity.so等让我踩了点坑，但对比分析还是帮了很多忙。
* 如果做到下面的，就能更快速帮助我定位问题：
  * 一开始抛开高层的脚本从底层命令来使用simpleperf，可能会就更加理解simpleperf的工作原理（关于binary_cache，native_lib，build id，symbol位置等等）
  * 一开始就认真读文档来了解simpleperf，发现dump和no-dump-symbols等命令
  * 一开始就更了解堆栈采样、libunwind等的工作原理

慢慢抽丝剥茧，从现有证据出发，大胆假设小心求证，必要时寻求外部帮助。最重要的可能是，不放过这个问题，能坚持探究。接下来还有很多要做的，加油吧。

