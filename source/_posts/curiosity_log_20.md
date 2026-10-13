---
title: Curiosity Log 20 - Intentionality
tags:
  - Curiosity
date: 2026-10-13
---

好久不见！

在新疆旅游的行程中，我找时间读完了《沙之书》《看不见的城市》《帕洛马尔》，5h 的飞机确实非常适合阅读。路上反而读书时间少，白天太累导致晚上也很难集中精神，反而是可劲刷 b 站，唉。最近在读《知识的错觉》，里面关于科技的那一章确实可以改改了，成书时间是 2017 年，书中所言：`它们无法与你共享意向来追寻共同的目标，我们无法与技术达成共识，从某种意义上讲，这是因为机器和使用者之间除了最基本的判断以外，并没有在所知和所做方面达成任何共识`，在 LLM 时代确实可以修改修改了，当然也可以说似乎 LLM 可以和我们共享意向性是一种对齐带来的错觉，但是，LLM 还是太棒了。

游戏上，《余烬守卫》真好玩，《Order of the Sinking Star》真好玩，只恨自己没脑子，还好可以看攻略。

[Opus5.5 几乎 one shot 生成的达拉崩吧 PV](https://www.bilibili.com/video/BV1m2aB6TEXC/?vd_source=2ed13612df005a05ffd15b1da3dab557)，prompt 几乎只有 `给歌曲达拉崩吧 制作一个mv 代码的mg动画 自由发挥 需要按照歌词来 风格你来定 但是一定要精致，分镜连贯`，画面靠纯 Canvas 2D 程序化绘制，Opus 5.5 在理解了这首歌的有趣之处的基础上所发挥的创意确实太棒了。我也试了试让 Opus 5.5 直接给我的小游戏画点背景啥的，确实不错。

---

* [opus 5.5 is f*cking cracked at motion design](https://x.com/twoclipping/status/2103273003555402193)，赶紧让 Opus 5.5 给自己的网页优化了下动效。
* [Introducing Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/)，倒是发出来呀，我还持有谷歌呢！说到谷歌，看到做 rr 的大佬的离职信：[Goodbye Google](https://robert.ocallahan.org/2026/09/goodbye-google.html)，唉。

* Jev 的余威：[Microsoft-Decision-1: Our model for fast decision-making](https://commandline.microsoft.com/microsoft-decision-1-model-foundry/)，基于 Qwen 的；[Liquid AI vs Jev: When Decision Models Can See and Hear](https://www.youtube.com/watch?v=EjX3OQQNPoo)；还有新的用法，[Jev-as-a-Judge for Agent Evaluations](https://x.com/omarsar0/status/2107472222398886011).

* Grok Bot 的大佬的分享：[Stanford CS146S: How always-on agents work](https://www.youtube.com/watch?v=L1OBRtfPS34)，里面有些挺有趣的，比如可以在用户正在输入时服务端提前预热 Prompt Cache，比如要随时准备好重构产品，假设当前模型是未来最差的状态，保持简单，不去设计复杂的 UI，等等。

* Andrej Karpathy 又在讨论 [gap in shared understanding of LLM capability](https://x.com/karpathy/status/2109361546505966046): `The general public has mostly not interacted with these systems. When they have, it looks like a derpy chatbot. The majority of professionals still see only a modest uplift. And a small sliver of professionals are experiencing the vertigo of the curve going vertical.` 是我不想用内部满血版的 AI 吗？是不给我用呀（以及没钱呜呜）。
* [An age of experimentation — BlueHat Asia 2026](https://thomasdullien.github.io/about/slides/An-age-of-experimentation-BlueHat-Asia-2026.pdf):`fire was discovered, and humanity had little understanding of how it works. absent abstract models, experimentation was the only way to advance. reasoning LLMs are more like fire than like the internal combustion engine.`
* [I wrote my own pi subagent manager, and here's why](https://x.com/championswimmer/status/2107883453811233185)，确实 pi 是真不错，以及 `Opus 5.5 and 6.1 Sol are actually the first set of economically feasible models that can use subagents as a feature properly. And hence I have increasingly become someone who writes "use subagents" at the end of my prompts.` 说到 Pi，已经发了 1.0 了，出了 [Codemode](https://pi.dev/docs/latest/codemode)，以及 [Pi Durable](https://earendil.com/posts/pi-durable/): ` Pi Durable was built specifically for long-running, durable, and malleable agents that can run anywhere...Pi Durable is built so your agent can understand it.` 还有这个 [Introducing Strands harness](https://strandsagents.com/blog/introducing-strands-harness/).
* DHH 的新分享，[Rails World 2026 Opening Keynote - DHH - YouTube](https://www.youtube.com/watch?v=vDjW_dRyKXY)，诚如评论所言：`This is the most confusing funeral I’ve ever experienced.` 然后 DHH 还回答了关于他自己用啥 harness 的问题：` It's really just any harness, multiple agents concurrently, barely any skills, and using adversarial reviews... a weird inversion with LLMs is the models improve faster than the tinkerers. when i see people with custom workflows and setups they're all addressing problems that don't exist anymore.`
* 另外这个分享也还行，[Context is now the product: Product leadership when software can build itself](https://www.youtube.com/watch?v=Zn9NZ-r1-C4)，AI 帮助我释放出来的资源和时间，应当投入到深入理解客户需求、锻炼判断力与打磨品质上，很多小巧思，比如 Quality Wednesday、Feature Roast 等。
* tison 哥的新文章，[还能组一辈子开源乐队吗](https://x.com/tison1096/status/2108774196210020818)：`如果把时间线拉长到三十年、四十年，我们就能惊讶地发现，这种直接交换源码，直接修改源码以满足自己需求的方式，正是开源软件，或说自由软件的最初的模样`，确实如此欸！
* [lauren on X](https://x.com/poteto/status/2109110547824378140): `agents help us move faster...it won't be Good Code (that is still expensive), but it is likely to be much better on average at scale.`  [这个](https://felixrieseberg.com/made-by-mechanical-means/) 也是：`as a manager, you have to find ways to establish quality without reviewing every single change your people make.`
* 要不直接做手机去吧，[What Even Is An OS Now? — A Final Ward](https://sockpuppet.org/blog/2026/09/25/what-even-is-an-os-now/): `the core purpose of a modern operating system is to partition different applications off from each other, and carefully control how they can communicate. It makes less sense in the world we’re heading to, where most of the software we’re carving up fiefdoms for has the same provenance. And it makes almost no sense in a world where every application is malleable...  That’s what we’re working on: a platform that is the device we would want to have in the world I just described. So: we’re building a phone.`

* 好友推荐的 skill，好酷啊，[Anatomy](https://skills.wheresryan.sh/anatomy): `Name an idea in one line, and Claude draws the machine that does it`, 不知道为啥，第一反应是好像可以让它可视化抽水马桶怎么工作的。
* [Introduce OpenDocRouter - a unified API for document parsing with the latest frontier and open-weight models](https://x.com/jerryjliu0/status/2107864677611139096)，这个好，下次 MinerU 不够用了就来用这个。
* 好时代啊，[Building a personal super app](https://wilhelm.substack.com/p/building-a-personal-super-app):` But the beauty of the current age is that we can build experiences that are hyper-personalised and tuned exactly to our needs.`
* [GLM-5.3 and the spread of advanced cyber capabilities](https://www.anthropic.com/research/glm-5-3-and-the-spread-of-advanced-cyber-capabilities)，也是好起来了。
* [The Future of Version Control After Git](https://loadingalias.dev/posts/git-won-version-control-isnt-finished)，挺好的文章，结尾也是：`Unfortunately, Git is good enough - until a successor is much better`.
* 随便看看的，你觉得哪一项计算机技术被大众严重低估了，[比如时钟同步技术](https://www.zhihu.com/question/2078550836104394358/answer/2085411135587627090)。

* 职场技巧，[I don't want the details](https://michaelheap.com/i-dont-want-the-details/):`Sometimes the most useful thing a leader can say is: I believe you. I don’t need the details. Tell me what we're changing.`

* 这个关于网页的游戏有创意，[Destroy Any Website - Sprite Fusion](https://destroy.spritefusion.com/).

* [omdrop-owl: airdrop for non-apple devices](https://github.com/t4t5/omdrop-owl)，下次试试。
