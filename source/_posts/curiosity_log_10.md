---
title: Curiosity Log 10
tags:
  - Curiosity
date: 2026-05-16
---

最近因为直接转组了还挺忙，只能说慢慢来看这个活儿确实有趣吧，不急的话还挺享受的，队友也靠谱，可惜急急急。搞得我天天都很亢奋，静息心率直接 +10 了，这可不好，周末赶紧躺平。我也是摆烂了，CTO 让我们周六去加班的来着，我直接假装看不见，需要休息。

当然还是有盼头的，吹哥的《Order of the Sinking Star》出新的 trailer 了，期待，今年能玩到的好游戏是不少的；也抽空玩了好友 Woof 的作品《恶魔牌》，很有趣！更别提还可以等 GTA6 了。

---

* 继续大热，[antirez/ds4: DeepSeek 4 Flash local inference engine for Metal and CUDA](https://github.com/antirez/ds4)，作者也发了文章随便讲讲感想，几个点：`the release of a quasi-frontier model that is large and fast enough to change the game of local inference, and the fact that it works extremely well with an extremely asymmetric quants recipe of 2/8 bit, so that 96 or 128GB of RAM are enough to run it. And, of course: all the experience produced by the local AI movement in the latest years, that can be leveraged more promptly because of GPT 5.5`. 更触动我的是这个：`The last week was funny and also tiring, I worked 14 hours per day on average.` 作者是真的热爱这个项目啊，这种使命感很感染人。
* 也有大佬回应了这个项目：[Pushing Local Models With Focus And Polish](https://lucumr.pocoo.org/2026/5/8/local-models/)，本地模型如果能和云端模型一样开箱即用是最好的，不用去配置半天各种参数啥的。
* 可配合上文的 ds4 一起看，[What I Learned From Implementing LLM Architectures From Scratch (And How to Get Started)](https://www.youtube.com/watch?v=TXzQ7PGpO6w&t=8s).
* Hugging Face 也有这篇 [Two Years of Local AI on a Laptop: When Open Models Outpaced Moore's Law](https://huggingface.co/blog/mishig/local-moores-law): `The harder constraint going forward is the 128 GB ceiling.` 确实，local model 的上限还是被 local 设备的算力上限锁死了。 
* 一直很关注 Unsloth，[Unsloth Joins the PyTorch Ecosystem](https://unsloth.ai/blog/pytorch)，真棒。
* 这个也很有趣，[Interaction Models: A Scalable Approach to Human-AI Collaboration](https://thinkingmachines.ai/blog/interaction-models/): `At Thinking Machines, we believe we can solve this bandwidth bottleneck by making AI interactive in real time across any modality. This enables AI interfaces to meet humans where they are, rather than forcing humans to contort themselves to AI interfaces.`  加油啊！

* Vercel 非常有洞见的报告 [AI Gateway production index](https://vercel.com/blog/ai-gateway-production-index): `Anthropic leads in spend despite a higher unit price, Google leads in volume... Agentic workloads carry 59% of all token volume (up 2x over 6 months)`.
* 从这篇文章 [SFT, RL, and On-Policy Distillation Through a Distributional Lens](https://nrehiew.github.io/blog/sft_rl_opd/) 追到了这篇 [Coding Models Are Doing Too Much](https://nrehiew.github.io/blog/minimal_editing/): `Do Models Over-Edit? Yes, even frontier ones.` 我能感受到这个问题，虽然我一般都是全给 AI 写，不太关心这个问题，但让我感兴趣的是作者真的想办法把这个 Over-Edit 行为量化了，然后基于这个量化才会有后面的对比研究，真是漂亮。不加约束时，推理模型因为想得太多，反而比非推理模型更容易过度编辑；但加入约束后，推理模型由于指令遵循能力更强，能展现出极佳的克制力，非常合理。
* 回到这篇 [SFT, RL, and On-Policy Distillation Through a Distributional Lens](https://nrehiew.github.io/blog/sft_rl_opd/)，说实话我看得也晕晕乎乎的，大概感觉和这个问题有关 [为什么 MiniMax 大模型无法识别马嘉祺是谁](https://www.zhihu.com/question/2017049686331127666/answer/2036149386116342692)，官方给的答案是：`稀疏 token 遗忘的核心原因已较为明确：后训练数据对词表的覆盖不均匀，导致低频 token 的 lm_head 表征在 SFT 过程中发生漂移。而 input embedding 层的更新稀疏特性，让它仅仅丢失了生成能力而仍然保留理解能力。`

* [Now more than ever: building reliable software in the age of agents](https://www.youtube.com/watch?v=rUYP4C29yCw&t=1581s)，Jane Street 的基建是真的好啊，最让我感兴趣的：`Expect tests allow developers to see system behavior and create deterministic simulations at the library level.` 在 AI 时代这个价值真的被放大了，因为 AI 天然能读懂 Expect tests 的产物。
* 这个实践也非常有洞见，[Learning on the Shop floor](https://x.com/tobi/status/2053121182044451016): `There are a lot of coding agents in the world right now. What makes River special is a constraint: She only works in the open.` 当人和 Agent 的交互是公开的，这就变成了 `A teaching workshop. People started learning from each other.` 是这样，是这样！
* 一些 AI coding 的反思可参：[Passion for software in the age of AI](https://maxliani.wordpress.com/2026/05/11/passion-for-software-in-the-age-of-ai/)，[Agentic Coding is a Trap](https://larsfaye.com/articles/agentic-coding-is-a-trap)，[Im going back to writing code by hand](https://blog.k10s.dev/im-going-back-to-writing-code-by-hand/)，[A few major use cases for agentic coding for me](https://x.com/fchollet/status/2052505389154115845)，[Cognitive Surrender](https://x.com/addyosmani/status/2052124873208799378)
* 是很好的，[Building a safe, effective sandbox to enable Codex on Windows](https://openai.com/index/building-codex-windows-sandbox/)，可这个 bug 啥时候修  [Windows: bundled rg in Codex Desktop resolves on PATH but fails with Access Denied in integrated PowerShell](https://github.com/openai/codex/issues/13542). 功能迭代是很快，[Codex now works directly in Chrome on macOS and Windows.](https://x.com/OpenAI/status/2052480800004956323)

* 总感觉轮回了，[Using Claude Code: The Unreasonable Effectiveness of HTML](https://x.com/trq212/status/2052809885763747935). 另外还有这个 [Agent view in Claude Code](https://claude.com/blog/agent-view-in-claude-code)、[Live from Code with Claude: we're launching dreaming in Claude Managed Agents as a research preview. Outcomes, multiagent orchestration, and webhooks are now in public beta](https://x.com/claudeai/status/2052067399088664981)，外围工具要快啊，不快官方就下场做了。另外 A 社还有这篇 [Teaching Claude why](https://www.anthropic.com/research/teaching-claude-why)，也可以看着玩玩。
* LongCodeEdit 上的上下文效果[研究](https://x.com/nrehiew_/status/2052763179420377402)：`Opus 4.6, 4.7 and GPT 5.5 all have similar performance, with Opus 4.6 being slightly better overall.` 
* 也是超级有趣的研究：[How We Improved Agentic Search](https://entire.io/blog/improving-agentic-search-in-coding-agents): `The clearest result was that faster search alone only modestly helps, while better-ranked results improve first-query retrieval and help agents find the right code sooner.` 想想，如果有给 agent 设计的 lsp 这其实能解决一部分问题，但大部分情况下 grep 提供的 ranking 确实也不是那么理想。
* 这个[Crabbox](https://crabbox.sh/)感觉挺方便的，Peter Steinberger 说`Whenever I investigate a bug, I let codex recreate the exact state in an emphemeral crabbox, verify the bug, fix it, verify the fix.` 快速的云空间，

* 有点标题党，但可以看看 [Multi-Stream LLMs: Unblocking Language Models with Parallel Streams of Thoughts, Inputs and Outputs](https://arxiv.org/abs/2605.12460):`We’re training models wrong and it’s due to chatGPT... This bottlenecks even very intelligent agents to a single stream. The models cannot read while writing, cannot act while thinking and cannot think while processing information. In our new paper, see below, we discuss LLMs with parallel streams...`
* 这个看着也挺有意思的，[Sparser, Faster, Lighter Transformer Language Models](https://x.com/hardmaru/status/2052787980344099293) ： `We teamed up with NVIDIA to try to fix this hardware mismatch. Instead of forcing the GPU to adapt to the sparsity, we built a "Hybrid" format that reshapes the sparsity to fit the GPU.` 

* 是传统技术的文章，[A Technical Deep Dive Into the New Raycast](https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast)，混合了 native 和 Web 的 UI 方案。最有趣的其实是 yetone 大佬还基于这篇文章发了个 [native-feel-skill](https://github.com/yetone/native-feel-skill)，从文章/知识到 skill，还挺有趣的。
* 说到 yetone 大佬，看到他分享的 Yansu App 的[真实案例](https://x.com/yetone/status/2055204767220355437)还挺有趣的，虽然我不是很喜欢一切主动推送我什么东西的 app，但我确实一直很关注如何“监控”自己，发现自己的习惯中可以被优化的地方。
* [Stop typing. Start talking](https://x.com/EpicVogel/status/2052825103122239862)，最近好像除了 typeless 也有很多其他选择了，豆包输入法啥的，嘛，我想有个独立办公室，我肯定这样。
* [别再用 Claude Code 裸接中转站用啦](https://zhuanlan.zhihu.com/p/2036527621710813023)，我没仔细看解决方案，但想了想 Agent 时代，尤其是我慢慢都开始 yolo 模式，走中转站确实非常危险，[Your Agent Is Mine: Measuring Malicious Intermediary Attacks on the LLM Supply Chain](https://arxiv.org/abs/2604.08407).

* Onur Mutlu 的 GPU 架构课：[GPU Architectures (Spring 2026)](https://www.youtube.com/watch?v=aE0onltJlOo)，给了好多 ref，慢慢看吧。

* Dave W Plummer 的 [I've been coding for 40 years. Here are the top 5 things I wish I knew when I started](https://x.com/davepl1968/status/2054055451629940925)，很网红的标题，但确实是很扎实的工程经验，尤其是 `Manage complexity from day one`，嘛，AI 时代。。。
* 早看到这个我就不让 Claude 用 slidev 去画可视化了，直接抄：[How LLMs Work — A Visual Deep Dive](https://ynarwal.github.io/how-llms-work/).
* Roblox 真认真啊，[Scene Analysis has finally shipped](https://x.com/MrChickenRocket/status/2051950128903463130)，我都觉得可以抄这个内存的可视化了，可惜我现在不做性能了。
* [CPUs tend to get slower with time](https://x.com/lauriewired/status/2052435159203696955)，就猜到是因为安全问题 `Unfortunately, many microcode updates are security related, which almost universally cause performance regressions…or even complete feature loss!`
* 又重新看了看 [Hamming, "You and Your Research" (June 6, 1995)](https://www.youtube.com/watch?v=a1zDuOPkMSw)，唉，` 你所在领域最重要的几个问题是什么？你为什么没在研究它们？` 问到我流汗了，转到游戏 Agent 研发算是在解决游戏开发领域最重要的问题吗？我不知道。


* 上次说的 PPT 直接发成 github pages 了：[AI 与游戏开发](https://jsjtxietian.space/ai_pre_for_yx/1) ，整体还是有所体会的。基本上用 slidev 踩的坑其实经历过这一次也差不多了，整体感觉代码化确实有好有坏：好在可版本控制、组件可复用，坏在手动微调确实也不方便。在公司讲了讲，反响没有我想得那么热烈，唉，没意思，失去热情（笑）。
* 一直想写的 [交易反思](https://jsjtxietian.space/2026/05/11/trade/) 也终于找到时间写了，感觉还有很多没写的，但至少迈出了第一步吧。
* Perplexity 直接要求验证手机号了，+86 还不行，直接取消订阅了。唉确实 Perplexity 的搜索体验是不错的，可惜，以后要找个更好的服务来当我的股票研究的基础设施了。
* 因为从引擎组转到了 AI Agent 组，虽然忙多了，但也有好处，比如有了一些筛选简历的权限以及作为一面面试官的机会。感觉自己是不是也在有所成长呢，也许是吧，至少视野确实有点变化，比如我现在觉得自己的简历真的是太烂了。
* 最近忙到都没啥时间继续读书了，只能周末多看书学习，追忆似水年华看到马塞尔天天怀疑自己的对象，也觉得有点难读下去，还是不要代入太深比较好。另外也许这波牛要到头了，看怎么保护住自己的利润吧。
