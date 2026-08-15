---
title: Curiosity Log 16 - The Odyssey
tags:
  - Curiosity
date: 2026-08-15
---
刚双休两周，又回到了大小周。所以虽然上周因为写 [在永星一周年](https://jsjtxietian.space/2026/08/09/one_year_in_yx/) 导致本系列更新延迟了，但整体节奏还是能和大小周对上！

终于打完了《逆转裁判 123》，最后一个案子虽然体感有些牵强，但不失为一个非常好的结局。然后抽了一个完整的周末去看点映版本的《奥德赛》，震撼有余，几个略显吹毛求疵的印象：1，尺度，整体而言木马、城墙、船舶的尺度似乎是考虑到了当时的技术限制没有做成特别宏伟高大的样式，这个倒是挺好的，阿伽门农的造型很帅；2，光圈虚化似乎有问题，有一些镜头过于糊了，很影响观感；3，对于诸神与怪物的处理有点不协调，我是觉得去掉神的直接干预也可以，但没有诸神的世界为什么还会有独眼巨人和斯库拉呢；4，最后的打戏感觉力道确实不够，而且竟然还没杀完。至于精神方面，我会觉得现在去读荷马史诗的一个有趣的地方就是它能给我展示当时人的精神风貌，我也很欣赏荷马的英雄展现出来的英雄的那种古典崇高感，所以我作为一个对于原著极其熟悉的人，真不是特别欣赏诺兰对于原著精神的改编。当然这也可以算是太熟悉原著的坏处，看电影的过程变成了去对比和研究诺兰的改编，是不是反而剥夺了自己好好欣赏电影的乐趣呢？相比之下，我觉得 Jorge 改编的音乐剧《Epic: The Musical》相对让我好接受多了，可能这就是音乐的魔力吧。

至少拜电影所刺激，我打开了吃灰许久的《刺客信条 奥德赛》。说实话自从《刺客信条 起源》让我觉得无聊并且弃坑之后，我就很久没碰刺客信条系列了。前阵子本来我想玩一下《刺客信条 影》的，但借着机会正好试试奥德赛。意外地还不错，能看到当时图形技术留下来的一些痕迹，然后只走主线会被压等级也有点烦人，除此以外确实都不错，逛逛风景做做任务，很适合最近下班不想思考的自己。

书方面还在有空翻翻《营养学》，以及新开了一本《色彩列传：黑色》，色彩和文化的关系过于紧密，以至于色彩史像是文化史，不过也本该如此。印象最深的是作者说一系列研究难点的时候，有一个是文献资料的难点，里面除了提到颜料的化学反应与人类的活动（重绘、清洗等）会在时间的维度上对古代流传下来的作品的颜色造成影响以外，还有一个是观看的条件：`我们今天看到的艺术品、图片和颜色与古代、中世纪和近代相比处于完全不同的照明条件之下。火把、油灯、各种蜡烛发出的光线与电灯是不一样的`。

---

* 又是大量的新模型，Grok 4.6，DS V4 正式版，GLM 5.3，Gemini flash 3.7，Meta Glimmer，眼花缭乱啊。当然也还有我看不懂的数学上的突破，黎曼猜想啥的，我就不擅自掺和了。
* Jeff Dean 离职了啊，他也算是我自大学时代一直以来的偶像。他去创业的公司名字叫 Discovery Loop，` to automate machine learning, science, and engineering to accelerate discoveries and progress`. 我还简单看了看这篇 [访谈](https://mp.weixin.qq.com/s/kXEkrbLoN6PUm0W4UFfNcw)，Jeff Dean 的教学：`与其花很多时间精读一篇论文，不如快速浏览十篇论文；甚至，不如浏览一百篇论文的摘要。很多工作可能都还不成熟，但它们共同构成了一张不断变化的地图。真正重要的事情，是让这些点逐渐连成线。` 可能这也是本 log 的意义所在？
* Andrej Karpathy 提了一个新的测试 LLM 的[方法](https://x.com/karpathy/status/2083749667410727319) ，给 Opus 5 输入《指环王》的第一章，让它去写个 three.js 的 demo 把场景渲染出来。Karpathy 说 `I'm excited about creating hyper custom worlds that you can imagine dropping players into, e.g. here to participate in the LoTR story as a spectator NPC, or one of the characters, or etc. ` 我也是，然后当然也提到了难点：`Last thought is that the domain of worlds/games exposes a weakness in LLMs: they can't easily audit their work because they aren't able to efficiently and natively perceive videos or play games within them. Here, Opus 5 had to very slowly and painstakingly take screenshots at different points, and it messed up a few times and created a bunch of jank.` 所以游戏开发领域还是没那么快能被 AI 全自动化啊。

* 说到游戏，这是个挺好的分享：[告别“抽卡”式开发：如何构建可控、可验证的 AI 原生游戏引擎与美术管线？](https://mp.weixin.qq.com/s/krcZkj3MR-KpJqueC-XufQ) 三条路：1，直接用 Three.js 做游戏，我觉得适合做 demo，快速想法验证；2，传统引擎 + AI 插件，其实就是大家现在在搞的东西；3，AI 原生游戏引擎，是希望探索的方向。看说到 Godot：`不是说 Godot 天然比 Unity 或 UE 更强，而是它更适合作为我们这一代 AI 原生游戏引擎的底座`，唉，欣慰啊。

* [/show-me: compact visual representations for coding agents](https://x.com/dexhorthy/status/2087569590268391897)，可以体验下，让 AI 讨论技术的时候废话少点。
* [Simulating the World with 8.3 Billion AI Agents](https://x.com/MatrAIx2026/status/2085888626861457559)，好友参与的工作，好有意思，喜欢这个结语：`Explore the future today. Simulate before reality.`
* 另一个朋友参与的 [Resource2Skill 让智能体从多模态资源中学会技能](https://mp.weixin.qq.com/s/sx-XDOQw1cSMbMYvcFmECA)：`Resource2Skill所解决的问题并不是再建一个资料检索库，而是把不同资源中互补的信息，转换为智能体可以重复使用的程序性知识。不同模态各司其职：文字界定适用性，视觉保存设计意图，代码提供执行落点。` 我看里面还有关于 UE 的部分，但似乎没开源出来，先期待一波。
* [New in Claude Code: your sessions can now message each other](https://x.com/ClaudeDevs/status/2085817074816070014)，之前好朋友和我说 Codex 有这个，好用，刷到 CC 也有了；Amp 出了 [Orbs](https://ampcode.com/notes/what-i-want-to-tell-you-about-orbs)，简单来说就是可以随时起远程的虚拟机让 Agent 在那上面测试跑代码等等，确实有用。

* 有人复刻了 Claude 模型的 tokenizer：[Reconstructing Claude's tokenizer](https://www.tokenize.rs/claude)，有意思：`Claude 4.7+ having such a small vocab size is Anthropic's attempt to deal with the softmax bottleneck.`
* [Introducing Toast 1](https://www.mixedbread.com/blog/toast-1)，专门做搜索的 agent：`It provides frontier search quality, matching or outperforming Claude Opus 5 and GPT-5.6 Sol while being up to 10× cheaper and 12× faster.`
* 还有用 int 计算来保证推理确定性的：[Fully deterministic cross-device LLMs inference](https://github.com/nathanrs/detllm).

* Cloudflare 发的，[Building an open Agentic Internet: readable, discoverable, callable, and payable](https://blog.cloudflare.com/the-agentic-internet/)，我觉得 Cloudflare 他们思路很清楚：`Agents are here - not as a new kind of software, but as a new kind of visitor to the web. The distinction between a bot and a human isn’t so simple anymore. It’s not as straightforward as bots are bad and humans are good, or bots wasting resources that humans should instead consume. This is the old way of thinking that is outdated in the world of agents.` 然后确实他们的股价也节节升高了，FSLY 也是，非常好的成长股。
* 说到 Cloudflare 就想到这篇：[We rewrote our agent to run entirely in a Durable Object with Pi, Agents SDK and Code Mode](https://x.com/Vercantez/status/2082138839888589200)，把 Agent 跑在  Cloudflare Durable Object 上，说来我最近也在用 Pi sdk 了，感觉还挺好用的。

* [AI 是怎么协助我修好微波炉的](https://zhuanlan.zhihu.com/p/2067187970105421982)，好文：`AI的确能帮我们修好电器；但它们只在电路原理介绍、通过电气连接/元件排布识别典型电路/元件方面表现极佳；在故障定位等方面纯粹是帮倒忙`。其实还挺合理的，包括这个：`三个AI都容易被网上的极端案例误导，比如某个“维修手记”发现了极为罕见的故障，它们就会把这个故障当真，然后想方设法证明你遇到的也是这个最罕见的故障——这可能和“罕见的故障更易引来关注”有关，而AI把关注度当支持率了。`

* [Training Meta's Glimmer model to understand Motion](https://x.com/andrew_n_carr/status/2087589706171367537)，内容如其名，原来还有专门编码人类 motion 的 tokenizer，有趣。说到 motion，最近在和算法哥一起探索这个：[ARDY: Interactive Human Motion Generation](https://research.nvidia.com/labs/sil/projects/ardy/)，这个生成模型效果不错的，虽然生成非基础动作的质量挺一般，但是可控制性比较好，速度也基本能达到实时的要求，正在探索能不能用到游戏生产里。
* 研究了下 Cygames 的文案是咋用 Dify 的：[【CEDEC2026】ゲームシナリオライターを支援する AI ツール開発の実践 ― 設計とプロンプトの工夫 ](https://speakerdeck.com/cygames/cygames_202607_cedec2026_01?slide=6)，我觉得思路还可以，可以借鉴到我正在写的剧情编辑器里去。
* 感谢小伙，我才知道 TTD 还有 [SDK](https://github.com/microsoft/WinDbg-Samples/tree/master/TTD/docs)，这下疑难杂症的 debug 又多一个利器了；[Programming language adoption patterns at Meta](https://x.com/dtolnay/status/2087229652293337160)，TypeScript 和 Rust 的崛起。
