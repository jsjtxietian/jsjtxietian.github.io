---
title: Curiosity Log 15 - The luxury of token-driven creativity
tags:
  - Curiosity
date: 2026-07-25
---

读完了（其实是翻完了）《尤利西斯》，在读相关的《最危险的书》放松一下脑子。这本书还是有很多让我觉得有趣的地方的，比如当时美国邮政系统的强大、邮政部报刊审查的强势，比如关于《尤利西斯》的出版不仅和文学有关，也与当时一战前后的社会风潮，前赴后继层出不穷的各种主义有千丝万缕的联系：`这是现代主义陷入僵局的形象：乔伊斯的小说代表了一场为自由而进行的斗争，而不是一座高雅文化的竣工纪念碑。`

打完了《逆转裁判 1》，正在逆转裁判 2。结果和朋友交流的时候，他们玩的都是日语配音版，只有我在“异议”“等等”嘛，关键我还没找到设置里有改这个的地方。好玩是好玩的，但也确实不适合一次玩 3h，还是挺累的，想到我《幽灵诡计》也是最后打得很累。还读完了《Momentum Masters》，可惜最近市场情况太差，把我震荡到起飞，还是多休息比较好。

月底了，token 用不完，就有点余裕去探索下之前自己一直想做但没空做的东西，比如研究下在大世界里 Play From Here 能不呢快一点，比如我让 AI 写了个 web 的 utrace viewer 可以直接拖入 utrace 文件看性能可视化，等等。我觉得富裕的 token 会极大激发我去 build 的想法，是能提升很大的创造力的，毕竟启动耗能减少了很多。其实有点类似谷歌的 20% 自由时间，不过谷歌提供的资源是时间，token 提供的是定量的智能。其实就现在这个情况而言，很多小事，与其去和老大申请、讨论可行性等等，不如业余时间烧 token 先把活儿干了，拿着 demo 去，更快。所以卡 token 这个事情虽然我可以理解，出于于成本考虑确实该这样，但一直要想着万一超额咋办也是一种心理负担。

---

* [Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)，我自己还没体验过，但有一篇这个 [The new rules of context engineering for Claude 5 models](https://x.com/trq212/status/2080710971228918066) 也值得看看：`We removed over 80% of Claude Code’s system prompt for models like Claude Opus 5 and Claude Fable 5 with no measurable loss on our coding evaluations.` 比如原来要和 Claude 说 `In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max. Don't create planning, decision, or analysis documents unless the user asks for them — work from conversation context, not intermediate files.` 现在一句 `Write code that reads like the surrounding code: match its comment density, naming, and idiom` 就 ok 了。

* THINKING MACHINES 出了新的模型，[Inkling](https://thinkingmachines.ai/news/introducing-inkling/)；[grok-build](https://github.com/xai-org/grok-build) 直接开源了，不错；[Huabu](https://github.com/microsoft/Huabu) 也挺可爱的。

* 仔细读了读 [The Smol Training Playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook#how-to-read-this-guide)，真的是宝藏，看似是一本详尽的模型训练手册，但其实里面把大量的基础概念都讲得很清楚，甚至还在 GPU Infra 那边简单教了教 GPU 的体系结构。诚如作者所言：`We’ll walk you through the complete journey—not just the final recipe that worked, but the failures, infrastructure breakdowns, and debugging processes that shaped every decision. You’ll see how promising small-scale ablations sometimes don’t translate at scale; why we restarted a training run after 1T tokens; how we balanced the competing objectives of multilinguality, math, and code while maintaining strong English-language performance; and finally how we post-trained a hybrid reasoning model.`
* Daniel Han 的新分享，先 mark 下：[Special Topics in Kernels, RL, Reward Hacking in Agents](https://www.youtube.com/watch?v=uIiA6DquRiE).
* 古有拼账号，现有拼 GPU，这个模式还挺有意思的：[NaN. Shared inference cluster. Open models. Community of builders.](https://nan.builders/)

* Raft 的几篇文章都不错，[How a Feature Ships, for Raft, on Raft](https://raft.build/resources/blog/how-a-feature-ships-for-raft-on-raft/)，[Don't talk to me, talk to my agents](https://raft.build/resources/blog/dont-talk-to-me-talk-to-my-agents/)，后一篇还是挺有意思的，说实话只是 AI 客服是真的没啥意思，这种 joint channel 的思路是真的不错。

* 还是挺有趣的文章，[You only need the frontier model for one single edit](https://stencil.so/blog/prewalk)，相比于原来大家一般认为的强模型出计划  + 弱模型做实现，换了个叫 `prewalk` 的思路，就是让强模型先深度探索代码库、梳理出任务 Todo 清单并做尝试，直到完成第一次有效的代码修改。此时把 context 移交给相对弱一些的模型让它直接继续，弱模型会“误以为”这是自己刚刚完成的操作，进而极其顺畅地沿着已建好的计划继续执行。
* 还有这个，[How coding agents read your code (and how to write for them)](https://modem.dev/blog/how-coding-agents-read-your-code)，虽然是老生常谈的东西，但是能化为给 Agent 的代码建议也是不错的；[Language model harnesses are compositional generalizers](https://alexzhang13.github.io/blog/2026/harness/)，没看懂但感觉好厉害。

* 卡马克的[感叹](https://x.com/ID_AA_Carmack/status/2080471606531403848)：`Sometimes I look out over a body of water and think about pixel shaders — superimposed waveforms, fresnel effects, intra-pixel maximum finding and analytical anti-aliasing. In the age of gen-AI rendering, this is like the old mechanics working on WW2 era piston planes. A craft of a prior era.` 不搞图形学是对的，哈哈哈哈哈。

* 迪士尼的这个确实帅啊，[A Generative Motion Rig for Artist-Driven Motion Authoring](https://studios.disneyresearch.com/2026/07/16/a-generative-motion-rig-for-artist-driven-motion-authoring/)；还有这个 [Introducing tldraw offline](https://x.com/tldraw/status/2077784657869902121)；然后之前的老板的项目，[Powering Multiplayer Interactive Worlds](https://ophilus.ai/blog)，生成多人可同时游玩的世界模型，牛逼。
* 游戏方面，[Announcing the Unity CLI](https://discussions.unity.com/t/announcing-the-unity-cli-a-new-way-to-connect-your-tools-and-agents/1731104)，要的要的；新书，[The Game UI Bible](https://www.lostincult.co.uk/gameuibible)；靠着同事发现了几个不错的 UE 插件，比如 [Relay - Fast Viewport Lighting](https://www.youtube.com/watch?v=Gn-dUj5VzEE)，[Ultimate To-Do List](https://www.fab.com/listings/e7acf090-cef0-4e22-bc39-85b7a85a79c5). 最近觉得大世界游戏还是要有个 web 版的谷歌地图啊，灵感来自于 [Assassin's Creed Origins: Monitoring and Validation of World Design Data](https://www.youtube.com/watch?v=VVq_hgaX8MQ)；
* 图形学大师 Naty Hoffman 的人生经验分享：[Lessons from Digging in Game Dev and Adjacent Trenches](https://www.youtube.com/watch?v=ISgTcDlZaLs)：`A setback is information, not a verdict. Don't abandon the destination, adjust the route... Workflow matters as much as technical details, especially when aertists provide the inputs.`
* 等这个开放吧，也会很有用：[Wintrace - Time Travel Debugging for Windows](https://wintrace.io/)
* DHH 的 [经验分享](https://x.com/dhh/status/2080751518417092838)：`Surround yourself with beautiful things that inspires you to reach for more. Then sweat the little details with the same zest. Not just because it makes for better products, but because it makes for a better you. Be someone who cares. About aesthetics, competence, all of it.`
