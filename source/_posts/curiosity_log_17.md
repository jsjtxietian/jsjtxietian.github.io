---
title: Curiosity Log 17 - When Code Is Cheap
tags:
  - Curiosity
date: 2026-08-29
---

依然是整体节奏能和大小周对上的一次。前阵子因为 IP 节点不太干净被 Gemini 送中了，导致几天用不了 Gemini chat，那我正好捡起来之前一直想试试的[Arena AI](https://arena.ai/)，以不稳定的回答 + 需要大概选一下哪个回答更好为代价，获得了前沿模型 chat 自由，其实说实话能经常体验到不同的模型的“话术”也还蛮好的。

娱乐上还是挺开心的，每周都有猎人的更新看，昨天还看了 [GTA6 加长版实机预告](https://www.bilibili.com/video/BV1EL4Z6aE2D/?vd_source=2ed13612df005a05ffd15b1da3dab557)，欣赏艺术。终于卸载了《刺客信条 奥德赛》，主线压级真的很讨厌，打断我心流。然后打开了一直想玩的《如龙 8》，意外地很不错。这游戏虽然有奇怪的地方（究竟缝了多少小游戏进去啊），但写作抛梗极为接地气，基本都是一路笑过去的。此外我还开发了让 Codex 帮我改存档的技能，它自己搜了下找到 github 一个脚本，魔改魔改就 ok 了，终于不用刷钱了，体验提升极大。

最近游戏打得多，都没咋读书了，读完了《色彩列传 黑》和《Designing Your Life》，正在继续翻翻《营养学》和《How to Make Money in Stocks》。只能说工作压力上来确实晚上很难 Focus 太久，麻。不过有趣的是，从《营养学》学到的知识让我过了《如龙 8》里某个证书的考试，算是学到了？

---

* tison 哥的好文，[夜天之书 #121 When Code Is Cheap](https://mp.weixin.qq.com/s/41LCTWnXGDq8V7yQv9jZBA)，其实我最近也是这个感觉。如果 tison 哥是 GPT 5.6 Sol Max 的能力边界已经达到他日常工作的基线的话，对我来说 GPT 5.6 Sol Medium 已经达到了（最近在写工作室内部的工具，纯前后端业务）。我确实很久没有自己动手写代码了，我的精力本身更多转到了认真和上下游对齐需求（除了会议上那种，也包括多闲聊去挖掘）、认真写 prompt 以及从比较高层的角度去指导 agent 上。我并不会完全不看代码，每次 diff 我肯定是会大概扫一眼的，不仅如此还会让 AI 经常去清扫一些技术债。毕竟 coding 不是问题了，有点规模的重构一次交几十个文件也没啥，目标之一就是为了让 AI 以后能更好地修改这个代码仓库。很认同 tison 哥说的`现在我的生产力最大的制约是身体健康...我在身体疲劳的情况下 reasoning effort 显著下降，结果就是无法阅读和引导 AI 的产出`，但只能说游戏行业闹麻了哈哈。`Agentic Coding 时代，说清楚愿望的能力，以及构建愿望落地路径的能力，是核心竞争力。`

* 哈哈打起来了，OpenAI [表示](https://x.com/OpenAI/status/2093515564786540695)：`We’re ending our partnership with Cursor following its acquisition by SpaceX. Under our proposal, Cursor’s direct access to our models would end on November 12.`

* Daniel Lemire 发了个 [推](https://x.com/lemire/status/2092956951630004509)，让我看到了这篇 MIT 发的关于 AI 对教育影响的 [Report](https://aiandeducation.mit.edu/report/)，写得真的挺好的，Lemire 的评价也很精准：`MIT is famous for brutal homework. The report makes clear that those take-home assignments are under siege, and that much of the evaluation is moving back into the room: oral exams, in-class work, live discussion... I like it. Not many schools could come up with such a report.`我最大的感想是 AI 时代反而要重视人与人线下的链接吧，毕竟知识不仅仅是信息的传递，而是在人与人的互动中构建的。

* 用金庸群侠传当 AI 的[bench](https://github.com/hanxiao/jy-crpg-bench)，挺有意思的，以及作者的观察：`Many good models including qwen3.8-27b-xhigh and sonnet-5-low can't even get out of the spawn town and they r just circling, probably bc of the pixelate + isometric view is OOD or sth. good prompt/harness helps.`
* Stripe 买了 OpenRouter，这个组合还挺有趣的，有人 [评价](https://x.com/martin_casado/status/2090135977960620414)：`AI has given us two modern miracles. The first one everyone knows, which is that we can turn electricity into intelligence. But the second one is more subtle but equally miraculous. It’s that we now have intelligence as a universal medium of exchange, in the form of tokens.`
* [Why your local LLM feels dumber than it is](https://forum.level1techs.com/t/why-your-local-llm-feels-dumber-than-it-is/253917)，查这些确实好复杂，我还是等抄作业吧。
* Harvey 团队发了[研究更新](https://x.com/gabepereyra/status/2090453918547685537)：`Tenet is a Kimi K3 base that we post-trained together with Fireworks research for long-horizon legal work.` 基于开源权重模型 + 贴合真实场景的环境构建 + 针对性的 RL 后训练，我也想啊，导演 Agent！
* [Training AI to Paint with Code](https://surya.website/rling-qwen-to-paint-with-code)，该说不说看这个生成出来的图确实还不错，[这里](https://x.com/kickingkeys/status/2091621857388605653) 有最新的一些图，也许是吧：`You can just RL a coding model to paint with javascript.`
* [Your Agents Are Not Time Aware](https://www.lesswrong.com/posts/eAbuPXbjakop5rSJx/your-agents-are-not-time-aware)：`Agents consistently over-predict task time`，我也能感受到这一点，我觉得大概率是因为这些语料都是前 AI 时代的，所以动不动一个重构要花几天到一周这样，当然文章说的更好：`he models appear to reflect the human tendency to apply priors to estimates, giving roughly an hour and a half.`
* 还有让 AI 帮忙做血缘与家族史挖掘的，牛逼，[A Swarm of Blood Robots](https://craigmod.com/essays/robot_blood/)；当然文章里也有一些有趣的产品想法，比如只允许推荐 5 星好书，且加入时必须撰写推荐理由的私密图书分享平台。最后：`If you’ve noticed a theme above, it’s that models excel at talking to databases.` 确实。

* [There's no reason for software to be slow anymore](https://danluu.com/perf-opt/)，谁说不是呢，性能优化其实很适合给 AI 来探索。看看 llvm 的 [Compile-Time Improvements in LLVM 23](https://aengelke.net/llvm23-ct.html).
* 对 Russ Cox 的 [ ACM 访谈总结](https://www.acm.org/articles/people-of-acm/2026/russ-cox) 也可以看看，讲到了 Go 语言的起源、AI 对软件开发的影响等等；["Code was never the hard part" is an insult to all programmers](https://blog.senko.net/code-was-never-the-hard-part-is-an-insult-to-all-programmers)，哈哈。

* 看大佬怎么起手[做游戏](https://x.com/SebAaltonen/status/2093338335624262072)：`Some people start a game project by downloading Unreal or Unity. Some write their own engine on top of an existing graphics API. I am starting by writing the graphics API.`
* 说到做游戏，[The Invisible Layers Holding Games Back ](https://www.youtube.com/watch?v=s5qKN2Yxaok) 狂喷官僚主义，看看这个数字对比：`Original Halo: 185 people. Full game. Custom engine. New hardware | Halo Remake: 2,183 people. Campaign only. Unreal Engine.` 
* 来看点游戏的渲染，[How is this frame of Animal Well rendered?](https://www.youtube.com/watch?v=HtaleVLNws8)
* 还有这个，给女儿做一个用来做游戏的工具，[Canon, My eight year old daughter wants to make video games](https://tau.dev/2026/08/07/canon).
* 神一样的 linker mold 竟然发论文了，[mold: A Massively Parallel Linker](https://arxiv.org/pdf/2608.23228)，以后要找机会细读；以及这个讲 git 的 [Git at any scale](https://cursor.com/blog/git-at-any-scale)
