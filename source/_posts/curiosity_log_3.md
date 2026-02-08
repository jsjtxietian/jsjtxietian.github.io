---
title: Curiosity Log 3
tags:
  - Curiosity
date: 2026-02-08
---


又是风平浪静的两周，因为感冒躺了一周左右，躺着真爽，虽然白天就和梦游一样。

读完了索维尔写的《知识分子与社会》，确实是不错的解毒剂。我之前自己就有模糊的感觉，就是现在很多的讨论动不动就上升到一个非常高的概念——自由、法治、民主等等，我反而其实更喜欢进行一种具体的、微观的讨论。这书里狂喷知识分子会倾向于进行“圣化构想”从而在此类讨论中获得优越感，并且以“辞令技巧”躲避来自现实的检验。这里能讨论的点太多了，尤其是在 LLM 的时代，比如权力对知识的生产、微观权力的审核/治理活动等等。索维尔书中有一个名字经常出现，那就是哲学家罗素。我之前很喜欢罗素老年时候在 BBC 的访谈中所说的：`When you are studying any matter or considering any philosophy, ask yourself only, "What are the facts, and what is the truth that the facts bear out?" Never let yourself be diverted, either by what you wish to believe, or by what you think would have beneficent social effects if it were believed. But look only and solely at what are the facts.`  然而根据书中的论述，罗素本人战前坚持极端和平主义，战后立场又剧烈摇摆，罗素自己就是他晚年所批判的对象。这可以理解为是罗素晚年对自己的反思吗，抑或只是知行分离的另一个例子？当然这书本身的论证也不是那么 solid，我觉得稍微有点先射箭后画靶，所以我觉得作为解毒剂看是不错的。以及，一定要保持谦虚。

写完了《莎士比亚的政治盛典》的读书笔记，很喜欢其对《麦克白》中勇气的论述——`勇气就是麦克白的本质特征，因而这种结构预示了一种永不停止地克服障碍的驱动力。障碍一旦被克服就不再成其为障碍，障碍是有限的。要想保持勇气，麦克白就不得不继续寻求新的障碍；而新的障碍一旦被克服，留下的就将是一摞摞的尸体`。麦克白因为自己行为过度而受到公正的惩罚，可是，过度的根源却在于他对勇气的始终坚守。

好友开的书店发了年度总结：[番斗书店，马马马马马马马马马马上上成功](https://mp.weixin.qq.com/s/phhURUIaCXoIIQ14dVMkAQ)。我能做的不多，只能多买点书了！

打完了《光与影：33 号远征队》，演出真的蛮好的，没有中间选项的结局也很好。我很喜欢熙艾尔的生死观——Death is a friend who will welcome me home. 回家吧妹妹。开始看《辐射》第二季和《个体的颂歌：论文艺复兴时期的佛拉芒绘画》，也是从文学换个口味。

---

* Amp 团队决定废弃他们的 Amp VS Code extension，原因在播客[Raising An Agent Episode](https://www.youtube.com/watch?v=4rx36wc9ugw)里聊了下，除了因为人力导致的战略聚焦外，大概是因为 Sidebar 这种模式强迫人类必须时刻作为反馈循环的核心，其实反而限制了 AI，这种交互不适合长时间异步任务，不适合并行运行多个 Agent。留在 VS Code 内部意味着受限于为人类设计的界面和逻辑，无法彻底重构为 AI 优先的工作流。Amp 敢废弃一些他们认为过时的东西，迭代速度很快，比如最近就有[Go Deep](https://ampcode.com/news/deep-mode)、[Liberating Code Review](https://ampcode.com/news/liberating-code-review)，很喜欢他们的信念：`The other thing we say: shipping is research. You need to hit reality with what you build.`
* Mitchell Hashimoto 写的[My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)，写得很扎实。我个人大概在 Step3-5 跳来跳去的，根据实际任务选择对应的 AI 工具：网页上和 Gemini 聊聊天，让它 Deep Research 下；让 Codex 帮我调研代码库，写写代码；修修补补 AGENTS.md，总结一些 skills，大概这样。很多关于 AI 使用层级的文章，比如[The Five Levels: from Spicy Autocomplete to the Dark Factory](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)。
* DHH 的新文章：[Clankers with claws](https://world.hey.com/dhh/clankers-with-claws-9f86fa71) 来评价 [OpenClaw](https://openclaw.ai/)，喜欢结尾的总结：`Everything is changing so fast in the world of AI right now, but if I was going to skate to where the puck is going to be, it'd be a world where agents, like self-driving cars, don't need special equipment, like LIDAR or MCPs, to interact with the environment. The human affordances will be more than adequate.` 顺便还表扬了下 Kimi2.5 的模型能力。
* Claude Code 加了个指令 `/insights`，是挺实用的功能：`When you run it, Claude Code will read your message history from the past month. It'll summarize your projects, how you use Claude Code, and give suggestions on how to improve your workflow.`
* Andrej Karpathy 说他现在的编程范式应该叫 [agentic engineering](https://x.com/karpathy/status/2019137879310836075) 以区别于前一年提出的 vibe coding，这个词听起来就专业多了。
* [I miss thinking hard](https://www.jernesto.com/articles/thinking_hard)，我想了想好像 AI 让我思考得更多了，唯一的危险是我容易还没形成我的想法的时候就去和 AI 讨论（可能只是有一些能用破碎的词句描述的感觉），可能长久以来不是很好，我应该先尽力去形成连贯的，然后再和 AI 讨论。
* [Few things are worth building](https://x.com/jobergum/status/2018706126842294315)，挺好的思考，vibe coding 可以让我很快地去 build 一些小玩意儿，但人的注意力才是最重要的，我能 build 它不代表我需要 build 它，来吧，设计，来设计 Ought to be 吧！
* 一篇谈世界模型的帖子 [The Second Pre-training Paradigm](https://x.com/DrJimFan/status/2018754323141054786)，作者开篇就`Next word prediction was the first pre-training paradigm. Now we are living through the second paradigm shift: world modeling, or “next physical state prediction”.` 得到了 Genie3 作者之一的[回应](https://x.com/jparkerholder/status/2019017372879786210)：`People often present world models like Genie as either useful for interactive media *or* embodied AGI. The true answer is both!`
* [Tim Sweeney](https://x.com/TimSweeneyEpic/status/2017327913113190789)也在 X 上评价了下 Genie3: `We'll see constant leapfrogging between engine centric AI and world model centric AI until they come together for maximum effect.`我整体还是认同的，他对两者优劣的总结也很精辟：`World models have huge advantages in vast knowledge of the world and ability to mash up varied content and styles. Engines have huge advantages in a stable representation of the world, reproducible simulation, and GPU and power efficient rendering.` 
* Sebastian Aaltonen 也有一篇[帖子](https://x.com/SebAaltonen/status/2017881961281245561)转推了一篇世界模型的文章，他提到了游戏的 scale: `one of the core reasons the current top DAU games scale so well is distributed processing. Everybody today has a supercomputer in their hand.` 十分认同，游戏的 scale 是在用户千百万硬件上的 scale。
* pi 作者的[Year in Review 2025](https://mariozechner.at/posts/2025-12-22-year-in-review-2025/)，总结非常到位：`Did my productivity increase via LLMs? I don't actually know. Compared to "two years in review", you will see that there isn't really that much more projects going on. The difference might be that the projects I've worked on this year have more technical depth. Without coding agents, I might not have started these kinds of projects just because of a lack of time to do it all by hand.` AI 也帮助我优化了很多我自己的工具，没有 AI 的话启动耗能太多，我自己都不一定想动手。
* 谷歌[引入](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/kaggle-game-arena-updates/)扑克牌和狼人杀作为 AI 的 benchmark，挺有趣的。
* [关于 slime 项目维护策略的一些调整](https://zhuanlan.zhihu.com/p/1996014610227164098)，能公开设定好开源项目的方向 + 狠心关 PR，才能在 AI 的 PR 轰炸下生存下来（好多人真的很没素质）。
* [重新发明打孔纸带](https://psiace.me/zh/posts/reinvent-the-punch-tape/)，也是挺有趣的文章，我很认同：`Agent 系统很容易走向复杂：分叉、回滚、长短期记忆、精心设计的压缩截断... 多层摘要、反复压缩和复杂启发式规则在短期内可能有效，但长期会引入噪声、不确定性和不可解释性。你会越来越难区分哪些是事实，哪些是模型生成的概括，哪些是压缩后的残留误差。`
* [从“70% 难题”破局：AI 在超大游戏工程中的应用瓶颈与解决方案](https://mp.weixin.qq.com/s/IzuL3bnsnAAqiyMiJH18MA)，吹了半天云里雾里的，实际例子感觉很一般。针对 Crash 分析而言，如果提供好相关的上下文加上一些特定的 skill，我相信以 Sota 模型的能力，大部分的 crash 肯定没啥问题，小部分只能靠[吉林小伙](https://www.zhihu.com/people/jilinxiaohuo)那样的高手了。

* [通向编译器自我进化之路：用 AlphaEvolve 进化 LLVM/XLA](https://zhuanlan.zhihu.com/p/2002356805263709175)，好方向。
* 偶然发现一篇给 llama.cpp 支持其他的芯片的文章，[Building new GGML backends for novel accelerators, how, challenge and opportunities (FOSDEM 2025 draft)](https://clehaxze.tw/gemlog/2024/12-28-building-new-ggml-backends-for-novel-accelerators-how-challenge-and-oppertunities-fosdem-2025-draft.gmi)，作者其他的文章也都不错，还有一篇分享了一些理财的心得呢。
* 每周都会上榜的 Daniel Lemire 写了新的文章[Be mindful of the bubble effect](https://x.com/lemire/status/2019408770065895424)，AI 时代确实如此，我和我周围的人当然都积极拥抱 AI，但很多并不是这样，我自己在的公司似乎就慢一点。很精彩的洞见：`How does it change? It does not change through debates... One important factor for change is human replacement.` 回到了卡尔·波普尔。
* [SaneCppLibraries](https://github.com/Pagghiu/SaneCppLibraries)的作者[怀疑自己在 AI 时代是不是需要继续维护这个 Repo](https://x.com/pagghiu_/status/2017560697517797598)，还被我鼓励了一把。

* Zig 的一篇新文章：[[Bypassing Kernel32.dll for Fun and Nonprofit](https://ziglang.org/devlog/2026/#2026-02-03)](https://ziglang.org/devlog/2026/#2026-02-03) 还挺有意思的，表扬了 windows 的 ntdll API 的设计，喷了 kernel32 封装得不好，所以 Zig 希望尽量 bypass 掉 Kernel32.dll, 祝他好运。
* 蛮好的技术写作：[All Roads Lead to IPC: Rethinking CPU Performance Design](https://github.com/djiangtw/tech-column-public/blob/main/topics/computer-architecture/01-all-roads-lead-to-ipc.en.md)，除此以外还有一些关于存储、网络的文章，不过还没看。
* [I built a 2x faster lexer, then discovered I/O was the real bottleneck](https://modulovalue.com/blog/syscall-overhead-tar-gz-io-performance/)，知识含量很高的优化文章，文章结尾补充了很多 IO 小知识。
* 也是老文章了，[Why I Hate Language Benchmarks](https://www.gingerbill.org/article/2024/01/22/comparing-language-benchmarks/)，我一般也就当笑话看看，真要细究的话，对同一个任务：1，内存分布如何；2，指令是不是已经是最高效的了，就这两点。
* NOTimothyLottes 火力全开，[喷苹果的计算摄影技术](https://x.com/NOTimothyLottes/status/2018550148453072931)，总结还说 `the only justification I see for having crazy sensor resolution on the iPhone is helping artificially justify having a more expensive phone that fills it's more expensive upgraded non-volatile storage faster, and then triggers a higher cloud subscription fee`, 笑死我了。
* 因为在想游戏的动画系统怎么优化，回忆起以前看的一篇 id Tech 的[分享](https://mrl.cs.vsb.cz/people/gaura/agu/05-JP_id_Tech_5_Challenges.pdf)，简而言之就是尽量这一帧发起的 job 都在下一帧等，给调度以空间才能提高并行性，感觉有坑，等实在砍不动资源了我去试试。
* 别用自旋锁，[Spinning around: Please don't!](https://www.siliceum.com/en/blog/post/spinning-around/)，还好我不会写底层代码！
* 我又被骂了，[Doing the thing is doing the thing](https://www.softwaredesign.ing/blog/doing-the-thing-is-doing-the-thing)，唉。
* [Things I’ve learned in my 10 years as an engineering manager](https://www.jampa.dev/p/lessons-learned-after-10-years-as)，写蛮好，但是我现在看这个是不是太早了。
* 花了点时间看完了吹哥最新的[访谈](https://www.youtube.com/watch?v=1blhmslxkWg)，能明显感觉到最近他开始多出席这种活动给自己的游戏造势，还是挺期待吹哥的 Jai 语言和基于那个语言的游戏引擎的，有哪些设计思路可以学习。另外等 Order of the Sinking Star 正式发布我肯定买爆！

* 回到工作，我退订了 10x Editor，并不是它哪里不好，而是它是上个时代的极致产物了，现在是 agentic coding 的时代了。订阅费我拿来订阅 Codex 了，要在 vscode 里模拟出 10x Editor 的感觉也不容易，但我现在也不会特别长时间一直用编辑器了。
* 接着之前的工作，我慢慢废弃 Ultra 了，改回使用 Samply 来 profile。Samply 的 offline sample 和 source code view 做得好，之前是有一些 pdb 解析的问题，但我在 AI 的帮助下修好了。还有一些可以优化的点，慢慢磨吧。买了 Superluminal 的个人版，当支持作者一下，Superluminal 虽然整体也是基于采样的工具，但是还是会尽力去计算出真实的 wallclock time 和函数的 number of calls，也很有心了。
* 越来越觉得，二进制的文件格式 + 某种可视化不适合 AI 时代了，比如行为树编辑器、技能编辑器、蓝图编辑器等等。二进制 + 可视化是给人用的，现在 AI 能把代码的成本降低到接近为 0，其他职能应该靠 AI 来写代码表达功能，代码作为文本可 diff 可 merge 可让 AI 直接操作，管理上方便太多了。比如 Bun 最新版也加了个 `--cpu-prof-md`，可以` generate a markdown CPU profile, which is grep-friendly and designed for LLM analysis`.
* 每次大跌砸盘，都是反思自己策略的好机会，纸上得来终觉浅，复盘、反思，是一种修炼。至于大 A，我燃尽了，买交通银行之后卸载 App 了，关机反思！
