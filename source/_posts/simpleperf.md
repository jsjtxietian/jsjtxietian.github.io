---
title: Simpleperf 踩坑记
tags:
  - GameDev
  - Performance
date: 2025-02-12
---



在写[游戏性能优化管线](https://jsjtxietian.github.io/2024/10/17/game_optimization_pipeline/)的时候，我就想着能不能自己在现在的项目里推动一下相关的建设。正好问了问在腾讯搞 metaperf 的朋友，他们 metaperf 的采集端在安卓上确实只是 simpleperf 的封装，所以我想在自己做的游戏上也试试 simpleperf，对于做帧率优化和卡顿优化应该是不小的帮助，尤其是目前我们并没有采样 release 下堆栈的手段，可观测性极差。



## 踩坑

遇到的主要的坑是，**对于 libunity.so，simpleperf 采样出来之后解出来的 symbol 名字错到离谱**，最开始并不知道该怎么查。

最开始我发现的信息是 libil2cpp.so 的符号是正确被解出来了，但是 libunity.so 的错误了，于是首先就是怀疑是不是 libunity.so 本身有问题。后面通过自己造了个 crash 对着看了下，发现 so 里的符号和地址对应没问题。

此时就进入了乱猜时间，是不是和 unity 的 strip engine code 的设置有关、是不是和 unity 版本有关 (unity2022 还是 unity2018)、是不是`gecko_profile_generator.py`脚本有问题、是不是手机上还残存了上一个包的符号文件、是不是和 ndk 版本有关（比如要和做包的版本一致）、是不是和手机有关等等。实验组合的数量爆炸了，我有点没有方向，像无头苍蝇一样疯狂乱试（我记得自己之前有采样到过正确的，但是概率很低）。

后面想到，perfetto 也可以采样堆栈，是不是可以看看 perfetto 采样的结果，来交叉对比下是 libunity.so 的问题，还是 simpleperf 的问题。果然 perfetto 用 unity2022 的 libunity.so 解符号也是错的，我当时就觉得是不是 so 有问题。但这就进入死路了，明明之前发现 so 里的地址和符号对应没问题，难道是 unity 的 so 有啥神奇之处导致这俩工具都坏了？而且 libil2cpp.so 是可以正常解的。我自己用官方的版本做了个 demo 来看，发现也有这个问题。

后面在和吉林小伙聊的时候，我自己发现了一个奇怪的 log: `local_symbolizer.cc:526 Correcting load bias by 5505024 for /data/app/xxx/lib/arm64/libunity.so`，对应到代码大概是：

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

看着就有问题，因为我造 crash 的时候用的地址并没有偏移，也就是说 perfetto 为了修图里说的 bug (这里：[e7228a7 - platform/external/perfetto - Git at Google](https://android.googlesource.com/platform/external/perfetto/+/e7228a7))，自己帮我偏移了一个值导致符号名字错乱，issue 提了：[Perfetto incorrectly resolves symbol names in libunity.so · Issue #1005 · google/perfetto](https://github.com/google/perfetto/issues/1005)

然后吉林小伙帮我逆向了下，把这个 if 直接 nop 掉了，然后我测了下，对于 unity2022 的 libunity.so，结果对了；perfetto 用 unity2018 的 libunity.so 就不会有这个 log，因此一直是对的。到这里为止其实 pertetto 已经没问题了，但是由于项目的测试机安卓版本都很低，还是需要研究下 simpleperf 的。因此就开始怀疑是 unity2022 的 libunity.so 本身有点问题，导致 perfetto 和 simpleperf 都做了一些操作绕过这个问题。但是我简单看了看 simpleperf 的代码，并没有类似的代码，但我还是先提了 issue：[BUG Simperf incorrectly resolves symbol names in libunity.so · Issue #2125 · android/ndk](https://github.com/android/ndk/issues/2125)

此时对于 unity2022 的 libunity.so**似乎**找到了问题，但是 simpleperf 解 unity2018 的 libunity.so 依然有问题：不知为啥出来的符号只有一层，所以没法形成 libunity.so 内部的调用堆栈。我能确定 perfetto 解 unity2018 的 libunity.so 没有问题，simpleperf 相关的只能继续去试。后面我发现，对于 no strip engine code 的包，simpleperf 解不出名字，但是有正确的裸地址形成的堆栈，我下意识就怀疑是不是 simpleperf 就不支持 strip 过的 so，虽然我觉得有点没道理（crash 堆栈都可以解），但是这里也说不要 strip：Click on **Player Settings** and set the Stripping Level property to Disabled（[Simpleperf  | Android NDK  | Android Developers](https://developer.android.com/ndk/guides/simpleperf)）

后面再细看发现，我们出包时候，对于 no strip engine code 的包，不会生成 libunity.so 的符号文件；也就是说，当不给 libunity 的符号的时候，simpleperf 能采出正确的裸地址堆栈。我当时的笔记是：

> simpleperf 跑 18 的 strip 过的 libunity 只有一层符号，跑没 strip 的可以有原始的堆栈，但是一旦给了符号就还是只有一层。
>
> 跑 22 的 libunity 有堆栈错误，也可能只有一层 ; 不提供符号 libunity 的大部分会被解到 _MultiplyMatrixArrayWithBase4x4_NEON。

另外我提的关于 simpleperf 的 issue 有人回我了，我学到可以使用`simpleperf dump perf.data`来 debug（好心人是教我怎么看 build id，看下 so 和对应符号文件是不是 build id 能对应上），我 dump 了一下不提供符号文件时 unity2022 的 libunity.so 下跑出来的 perf.data，发现虽然大部分被解到了矩阵乘法，但是裸地址是对的（我自己写了脚本调用 llvm-addr2line 来解，被解到`_MultiplyMatrixArrayWithBase4x4_NEON`算是预期之内，因为 so 本身确实没啥符号）；dump 了一下提供符号文件时 unity2022 跑出来的 perf.data，发现确实堆栈只有一层，裸地址就有问题。

此时，问题终于清晰了：**和是不是 no strip 无关，如果我提供 libunity.so 给手机上的 simpleperf 来让其在手机上直接解符号名字，就会出问题**（传`-lib xxx`给`app_profiler.py`，符号文件默认会被推到` /data/local/tmp/native_libs/`）；如果我不提供符号，则 simpleperf 能采样到正确的裸地址，然后我可以自己写脚本来解（后面研究发现也不需要自己写，把相同 build id 的符号文件丢进 binary_cache 然后传给其他 report 相关的脚本即可）。unity2018 和 2022 的区别在于，如果推送符号，对于 2018，结果是正确的但是只有一层；对于 2022，结果就是错误的。

其实我早就想看下裸的地址堆栈，但是因为 2022 下不提供符号 libunity 的大部分会被解到`_MultiplyMatrixArrayWithBase4x4_NEON`，我就以为 simpleperf 没这个功能（或者说，我下意识以为 simpleperf 的 perf.data 不保留裸地址，也是看到 dump 才知道其实 perf.data 里面除了符号还是记录了地址的，但是转到 gecko-profile.json 就没了）。后面也是在一次次的实验中，大概了解了 simpleperf 的工作原理，还是小伙说得对，不要用太高层的脚本封装，从底层去理解这些（小伙还说 simpleperf 采的地址指定是正确的，因为这是系统支持的，小伙真是好人）。确实最开始没想到问题在这里，没想到地址在哪边 resolve 是造成这个 bug 的原因，我已经在 simpleperf 的 issue 中提供了一些发现，等官方来看看吧。

接下来就很简单了：使用`app_profiler`的时候，不要提供`-lib`参数，等拿到了 perf.data 之后，把符号文件丢进 binary_cache，然后提供`--symfs .\binary_cache`给其他 report 的脚本来解符号。这么做还有一个原因，我们的 libil2cpp.so 太大了（将近 2G），armv7 的手机本来也不可能在手机上去解 libil2cpp 的符号。



## What if

就我个人而言，我当然是觉得我很欢迎去下下来 simpleperf 的源码慢慢调试的，但是时间有限，这本身也是我的 side project，不可能花那么多时间去慢慢 debug，因此采取了比较快速的试错法来研究。回头看有很多的 what if：

* 如果一开始就记录下每次的实验条件与 log，那么后面可能不会有那么多次无效实验，可以翻看之前的试验记录来确认问题（当然也不能对自己太严苛，虽说要记录所有东西，但是在不知道问题的时候，很可能也不知道该记录什么）。
* 如果一开始更加专注一些，不要让实验的 scope 太大（条件组合数量爆炸），也能节约很多精力。整体来看，虽然对比 perfetto 和 simpleperf、unity2018 还是 2022 的 libunity.so 等让我踩了点坑，但对比分析还是帮了很多忙。
* 如果做到下面的，就能更快速帮助我定位问题：
  * 一开始抛开高层的脚本从底层命令来使用 simpleperf，可能会就更加理解 simpleperf 的工作原理（关于 binary_cache，native_lib，build id 匹配，symbol 位置等等）
  * 一开始就认真读文档来了解 simpleperf，发现 dump 和 no-dump-symbols 等命令
  * 一开始就更了解 unity strip 的底层逻辑、堆栈采样、libunwind 等的工作原理

慢慢抽丝剥茧，从现有证据出发，大胆假设小心求证，必要时寻求外部帮助。最重要的可能是，不放过这个问题，能坚持探究。接下来还有很多要做的，加油吧。



## 后续

[BUG Simperf incorrectly resolves symbol names in libunity.so · Issue #2125 · android/ndk](https://github.com/android/ndk/issues/2125#issuecomment-2667220290)里面有老哥帮忙看了下，说这个只有符号的 libunity.so 本身有问题：

> the file offsets of program header is corrupted:
>
> $ readelf -lW libunity.so
> Elf file type is DYN (Shared object file)
> Entry point 0x538d30
> There are 10 program headers, starting at offset 64
>
> Program Headers:
> Type Offset VirtAddr PhysAddr FileSiz MemSiz Flg Align
> PHDR 0x000040 0x0000000000000040 0x0000000000000040 0x000230 0x000230 R 0x8
> LOAD 0x000000 0x0000000000000000 0x0000000000000000 0x00032c 0x537d24 R 0x1000
> LOAD **0x000d30** 0x0000000000538d30 0x0000000000538d30 0x000000 0x121bea0 R E 0x1000
> LOAD 0x001bd0 0x0000000001755bd0 0x0000000001755bd0 0x000000 0x073420 RW 0x1000
> LOAD 0x001ff0 0x00000000017c9ff0 0x00000000017c9ff0 0x000000 0x111a90 RW 0x1000
> DYNAMIC 0x001bd0 0x00000000017c54a8 0x00000000017c54a8 0x000000 0x000210 RW 0x8
> GNU_RELRO 0x001bd0 0x0000000001755bd0 0x0000000001755bd0 0x000000 0x073430 R 0x1
> GNU_EH_FRAME 0x00032c 0x00000000002c70dc 0x00000000002c70dc 0x000000 0x080934 R 0x4
> GNU_STACK 0x000000 0x0000000000000000 0x0000000000000000 0x000000 0x000000 RW 0
> NOTE 0x000270 0x0000000000000270 0x0000000000000270 0x0000bc 0x0000bc R 0x4
>
> I think a correct Offset for the executable LOAD segment should be 0x537d30. The correct offset for the executable LOAD segment appears to be 0x537d30. But it is modified to 0x000d30.
> Since it is deliberately corrupted, it isn't simpleperf's problem to symbolize it correctly.
> However, the virtual addresses for symbols in the symbol table still look correct. That's probably why you can get correct symbol name with llvm-addr2line.

那就很有趣了，我对 dev 版本的 libunity.so 做了个实验（release 不行，符号和实现已经分开了）

对原版 libunity.so：

> Entry point 0x80fe80
>
> Program Headers:
>   Type           Offset   VirtAddr           PhysAddr           FileSiz  MemSiz   Flg Align
>   PHDR           0x000040 0x0000000000000040 0x0000000000000040 0x000230 0x000230 R   0x8
>   LOAD           0x000000 0x0000000000000000 0x0000000000000000 **0x80ee7c** 0x80ee7c R   0x1000
>   LOAD           **0x80ee80 0x000000000080fe8**0 0x000000000080fe80 0x1c472f0 0x1c472f0 R E 0x1000

跑一下 llvm-objcopy --strip-debug，对 strip debug 的：  

> Entry point 0x80fe80
>
> Program Headers:
>   Type           Offset   VirtAddr           PhysAddr           FileSiz  MemSiz   Flg Align
>   PHDR           0x000040 0x0000000000000040 0x0000000000000040 0x000230 0x000230 R   0x8
>   LOAD           0x000000 0x0000000000000000 0x0000000000000000 **0x80ee7c** 0x80ee7c R   0x1000
>   LOAD           **0x80ee80 0x000000000080fe80** 0x000000000080fe80 0x1c472f0 0x1c472f0 R E 0x1000

跑一下 llvm-objcopy  --only-keep-debug，对 only debug 的：  

> Entry point 0x80fe80
>
> Program Headers:
>   Type           Offset   VirtAddr           PhysAddr           FileSiz  MemSiz   Flg Align
>   PHDR           0x000040 0x0000000000000040 0x0000000000000040 0x000230 0x000230 R   0x8
>   LOAD           0x000000 0x0000000000000000 0x0000000000000000 **0x00032c** 0x80ee7c R   0x1000
>   LOAD           **0x000e80 0x000000000080fe80** 0x000000000080fe80 0x000000 0x1c472f0 R E 0x1000

所以看起来 unity 的那个符号 so（libunity.sym.so）就是会这样，就不适合来给 simpleperf 或者 perfetto 使用，这俩期待的是包含符号的完整的 so，而 unity 没有给这样的 so（我不确定 unity 一定是这样的行为，看代码大概是，具体需要调试源码看看）。而我不给符号给 simpleperf 恰好就是绕开了这个问题，也错怪 perfetto 了。真就是知识到用的时候才觉得少，但庆幸自己一路坚持了下来。

## Update

因为最近快离职了，这个 Topic 估计短时间内不会继续更新了。相关代码在[jsjtxietian/SimpleperfToolbox: A set of tools for capturing and viewing data produced by Simpleperf](https://github.com/jsjtxietian/SimpleperfToolbox) 后面有空可以再捡起来玩玩。

写完这篇文章后的一些 Update：

* 做了个简单的采集工具的 GUI，可以让 QA 也帮忙录制数据，其实就是一些命令的封装，全交给 AI 写的。有一些项目特定的逻辑，比如拷符号、解混淆啥的也顺便处理了，可以直接出 gecko 那个 json 和 report.txt 那个汇总的文件。相关的已经交接给了我带的校招生，希望大家能慢慢用起来。
* 这个工具带来的可见性还算蛮好的，管帧率的同事几乎立即发现了俩个之前没注意到的唾手可得的优化，加起来有个 2% 的帧率优化吧，做性能就是默念：可见性！
* 探索了下怎么根据采样数据来分帧，说实话没那么好做（堆栈截断等问题），具体思路在 readme 里有。我个人的感觉是，还算先做好可视化，也许可以让 AI 来判断难分的帧，比硬写规则可能好一些，后面可以再探索。
