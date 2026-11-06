---
title: Curiosity Log 22 - Take a break
tags:
  - Curiosity
date: 2026-11-06
---

最近依然就是在玩《沉星之序》，偶尔读读《社会学家的窍门》。奥德修斯回家的 crpg 有点搁置了，暂时没啥想法，也就先放着吧，反正也不着急，慢慢搞，也是在等 AI 能力再进步一些。这一期的 log 也比较薄，唉。

然后顺便开始思考思考自己做的内部系统要不要在公司里宣讲下，感觉有很多方面可以讲，类似 OPC 的体验、Agent 时代的开发、具体到产品上的设计思路、底层数据模型等等，反正要 12 月，慢慢想吧。另外就是，感觉工具本身也有极限，遇到蛮不讲理的韩国人，也是束手无策。

---

* [introducing Gemini 4 Carbon](https://x.com/sundarpichai/status/2115489219804352921)，可惜还没用上，但用了用 Argon 觉得还可以；[Introducing Inkling 2 Small](https://thinkingmachines.ai/news/inkling-2-small/)，看着也挺不错的。
* [Sparks of Weight-Space Programming: LLMs can natively read & write neural network weights](https://rikiyat.github.io/blog/weight-space-programming/)，神了，`We find that frontier LLMs are surprisingly good at natively reading and writing neural network weights, using a variety of recent tools and algorithms or even via direct weight editing... Just by looking at the raw weights, GPT-6 Astra can tell what a network was trained to do.`
* Karpathy 的新项目，[HackerTube](https://karpathy.bearblog.dev/hacker-tube/)，看完立刻把 Opus 的 thinking level 调节到 Medium.

* [AGI Economics: Coordination vs. Competence](https://institute.deepmind.com/essays/the-economics-of-intelligence/): ` AI agents differ from human workers in two key ways that are key for understanding economic transformation: duplicability and coordination.` 关于第一点，Duplicability，我一直觉得其实我们是可以非常轻松地去按需组合 Context 的，我只是还没想得特别清楚这个可以如何继续形成下一步的产品；关于 coordination，竟然是用的科斯的理论去解释，`Today’s AI systems coordinate poorly in practice. But because of their high communication bandwidth, their potential for coordination is immense.` 希望如此。
* [Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought](https://arxiv.org/abs/2610.30755)，我觉得不需要，其实不需要拟人化。
* [Why Agents Are Soon Only Going to Have 1 Tool](https://www.philschmid.de/code-mode)，确实，Code Mode 才是最灵活的组合方式。

* [Can AI Propose Interesting Research Questions?](https://after42.org/research/can-ai-propose-interesting-research-questions/) 当然是可以，`we find that frontier AI models, run in an agentic workflow we built, can propose research questions that experts judge interesting and worth pursuing in some subfields`.
* [GDPx: Measuring Frontier Model Capabilities Across the Most Valuable Domains](https://newsletter.semianalysis.com/p/gdpx-measuring-frontier-model-capabilities)，看了下怎么这些模型的 Finance 能力都这么差哈哈哈。
* [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060)。我自己倒是让 Astra 给 Raft 写了个企业微信的桥，当客服了，[wecom-raft-bridge](https://github.com/jsjtxietian/wecom-raft-bridge)，真希望大家都用 joint channel.

* [Custom Voices With Qwen3-TTS](https://lucumr.pocoo.org/2026/10/29/qwen3-custom-voices/)，好有意思的玩法，`With a bit of creativity you can also do more with those custom voices than appears initially.`

* [Modal CEO on Agent Maxxing, the Future of Inference & Unpacking the Chaos of the GPU Market](https://www.youtube.com/watch?v=HJDekXH-h5c)，可以看看。

* 没想到能看到 Casey 聊 LLM 的一天，[What's in a Token?  Wading Through AI - Episode 11](https://www.youtube.com/watch?v=aQvSG8paVjM)
* 从 Raft 仓库翻到的好东西，[porthole: Host-side HTML sandbox for agent UIs](https://github.com/botiverse/porthole)，感觉可以给自己的项目用上。
* [Tim Sweeney](https://x.com/TimSweeneyEpic/status/2117836715813716324): `What we are trying to do: Build an engine that’s more powerful than UE5, easier to develop in than Unity, and is the most efficient effective way to build with AI acceleration... but AI assisted conversion is now clearly way more effective, and will produce a way more manageable UE6 project than a hybrid, while making it way easier for us to simplify and improve the engine.` 愿景真好。

* 挺有趣的 skill，[video-to-game](https://github.com/lovisdotio/video-to-game)，`A video model designs the game (its look, camera and one memorable mechanic); the agent studies the clip frame by frame, generates every image, 3D model and sound with fal to match it, writes the game in Three.js`，靠 seedance 这种视频模型出视觉和玩法，然后 Agent 去大力出奇迹复刻。
* [Daniel Lemire: Open source as a research method](https://x.com/lemire/status/2117961981730636145)，写得太好了，唉。

* 学习，[Billion-query-per-second lookup tables in C++](https://x.com/lemire/status/2115046718039306377)，`If your keys are known at compile time, you should not pay for collision handling at runtime... With some care, a lookup costs about five cycles.`
* 还有这个，想到自己前几年还喜欢造轮子的时候，[Building a Fiber-Based Job System from Scratch · A Graphics Guy's Note](https://agraphicsguynotes.com/posts/building_a_fiber_based_job_system_from_scratch/)
