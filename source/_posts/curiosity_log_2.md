---
title: Curiosity Log 2
tags:
  - Curiosity
date: 2026-01-25
---



又是风平浪静的两周，开始实践白天 build、晚上阅读的方案，确实白天还是有很多那种走神的瞬间，可以慢慢调整。Ariel 不在的两周（她去西藏冰川玩了），我终于获得了理想中的大把时间，但也没用来写代码，用来“还债”了——把一直拖着的《约翰王》《读懂莎士比亚》《莎士比亚的政治盛典》读完了，补完了很久之前看了第一集的《和平使者 2》，看完了一直心心念念的《杀死比尔》1 和 2，写完了一直拖着的《灰色的寒鸦》读书笔记，还捡回来之前打了一半丢掉的 33 号远征队，今天还在玩。下周准备去读《知识分子与社会》，从文学里换个口味。

---

* 《灰色的寒鸦》最让我感觉到有趣的是，与卡夫卡在作品中表现出的那种阴郁与灰暗不同，他本人，按作者的说法：“他是我曾遇到过的最逗人快乐的人之一”。卡夫卡的工作也令人羡慕：“我们俩热烈追求的是一种普通频率的职位——即从早晨到中午两点或三点上班”，虽然只在特定的政府或半官方机构有这样的。另外就是一些卡夫卡周围的人的结局的残酷性：卡夫卡的伴侣之一米莱娜·耶森斯卡和他的三个妹妹均死于集中营。
* [我与 vLLM 的 2025](https://zhuanlan.zhihu.com/p/1962222805228708699)，我很喜欢的 quote：“钱什么时候都可以赚，有技能在身总不至于饿死。历史性的项目，错过了就遗憾终生。”
* [Heaps do lie: debugging a memory leak in vLLM](https://mistral.ai/news/debugging-memory-leak-in-vllm)，非常深入浅出的抓 bug 文章，一路从 debugger 到抓内存的工具到 eBPF，现代软件的复杂性：`Modern software stacks are built on top of layers of dependencies, each adding complexity and potential points of failure.` 另外，这标题绝对是借鉴了狼姐的《My hips don't lie》，最近很爱听。
* [The Bitter Lesson of Agent Frameworks](https://x.com/gregpr07/status/2012052139384979773)，核心观点：`All the value is in the RL'd model, not your 10,000 lines of abstractions.` 所以当 X 上说 Claude Code 基本全是 Claude 写的我当然是相信的（笑。
* [Which programming languages are most token-efficient](https://martinalderson.com/posts/which-programming-languages-are-most-token-efficient/)，果然不出意外地，动态语言更省 token，然后 DHH 大佬补刀：`Ruby is not just highly token efficient for the LLMs, but even more so for humans. Being able to quickly read and verify what's been written by AI is a real advantage. And AI just doesn't need the types that some programmers cling to.` 提到 Ruby，[LLMs and your career](https://notes.eatonphil.com/2026-01-19-llms-and-your-career.html)里也有个评论：`Zooming out, coding via LLM is not fundamentally different from coding with Rails or coding by perusing Stack Overflow. It's faster and more direct but it's still potentially just a human mindlessly adapting existing code.`
* [Giving University Exams in the Age of Chatbots](https://ploum.net/2026-01-19-exam-with-chatbots.html)，里面有一些作者作为老师很有意思的观察，让学生可以选择是不是使用 AI chatbot，学生会如何行动。
* [Opus 4.5 vs Codex 5.2 for Cloud stuff](https://x.com/giffmana/status/2012978224125411634)，一直都有很多这样的对比文章，我个人还是喜欢 Codex + gpt5.2-high，慢但是准。
* [Human In The Loop Policy For AI/Tool-Assisted Contributions](https://www.phoronix.com/news/LLVM-Human-In-The-Loop)，LLVM 也明确了 AI contributions 的一些规范。参考[I Know When You're Vibe Coding](https://alexkondov.com/i-know-when-youre-vibe-coding/)里说的，`Don’t leave a codebase’s maintainability to the weights of a model.`
* [Unsloth AI on X: "You can now run GLM-4.7-Flash locally on your device!](https://x.com/UnslothAI/status/2013482180564132092)，UnSloth 火力全开啊，真猛，我喜欢他们。
* [为了验证 DeepSeek 的极限，莫名其妙手撕了 GPQA 和 HLE 数据集，结果发现了 AI 界的“科学失格”](https://zhuanlan.zhihu.com/p/1997050680414840476)，评论区提到 HLE 的问题很大，现在基本上每家都是自己的科学数据。
* 一个不错的 agent skills 聚合站：[Agent Skills Marketplace - Claude, Codex & ChatGPT Skills | SkillsMP](https://skillsmp.com/)
* [Introducing Agent Readiness](https://factory.ai/news/agent-readiness)，再次，游戏行业的 Agent Readiness 太差了，尤其是那些太忙了在疯狂堆量以至于没空去从头整理的地方。
* 还有用 AI 来帮助辅助逆向来看性能的，[无源码逆向：深度剖析竞品性能](https://zhuanlan.zhihu.com/p/1995678473558176184)，主要 AI 用在了找函数名，肯定比手动的静态分析快多了，但对我工作没啥帮助，毕竟我自己有符号。
* 总感觉很久之前读过这篇：[Jolt 引擎如何实现确定性物理模拟](https://zhuanlan.zhihu.com/p/1897396694380941779)，但最近出现在时间线了，又读了一遍，确定性真难啊，尤其考虑到 LLM 的确定性：[Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)。
* 也是一篇旧文，[Hotspot performance engineering fails](https://lemire.me/blog/2023/04/27/hotspot-performance-engineering-fails/)，我主要是 SQLite 的优化的案例然后翻到这篇文章里有引用的，真的脑子不行了需要外挂大脑，模模糊糊记得有这么篇文章，但是搜不到，然后这里写了点自己的想法[jsjtxietian on X](https://x.com/xitin842468091/status/2013269176501010499)。
* [Why speed matters](https://x.com/lemire/status/1997024064074907899)，又被 Lemire 大佬激励了：`Now stop being so slow. Move!`

* 我自己的话，简单调研了下如何让 LLM 读懂蓝图，看下来最好的方式可能还是 MCP，虽然我很不喜欢 MCP。我更倾向于这个作为一个 skill 存在，但是自己去解析二进制的蓝图太麻烦了，而利用 UE 的 python remote execution 效果也因为训练语料，效果很一般。
* 学到了火焰图还可以看 Bottom-Up View / Inverted Call Tree，我之前的使用方式都是整体看 top down 的耗时，所以倒是一直没关注这块，然后瞬间发现某个要优化的函数里 20% 是 struct 的拷贝。。。
* 升级了下博客，买了个腾讯云的域名然后设定了下用 Cloudflare 的 cdn 加速，应该解决了大陆访问本博客的 Accessibility 问题。本想整个公众号的，但是它对外链的限制太严格了，加上之前了解到的竹白等产品也无了，还是选择回归博客网页的形式。但是微信的墙我解决不了，已经照着申请恢复访问的步骤都做了，但是，也没任何反馈，也还是有问题。

* 越来越觉得止损很快乐，那是一种把垃圾资产抛弃掉的感觉，非常上瘾，每一次的下跌都是对于持仓的考验与历练。
* 最近有一种模糊的感觉，在 LLM 时代，权力对于真理的生产更加顺畅了。当每个人都能以极低成本接触到这样一个巨大的“真理制造机”的时候，真不知道未来的公共讨论会如何。
