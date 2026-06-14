---
title: Curiosity Log 12
tags:
  - Curiosity
date: 2026-06-14
---
读完《追忆似水年华》之后，趁着最近两周不咋忙，赶紧集中阅读《追寻普鲁斯特》和《普鲁斯特先生》，普鲁斯特的人生确实和他的书一样有趣。读完觉得普鲁斯特活得很“仙”，真是上帝送给世界的礼物啊。

工作上也很，有趣吧。虽然我在名为 Agent 组的地方，好像也没在做 Agent，更像是：1，先揣摩上面的（略微模糊的）意思，感受要做的方向是啥；2，和人讨论讨论，想想怎么细化成可执行的路径；3，看看有哪些 block 住的技术难题，我和小伙伴先分别去试试水看看咋样；4，每日开会讨论对齐，定个小节点开始推进。真的是走一步才看一步，用得到 Agent 当然很好，但主要落脚点一定是要在能让项目组用上 + 能切实提高项目效率上。主要是似乎也没那么多时间真的去从头思考下整体的架构，毕竟项目那么忙，ROI 很重要。我当时是想做点深度一些的 Agent 的项目的，但有几个问题要能解决——1 是，Agent 真的是最好的解决方案吗，比如针对某些痛点，是不是就去做传统的工具优化更好；2 是，我有那么多时间去好好优化它到一个很好的效果吗，怎么去和上面要更多的时间，那就要有惊艳的 demo 出来去争取，那就更急了；3 是，作为特攻队，我真的有机会一直去做一个方向吗，整体项目组的痛点其实是会随着不断的解决而转移的，解决了 80% 之后 ROI 就没那么高了，上面怎么想也很重要。还好小伙伴们很靠谱，每天这样如履薄冰地思考也很有趣倒是。

---

* [Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)：`Fable 5 is state-of-the-art on nearly all tested benchmarks, with exceptional performance in software engineering, knowledge work, scientific research, and vision. The longer and more complex the task, the larger Fable 5’s lead over our other models.` [System Card](https://www-cdn.anthropic.com/d00db56fa754a1b115b6dd7cb2e3c342ee809620.pdf) 里有一些有趣的论述，比如`the model is not close to substituting for our Research Scientists and Research Engineers, especially relatively senior ones`, 还有 `capability is continuing to improve at roughly a constant rate, and it's not further accelerating.` 当然，现在用不了，也是很好笑了。
* 微软的 MAI-Thinking-1，带了非常详细的[报告](https://microsoft.ai/wp-content/uploads/2026/06/main_20260602_2.pdf)；说到微软，[Build 2026: Furthering Windows as the trusted platform for development](https://blogs.windows.com/windowsdeveloper/2026/06/02/build-2026-furthering-windows-as-the-trusted-platform-for-development/)，也是大量的 AI 内容，还有 Aion 1.0 Instruct 和  Plan 两个端侧模型，还是和 [Unsloth AI](https://x.com/UnslothAI/status/2061925637892297122)合作的！
* GLM 发了 5.2，Kimi 发了 K2.7 Code，谷歌的 [Gemma 4 12B](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)，另外刷到了这个有趣的模型 [nvidia/LocateAnything-3B](https://huggingface.co/nvidia/LocateAnything-3B)，足够小，瑞士军刀一样的存在，适合当眼睛，配合其他的模型作为脑子。
* [NVIDIA Nemotron 3 Ultra Powers Faster, More Efficient Reasoning for Long-Running Agents](https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/?linkId=100000424980294)，而且如何训练都在 [Developer Asset Hub for NVIDIA Nemotron](https://github.com/NVIDIA-NeMo/Nemotron/tree/main).
* [Patrick Jiang](https://x.com/patpcj/status/2063298457398636570):`I tried a simple idea: externalize the search state, then train the model to use that harness. The result is Harness-1: a 20B search agent that can match or even beat much larger frontier AI on hard long-horizon search tasks.` 喜欢喜欢，然后作者也用相同的 benchmark 测了 Fable-5/Mythos，结果`it’s the new SOTA. The performance gap is real.`
* [Gemini 3.5 Live Translate is here](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-live-3-5-translate/)，总看到有人会说巴别塔倒了，包括 X 上最近开始自动翻译各国推文了，也是很有趣的社会观察。说到 X，想到 Grok Build，至少 [Daniel Lemire](https://x.com/lemire/status/2064412388275671313) 大佬是在夸的。
* [Inference compute is becoming more important, and weights relatively less so](https://x.com/hxiao/status/2066000709695513053).

* [我们花了 1000 美金，问了 16 家 AI 公司，27 个大模型 29700 次：你是谁](https://mp.weixin.qq.com/s/sIB3f3_OeeUgMPlQ55-99Q)：`Anthropic 、 OpenAI 、 Google 是明显的身份净流入方。尤其 Anthropic ，被冒认 607 次，自己冒认别人 59 次，净值 +548 。 OpenAI 和 Google 更夸张：被冒认很多次，但自己几乎不冒认别人。另一端则是 Tencent 、 Doubao 、 z-ai 、 Kwai 。它们把大量跨厂自称送向了上游。` 当然一个模型自称 Claude、ChatGPT、Gemini，不等于它一定蒸馏过这些模型，只是还是很好玩。
* 很有趣的项目，[omni-macos](https://github.com/hanxiao/omni-macos)，用 jina-v5-omni 做的本地多模态搜索：` text query finds matching documents, code, PDFs, images, audio, and video together, because everything is embedded into one shared vector space.` 正在做游戏的我表示，那骨架数据、特效数据呢哈哈。
* [Implications of Large-Scale Test-Time Compute](https://x.com/polynoamial/status/2064210146558136827)：`We should change LLM evaluations to account for that by measuring performance vs tokens, cost, or time.` 确实吧，尤其是 Fable 那么贵。
* [Daniel Beauchamp](https://x.com/pushmatrix/status/2064722585019969727)：`Everyone's talking about AI-generated HTML. But have you tried giving your sites a zero-config API for saving data, file storage, AI, websockets, etc?` 确实，在 vibe 一个网页很快的基础上，公司内的基建做好的话，能大大解放生产力啊。

* [Students just have AI do their programming assignments. They seem to no longer do any work. It is just pure AI. I am not joking. Students complete an entire course, and then end up not being unable to write a 3-line function](https://x.com/lemire/status/2062715526636253385)，不管如何，家庭作业布置点编程题目这种形式确实应该与时俱进地优化掉了吧。
* Mike Acton 都亲自下场做 [agent](https://github.com/macton/nagent) 了吗：`nagent is a small reference implementation. It shows what terminal "agent-like" workflows are when you describe the mechanics instead of the metaphor... The agent is not the thing. The data is the thing.` 
* 引用大全是吧，[some notes on getting into frontier ai labs](https://x.com/itsreallyvivek/status/2062924410588406118)：`Richard Hamming often argued that great scientists distinguish themselves less by intelligence than by working on important questions... Herbert Simon observed that intelligence is constrained by bounded rationality: the world contains far more information than any individual can process`；还有这篇引用了本雅明，[Why share](https://redfloatplane.lol/blog/17-why-share/)：`Do drive-by LLM remixes (“Rebuild this but with X in place of Y”) have aura, and can you tell the difference? Why share something in the first place if the aura of the work you spent time creating can be stripped away or diluted by online commentators in a matter of moments to suit their taste? And most fundamentally - can work created with LLMs even be considered to have an aura, and, to what degree *can* LLMs be used before the lack of aura is palpable?`
* [Loop Engineering](https://x.com/addyosmani/status/2064127981161959567)，我每次都想不到这么优雅的词。

* [Finding Miscompiles for Fun, Not Profit](https://newsletter.semianalysis.com/p/finding-miscompiles-for-fun-not-profit?_gl=1*mhopti*_ga*MTY1NDExMjk2Ny4xNzc2MTIzOTQ1*_ga_FKWNM9FBZ3*czE3ODA2MDYwMzckbzYxJGcwJHQxNzgwNjA2MDM3JGo2MCRsMCRoOTczMjUwMzcy)，好文，其实用 fuzz 或者 AI 扫 bug 也不算新鲜事，但延伸的想法很有趣，能开 50 个 agent 去找代码库的 bug 意味着什么：`Things that were impossible five months ago are now “just” Very Expensive. A corollary is, if you don’t have the budget, you’re operating in a smaller part of the possibility space than those who do.`   
* [Do AGENTS.md Files Actually Help Coding Agents?](https://x.com/rasbt/status/2063649136323252397)，我一直觉得 Agents.md 要手写，最近做的一个项目还加了个 DECISION.md 记录重要技术决策。

* 学吧，蛮好的 Infra 爹写的入门文章：[A system programmer’s guide to LLM inference](https://blog.xiangpeng.systems/posts/how-to-llm-inference/)；学吧就，[The Imitation Game: State of Policy Distillation in Language Model training](https://chinmaykarkar.com/blog/OPD_blog/)，[Improving LM Studio's MLX Engine for Agentic Workflows](https://x.com/ostensiblyneil/status/2063006720616734835)，以及这个呼应 OpenAI 那篇文章的 [how to train your goblin](https://goblins.mchen.workers.dev/).

* Jeff Dean 在 the University of Washington Allen School 毕业典礼上分享的三个建议：`continuously learn new things, utilize modern tools to scale your capabilities and bring ideas to life, work on things that really matter to you and to the world.`

* [rsync and outrage](https://medium.com/@tridge60/rsync-and-outrage-d9849599e5a0)：`I’m retired (though my wife may dispute that!) and I’d rather be out sailing than working on rsync security issues, so I have reached for several AI tools to help with what needs to be done.` 我也想退休啊，活儿给 AI 干就好。
* [用网页控制虚幻引擎：一种全新的 UE 工具开发思路](https://zhuanlan.zhihu.com/p/2046736538218784473)，才发现作者是我老熟人了，不过这个思路确实很好，我之前也算是在实践这个吧。
* Sebastian Aaltonen 发了一个新的用 AI 生成美术资源的游戏原型 [Demo](https://x.com/SebAaltonen/status/2063953367718576249)，看评论区争议还不小。不过我关注的是制作侧，评论里他提到：`Raw AI generated assets from all the generators we have tried are horrible. Thousands of tiny UV islands. Doesn't LOD well at all. We remesh AI source assets to improve the topology. Then we reproject the high mesh geometric details on medium poly asset and bake new normal maps.` 确实，管线要弄好啊。

* 传统技术，老资历 ECS，[The First Entity Component System - An Interview with Marc LeBlanc](https://www.youtube.com/watch?v=73Do0OScoOU&t=1s)，很有趣；[How much do amd64 microarchitecture levels help in Go](https://x.com/lemire/status/2063358266885685710)；游戏优化指南，[Here’s how to go from drawing a few hundred trees to virtually unlimited in Three.js, step by step](https://x.com/iced_coffee_dev/status/2064364537969529036)
* [Do the hardest thing](https://justinjackson.ca/hard-thing)，继续每周鞭策拷问自己，我在做的事情是最难的吗。
* 终于借着读完《Think & Trade Like a Champion》的机会，push 自己把券商里的交易记录都导出来，让 codex 做了个看板来辅助我分析。我之前有这个想法，但是总是下意识延迟这件事情，可能是不敢面对自己吧，总是想沉溺于自己在赚钱的幻想中。唉，只能说数据是无情的。我发现我现在处于一个越学越混乱的过程，或者说知识的诅咒吧，学了反而让我畏首畏尾的。我的品味还行，但是操作一塌糊涂，唉，没亏本简直是奇迹啊。



