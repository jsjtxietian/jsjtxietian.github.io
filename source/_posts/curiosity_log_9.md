---
title: Curiosity Log 9
tags:
  - Curiosity
date: 2026-05-07
---
唉，这次更新又迟到了，这次是因为五一去广西玩了，内感洞、弄拉、通灵大峡谷、德天瀑布、蓝洞咖啡、明仕田园、南宁城里转转，喀斯特地貌一次看够，粉也确实好吃。我真还挺喜欢的，反正不懂的还可以问问 Gemini。我最喜欢的风景反而是司机带我们走一条小路去德天瀑布的时候，路在半山腰上，时上时下，看着下方的村落与上方的山头，绿意盎然。德天瀑布那边也很有趣，毕竟对面就是越南，中国这边人哗啦哗啦多，越南那边淅淅沥沥的几个，这对比也很有趣。

---


* 看到标题就笑了，[Opus 4.7 isn't dumb, it's just lazy](https://shimin.io/journal/opus-4-7-just-lazy/)，Amp 的评测也不错 [Opus 4.7](https://ampcode.com/news/opus-4.7)；说到 Claude，Claude code 降智原因调查也出来了，[An update on recent Claude Code quality reports](https://www.anthropic.com/engineering/april-23-postmortem)；还有 GPT5.5，又是 Amp：[GPT-5.5 In Deep](https://ampcode.com/news/gpt-5.5)，希望每个模型都有一个这样的 model card：[GPT 5.5 - Amp](https://ampcode.com/models/gpt-5.5).
* Kimi 2.6 发了，[Meet Kimi K2.6](https://x.com/Kimi_Moonshot/status/2046249571882500354)；deepseek v4 发了，很多文章，[DeepSeek V4 预览版本上线并同步开源，哪些亮点值得关注](https://www.zhihu.com/question/2030963929510310856/answer/2031519601733919763)，[我用自家公司的 BIOS 二进制文件，考了一次 DeepSeek V4 Pro——结果让我沉默了](https://zhuanlan.zhihu.com/p/2031825857543672813)
* [Two chips for the agentic era](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/eighth-generation-tpu-agentic-era/)，谷歌芯片分 TPU 8t: The training powerhouse 和 TPU 8i: The reasoning engine 了，有意思。
* 说到训练，[How GPT, Claude, and Gemini are actually trained and served](https://www.youtube.com/watch?v=xmkSf5IS-zw)；还有这个，[Where the goblins came from](https://openai.com/index/where-the-goblins-came-from/)，真的好好玩；Fine-tuning 教程：[Fine-tuning LFM2.5-1.2B-Instruct with GRPO ](https://leoniemonigatti.com/blog/fine-tuning-lfm2-5-1-2b-instruct-with-grpo.html)

* [ntroducing ProgramBench: 200 rigorous, whole-repo generation tasks where models design, build, and ship a working program end to end](https://x.com/jyangballin/status/2051677497562210552)，这个有意思，目前通过率全是 0，但确实从[这里](https://programbench.com/)可以看到，Opus 4.7 确实强。

* tison 哥的好文 [夜天之书 #119 Agentic Coding 的边界](https://mp.weixin.qq.com/s/x_FUUG4wBUqYs1H5DUtpgQ)，`软件质量缺少可量化回归指标`，`隐性知识需要真人提供`，说得多好啊；这个也是，[Code is free, technical debt isn’t](https://arize.com/blog/code-is-free-technical-debt-isnt-notes-from-ai-engineer-europe/)，[Software Fundamentals Matter More Than Ever](https://www.youtube.com/watch?v=v4F1gFy-hqg).
* 非常不错的 harness 总结，[Agent Harness Engineering](https://addyosmani.com/blog/agent-harness-engineering/)，以及 pi 作者的分享 [Building pi in a World of Slop](https://www.youtube.com/watch?v=RjfbvDXpFls)，这个也不错，[Harness Engineering 时代下有哪些优秀样例](https://www.zhihu.com/question/2021986352292537180/answer/2028563228460852446)；以及 ykiko 的新文章，[agent 时代的 clice](https://zhuanlan.zhihu.com/p/2034883949630059124)。
* 学到了新名词，[Mechanical sympathy](https://vickiboykis.com/2026/04/13/mechanical-sympathy/).

* [The peril of laziness lost](https://bcantrill.dtrace.org/2026/04/12/the-peril-of-laziness-lost/): `The problem is that LLMs inherently **lack the virtue of laziness**. Work costs nothing to an LLM. LLMs do not feel a need to optimize for their own (or anyone’s) future time, and will happily dump more and more onto a layercake of garbage.`
* [Agents Are Better Testers Than We Are](https://medium.com/@adamprout/agents-are-better-testers-than-we-are-30b1738114d6)，那确实；[Agents can now create Cloudflare accounts, buy domains, and deploy](https://blog.cloudflare.com/agents-stripe-projects/?utm_campaign=cf_blog&utm_content=20260429&utm_medium=organic_social&utm_source=twitter)，好啊，Cloudflare 确实很先进。
* [T$^2$PO: Uncertainty-Guided Exploration Control for Stable Multi-Turn Agentic Reinforcement Learning](https://arxiv.org/abs/2605.02178)，好友崔崔的 paper：`我们发现多轮 agentic RL 不稳定的根源之一是“犹豫”——模型在反复生成低信息量 token，看似在思考，实则原地打转。T²PO 用不确定性来约束探索，让 agent 少走弯路，训练更稳定。` 非常棒！

* 还有后续，[The Bitter Lesson of Agent Harnesses](https://x.com/gregpr07/status/2047358189327520166)：`The bitter lesson of agent harnesses: your helpers are abstractions too. Delete them. Let the agent write what it needs.`

* Jina AI 的分享很不错，[2026 年做搜索就是做 Agent Memory](https://mp.weixin.qq.com/s/93SsY__dxtsUPXhAPsjHCA)，顺藤摸瓜发现了 [MiroThinker](https://dr.miromind.ai/)；说到记忆，[吹了几年的 AI 个人知识库，为什么还是那么难用](https://mp.weixin.qq.com/s/DJtp4QUJtJHCnNU9yarsww)，这里的分层框架还不错。

* 谈带宽的显存容量比，[大模型时代的新 roofline](https://zhuanlan.zhihu.com/p/2029981166191780212)，`agentic推理已经逐渐滑向严重的memory capacity bound`，早点看到我就满仓海力士了。[Daniel Lemire on X](https://x.com/lemire/status/2048033674570899701): `The trend is clear: faster and faster memory.` [The Supply and Demand of AI Tokens](https://www.youtube.com/watch?v=LF3aUIM57uw)，由于复杂的强化学习环境和代码部署任务极度依赖通用计算，CPU 也处于售罄状态。[Why fat tailed costs emerge at scale](https://www.anjalishriva.com/fat-tails)，唉，`Long-context, agentic workloads, and more users compound tail risk; tail risk here refers not just to profit loss, but overcommitting resources and crashing systems.`
* 学学，[确定性的边界：从 GPU 到 Groq 的 AI 芯片谱系学](https://zhuanlan.zhihu.com/p/2031135579979638176)。
* 学学，[独家对话罗福莉：AI 范式已然巨变](https://mp.weixin.qq.com/s/zqnJuv5OVsNGEefM7RguqQ)：`要去做好Agent的Post-train。更具体说，是在Agent上怎么做好RL的scaling...至少在Chat时代，for研究、for Pre-train和for Post-train的用卡比例非常夸张，比如3:5:1，现在一个非常合理的用卡比例可能是3:1:1`。OpenClaw 我能欣赏它的产品，但确实没给我带来巨震倒是，虽然我确实觉得越来越有一个一直跑着 AI 的 vps 的需求了，难道是我比较后知后觉？
* [Getting Into AI Infra](https://timzaman.com/getting-into-ai-infra)，非常好的文章，其中的练习我想了想我大概没法马上画出来：`Another good exercise is to draw a cartoon systems diagram of a gaming PC and annotate the rough bandwidths between the components.`

* 每周都会看待 agent 帮助下的算子优化，[如何让 Claude Opus 4.6 写一个 100% CUBLAS 性能的 GEMM 算子](https://zhuanlan.zhihu.com/p/2028849708638979935)；也有这种 [How we got 207 tok/s with Qwen3.5-27B on an RTX 3090](https://x.com/pupposandro/status/2046264488832213174)，和这种 [llama.cpp-deepseek-v4-flash: Experimental implementation of DeepSeek v4 flaash in llama.cpp](https://github.com/antirez/llama.cpp-deepseek-v4-flash).
* 刷到了这本书，看着也不错，[《AI Systems Performance Engineering》略读小记](https://zhuanlan.zhihu.com/p/2034971147138286320)。
* [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot)，不是新文章，做 ppt 的时候发现的，写得很好。
* [Random thoughts while gazing at the misty AI Frontier](https://blog.eladgil.com/p/random-thoughts-while-gazing-at-the)：`AI will first automate away the things that are easier to form a closed loop learning system on. This is why code and AI research may be accelerated and then displaced quickly - you can have testable closed loop systems so machines can learn and iterate quickly. The tighter the closed loop, the faster the AI can learn. `

* Deep Research 进化了，但我似乎很久没用了，[Introducing Deep Research and Deep Research Max](https://blog.google/innovation-and-ai/models-and-research/gemini-models/next-generation-gemini-deep-research/).
* 可以对照看：[在 ChatGPT 中推出工作空间智能体](https://openai.com/zh-Hans-CN/index/introducing-workspace-agents-in-chatgpt/) ，[Introducing Gemini Enterprise Agent Platform](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform).
* 感觉谈 multi agent 的变多了，[Multi-Agents: What's Actually Working](https://x.com/walden_yan/status/2047054401341370639)，[How A2A and MCP work together: five integration patterns for building multi-agent systems](https://x.com/GoogleCloudTech/status/2047567704807346675)，[wanman](https://github.com/chekusu/wanman)，[One Developer, Two Dozen Agents, Zero Alignment](https://maggieappleton.com/zero-alignment)

* [How AI is reshaping developer choice](https://github.blog/ai-and-ml/generative-ai/how-ai-is-reshaping-developer-choice-and-octoverse-data-proves-it/)：`developer choice is shifting toward technologies that work best with the tools we’re already using.`
* [如何评价 Claude Code 核心工程师「Bash 即一切」的观点](https://www.zhihu.com/question/1992208967498236682/answer/2028074933238907033)，`LLM可能永远都无法非常擅长写Bash。Bash中，对引号、括号进行匹配是个 Dyck-k 问题。然而，Transformer的电路复杂度类别是TC0，因此，它非常不擅长处理这种需要在内部维持状态的工作，理论上就无法完成任意深度的配对任务。更不要说里面还常常会碰到带转义的引号，又要分门别类处理了。`
* 刷到一篇 Computer Use 的原理，[The internals of Computer Use in Claude Cowork & OpenAI's Codex](https://x.com/injaneity/status/2051730711712063994)，我就说为啥都在 Mac 上先出，Mac 的 Accessibility 做得好，所以 AI 也能更方便地看到那些 UI 控件，真有趣。

* 有大神在帮 OpenClaw 优化 OpenRouter 的 token 消耗：[we intentionally cut aggregate OpenRouter token usage by ~35%, down to ~400B tokens.](https://x.com/cherry_mx_reds/status/2048063265314340932)

* [Yansu App](https://x.com/yetone/status/2047701073474072712)，挺有趣的想法，让 AI 主动观察用户的行为，默默帮助你去 build 你需要的提效工具；[Kami](https://github.com/tw93/Kami)，纸张排版 skill. 
* [Warp is an agentic development environment, born out of the terminal](https://github.com/warpdotdev/warp) 开源了。
* [openclaw/mcporter: Call MCPs via TypeScript, masquerading as simple TypeScript API. Or package them as cli](https://github.com/openclaw/mcporter)，[xgrammar: Fast, Flexible and Portable Structured Generation](https://github.com/mlc-ai/xgrammar)，我竟然才发现这些。
* 好分析，[if-i-could-make-my-own-github](https://matduggan.com/if-i-could-make-my-own-github/)，虽然没啥关系，但最近 github 确实不够稳定。
* [Meet the New Visual Studio Debugger Agent Workflow](https://devblogs.microsoft.com/visualstudio/stop-hunting-bugs-meet-the-new-visual-studio-debugger-agent/)，很需要，crash 有 windbg-mcp 了，debug 也需要。
* 麦老师的 Agent，[KimiX：Agent Swarm 与更加高效的工具](https://zhuanlan.zhihu.com/p/2032812681472779550)
* 谈 Claude Design 和 Figma 的文章 [Thoughts and Feelings around Claude Design](https://samhenri.gold/blog/20260418-claude-design/)：`There’s an Arts and Crafts principle called truth to materials — the idea that a thing should be honest about what it is and how it’s made, rather than masquerading as something else. Figma ended up being the opposite of this: a set of extremely rigid schemas with a free-form “just vibes, man” costume over the top.`

* [Repairing the Ruins: Why AI Can’t Replace Education](https://www.ncregister.com/commentaries/schnell-repairing-the-ruins)：`We tend to celebrate knowledge: facts accumulated, results confirmed, information stored. But as the biologist Stuart Firestein has argued, discovery begins not only with what we know but with a disciplined sense of what we do not yet understand. That frontier is where large language models reach their limit.`
* 当然总有一些偏悲观的文章，[The West Forgot How to Build. Now It's Forgetting Code](https://techtrenches.dev/p/the-west-forgot-how-to-make-things)
* [C vs Python & LLMs](https://x.com/Varaquilex/status/2050672333489406353)，说实话我觉得和训练语料有关，但是给 agent 以 profile 工具以及一些提示，应该让它自己优化没啥大问题。

* 游戏上没看到啥，零散几篇，[游戏运行时 AI Native Debug 工程](https://zhuanlan.zhihu.com/p/2030321408509735061)，[米哈游坦白局：AI 全面升级游戏管线，崩坏 IP 正在做什么？](https://mp.weixin.qq.com/s/ECY99iEzWAHDv11-1Iz05w)

* 来点传统技术，这个有意思：[Launch WSL Applications from Windows with WslLaunch](https://trainsec.net/library/windows-kernel/launch-wsl-applications-from-windows-with-wsllaunch/)，能想象出一种混合平台编程；虽然很久不看图形学了，但是 [Metal Lossy Compression Format](https://www.ludicon.com/castano/blog/2026/04/metal-lossy-compression-format/)；[Mike Acton’s Expectations of Professional Software Engineers](https://adamj.eu/tech/2022/06/17/mike-actons-expectations-of-professional-software-engineers/)；[Daniel Lemire on X: "You can beat the binary search" / X](https://x.com/lemire/status/2048820249118880088)
* 好好睡觉 [Good sleep, good learning, good life](https://super-memory.com/articles/sleep.htm).
* [Hamming, "You and Your Research" (June 6, 1995) ](https://www.youtube.com/watch?v=a1zDuOPkMSw)，我也需要 Great Thoughts Time，时常觉得自己的工作太 trivial 了，一点也不重要，所以很没意思，也许我也该学着“每隔七年左右更换研究领域，可以防止思维僵化”，至少要一直学点新东西，不论是投资还是拳击还是做饭，不然太无聊了。

* 我自己在做个分享的 ppt，地址在这 [ai_pre_for_yx](https://github.com/jsjtxietian/ai_pre_for_yx). 用的是 slidev 的 skill + Claude Opus/Sonnet + cdp 截图反馈。Opus 太慢了我后面换成 sonnet，但确实体感 sonnet 的理解能力不如 opus. Claude Code 的很多小功能确实不错，btw, recap 都挺实用的。这次我还是让 AI 用 vue 组件或者 css 直接画样式包括图表的，还没上 AI 直接生成图之类，也许下次可以试试。说实话习惯了之前的所见即所得的编辑，有时候还是会被 AI 气到，即使 AI 可以自己截图来调整样式，很多视觉的东西还是自己控制比较安心。可能 slidev 确实就是不适合太精细，主打一个差不多就行，还好这次本也就是差不多就行。内容本身因为面向公司的，删了很多，反而体现自己的思考，到底要讲啥不讲啥。
