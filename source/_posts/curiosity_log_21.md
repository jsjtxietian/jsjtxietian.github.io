---
title: Curiosity Log 21 - Raft
tags:
  - Curiosity
date: 2026-10-27
---

感觉这两周过了好久好久，这就是没有大小周之后的快乐吗。

最近依然就是下班就打开《沉星之序》，每天打一点确实还挺开心的，反正卡关了就去看攻略。偶然翻吹哥的访谈，他说自己也很喜欢《看不见的城市》（我偶然发现确实有艺术家们给这本书画了画册：[Making visible the invisible // Seeing Calvino | invasioni pervasioni](https://invasioni.net/2015/03/25/making-visible-the-invisible/)），另外也推荐了《爱因斯坦的梦》，读完了，有几个短篇确实很好。

因为去了趟北京，来回的飞机上倒也读了不少东西，我来回地读《社会学家的窍门》与《沉石与火舌》，读社会学累了读读诗，读诗读累了读读社会学，还蛮开心的。可惜飞机上没法直接问 Gemini 或者 ChatGPT 怎么解读特朗斯特罗姆，只能先自己体悟。还简单翻了几页《杜甫评传》，感觉不好读，找时间细读。去北京是因为调休要过期了，赶紧用用，说服我对象和我一起去玩两天。可惜天公不作美，周六日都是阴天，秋景一般。见到了一些好朋友，吃到了烤鸭和铜锅涮肉，开心。

去北京之前 setup 了一下 [Raft](https://raft.build/zh-cn/)，用着确实还挺舒服的。我到处和人推荐 Raft 哈哈，颇有一种未来已来的感觉。

---

* 新模型，似乎都还好，[GPT-6.1 Terra](https://x.com/OpenAI/status/2114780711664398349)，[Introducing Muse Spark Open](https://research.meta.ai/blog/muse-spark-open)，[Introducing Kimi K3.1 Pro](https://x.com/Kimi_Moonshot/status/2113680701770068067).

* [Securing our frontier model training environment | OpenAI](https://openai.com/index/securing-our-frontier-model-training-environment/)：`The agents found a way to communicate using the processor’s cache: a small, fast memory that holds copies of data that applications have recently accessed. Reading data from the cache is faster than retrieving it from main memory, and the agents used this timing difference to communicate.` AI 太强了。
* [How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/)，很好的文章，`I think of ambition in four types: Speed, Altitude, Depth, and Range.` 有了 AI，是时候多创造了，比如[这个](https://x.com/Saccc_c/status/2109962425512734739)就很好，用 Opus 5.5 将小王子的故事制作成了 3D 剧情游戏。 

* [Concerning behavior from a popular open-weight AI model](https://cohere.com/blog/concerning-behaviour-popular-open-weight-ai-model): `a weight file you can’t trust is still a black box, and running it yourself just moves the black box inside your firewall.` 以后会不会有给开源模型权重下毒的玩法？

* 说到开源模型，这里有一个不错的介绍分享：[Open Language Models](https://natolambert.com/slides/2026/harvard/lecture#1)；以及这种项目感觉也不错啊：[Abliteration | Unrestricted AI for High-Risk Work](https://abliteration.ai/)
* 回到 Meta 的模型，[Meta shakes up the frontiers, open and closed](https://www.interconnects.ai/p/meta-shakes-up-the-frontiers-open)，我在想，模型本身的护城河到底如何，`Of all of the players left in the race, betting on Meta, Gemini, and Microsoft financially seems much easier from a long-term perspective due to their rich balance sheets.`
* 说到微软，[Frontier Pre-training at Microsoft AI | Microsoft AI](https://microsoft.ai/news/frontier-pre-training-at-microsoft-ai/)，还没详细的白皮书，但已经可以看看了。

* [Planning with Agents: Divided Worlds, Boundary Objects, and Thicker Interfaces](https://maggieappleton.com/planning-agents)，挺不错的分享，从人机交互的角度提了蛮多洞见，以及介绍了这个，[Chopin](https://githubnext.com/projects/chopin/)，`A real-time multiplayer, agentic planning environment`，联想到了这个 [xMatrix — Living pages maintained by your AI agents](https://xmatrix.sh/).
* [How to Avoid AI Brain Rot - Miles Cranmer](https://www.youtube.com/watch?v=uXC7OuCas2Q)，很好的分享，使用 AI 成果的标准应该是，脱离 AI 后，你是否能够清晰解释并为其辩护？

* [How the Claude Code team does code review](https://x.com/addyosmani/status/2114604912520921136)，[“We should be more ambitious with the software we build”](https://danluu.com/ambitious/)，[One Year of Tinker: Turning Your Expertise into Custom Models - Thinking Machines Lab](https://thinkingmachines.ai/news/one-year-of-tinker/)，都可以看看。
* [How I work with Agents](https://x.com/thorstenball/status/2114386050638336082): `Knowledge piles up in the codebase: AGENTS.md files, skills, scripts, docs. But do agents actually use it? Spawn five blind agents, control vs. treatment, and find out. Agents are really, really good at running experiments.`  有趣，以及 `Threads are your company memory. "Why did we do this?" The more team uses Amp the more knowledge multiplies. Threads are connected to git commits. Game changer. Avoids duplicate work.`
* [Thorsten Ball (Amp): All the Models Want is Tokens and Tools](https://www.youtube.com/watch?v=7QkzdzwQp20)，[Raising an Agent - The Company of the Future (Season 2, Episode 6)](https://www.youtube.com/watch?v=deiLxNZH_DM)，[How Thorsten Ball Uses Amp, October 2026 - YouTube](https://www.youtube.com/watch?v=Z7l1EHfCMU8)，说实话 Amp 整体的工作状态确实令人羡慕。
* [Constructed Initial Context - Raft](https://raft.build/resources/blog/constructed-initial-context/)，这个想法还不错欸，我很喜欢，其实 Context 应该是像纸带一样可操纵的，数字世界就是有数字世界的优势啊。以及好多类似 Raft 的项目啊，[Kylon - Your first company harness. Where humans and agents run your business together](https://kylon.io/).

* [yetone/magpie: Every agent's model. One place. Codex on DeepSeek, Claude Code on Kimi, from the menu bar.](https://github.com/yetone/magpie)  这个 Privacy masking 挺有趣的。

* [Claude, don’t touch my lump - by Adam Mastroianni](https://www.experimental-history.com/p/claude-dont-touch-my-lump)，`This craftiness of ours keeps me humble about my ability to guess what’s going to happen next, but also hopeful that, whatever’s coming, humans will have a hand in it.`
* [On the Death of Amazon’s Writing Culture](https://alifeengineered.substack.com/p/on-the-death-of-amazons-writing-culture)，才知道亚马逊还有这个文化，蛮好的。

* [纯血 C++ 着色器：AOS/SOA 自动布局与加载优化](https://zhuanlan.zhihu.com/p/2097630291724612499)：`实际上在 AI 辅助 Coding 中我们已经发现使用 C++ 语言可以让 LLM 发挥出远超 HLSL 和 Slang 这些语言的表现, 无论是对算法的理解能力, 还是落地代码的专业, 完善度和优化程度, 都明显高出其他语言一节。我猜测这是因为 C++ 的算法相关语料庞大且质量高导致的`。
* 真不错，[Oblivion Remastered Mod Built Using Claude AI Boosts FPS By Over 40% And Drastically Reduces Stuttering Without Sacrificing Visual Quality](https://wccftech.com/oblivion-remastered-mod-built-using-claude-ai-boosts-fps-by-over-40-and-drastically-reduces-stuttering-without-sacrificing-visual-quality/)
* [Sony’s PSSR2 SIGGRAPH talk was great](https://x.com/SebAaltonen/status/2106025628562530416): `PSSR2 proves that domain knowledge still matters. They only offloaded the part that was tricky to generalize to AI.`

* Carmack 的讨论，[With 64 bit architectures, give every stack a virtual address space equal to the physical memory by default! You can do a surprisingly good job of memory management with just the stack](https://x.com/ID_AA_Carmack/status/2113675158154027495)，还在评论区发现了这个 [goose: The Goose Programming Language](https://github.com/aardappel/goose)，`Goose has syntax familiar to C and Rust programmers, but there is no heap. Every dynamic value lives inline on data stacks managed by the compiler.`
* [What agents mean for Rust (and vice versa) · baby steps](https://smallcultfollowing.com/babysteps/blog/2026/10/14/agentic-dev-and-rust/): `I also happen to think Rust is a really good fit for agentic development – but that’s not to say we can’t make it a better fit.`

* [Lantern Engine: run your own copy of Bloodborne on Windows](https://github.com/Awakenchan/LanternEngine)，我要玩 PC 的血源。
