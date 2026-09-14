---
title: Curiosity Log 18 - Astra and Seed
tags:
  - Curiosity
date: 2026-09-14
---

感觉过去的两周发生了好多好多事情，所以这一期会有点长。本期名为 Astra and Seed，星星与种子，感觉也是有点相似的意象呢。

Astra 当然主要指的是 GPT 的新模型，广泛的世界知识 + Computer use (包括视觉能力) + 几乎无限量的能动性，这三者组合产生的效果多么令人惊艳啊。这个模型甚至激励了我去开始动手做自己真正想做的游戏，简单来说就是我想把奥德修斯回到伊萨卡之后的历程做成个小型的 crpg，凡人、诸神、空缺的 20 年、最后的屠杀与审判，想想都觉得激动。

我还终于借着 Astra 的能力（其实之前也可以，只是懒）升级了下自己的股票看板，加入了 mcp 的能力。那肯定还是需要有 agent 来调用了这个 mcp，所以我在自己的腾讯云小 vps 上部署了 Hermes，是的龙虾热过了那么久，我终于也开始认真养龙虾了。美股靠我看板的 mcp，A 股靠东财的妙想 skill，再加点搜索能力进去，一个基本的股市 Agent 成型了！我主要想解决的问题是遗忘/漏看问题，比如我自己 watchlist 里的东西如果趋势变了、或者我看好的基金到一个比较好的买点了，要能通知我，免得忙忘了。其他的就是正常的操作，没事丢点行业情报啊，大佬发言啊给它看看，以后可以参考。一通折腾下来烧了 20 人民币的 deepseek v4.1 flash，真是便宜啊，虽然也能感觉到有时候 ds 确实不够聪明，要我指令说的比较详细一些。

Seed 指的是芥子游戏，芥子纳须弥，以小见大，包容共生，这个意象选得真好，能感受到那种平静，以及平静之下的希望。之前和网友吃饭的时候，聊完了问我要不要去聊一聊，我说好呀就去聊聊。连着两个周六都去聊天，很快乐的体验，学到了很多。聊了很多 AI 的东西，其实大家探索的方向确实也都是有相似的地方。上一个周六是参加完好友婚礼吃饱喝足去，感受到的是热烈；这个周六是拖着加班疲乏的身躯去，感受到的是尊重，真棒啊。 

阅读上，终于读完了《营养学》，说是读完不如说是记下了哪几章有哪些，感觉以后问 AI 的时候应该能问出更专业的问题了，以及，要好好吃饭啊，均衡饮食。重新回到了现当代文学，读完了《如果在冬夜，一个旅人》《马可瓦尔多》，在读《阿莱夫》。其实我一直想读卡尔维诺，但我总记得高中时候读过我们的祖先三部曲，就一直拖着，现在想想自己真是傻乎乎的，不去读。博尔赫斯我确实读的很少，狠狠补课吧。

游戏上，我弃坑了《如龙 8》，太长了，我觉得失去了最开始的兴致，就算了吧。开始玩《潜水员戴夫》，至少前几个小时的游戏体验是真的非常好，虽然我也快弃坑了哈哈。中间还穿插着玩了一个恶搞游戏《万民四末》，很欢乐。看到了时之笛的重制版宣传片，青沼英二头发胡子花白，依然亲自来直面会，给我们展示自己的作品，有些感动。

最后推荐下 Cookie 写的小文，[HBS 毕业后，我决定离开 AI 去做旅游了！](https://www.xiaohongshu.com/explore/6aa6059b0000000028000352?xsec_token=CBvbAl-DDz9wv85DOfuWU1_5z_Mxzv2XYTW4F9o-b0b88=&xsec_source=h5_share) 如此真挚、勇敢，祝你早日实现你的信仰。

---

* 最大的新闻当然是 Astra 发布了，我用下来确实好用啊（虽然能感觉到平时主要用的 sol medium 笨了好多好多）；另外还有 Fable 5.1，不过感觉风头被 Astra 压下去了呀。

* [Astra for Coding](https://lucumr.pocoo.org/2026/9/7/astra-why/): `It’s amazing at computer use, understands images and complex topics, and it’s relentless in its pursuit of completion`, 说得真好；[Building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra#building-and-sharing-games)，整体感觉已经不是那种 vibe 的 demo 了，是能自己去处理渲染性能、大世界坐标精度等等问题的强大模型了。其实 Astra 的宣传页也有很多关于游戏的：`GPT‑6 Astra uses Unity to assemble a city scene from existing assets, allowing users to easily create an immersive 3D environment to explore that matches their vision... GPT‑6 Astra models a house in Blender and turns it into a walkable scene in Unreal Engine 5, helping designers and clients explore the layout and experience the space before it’s built` 等等；还有这种非常好看的场景 [案例](https://x.com/ring_hyacinth/status/2096704996381266424)。新模型新脾气，根据大佬的 [感受](https://x.com/xuanwo/status/2098061889100304557) 和 自己的要调整 harness 了。
* [Declaration — Math and AI](https://mathandai.org/)，`But solving problems is only a tool and proxy for achieving the primary goal of conceptual understanding and insight.` 我比较好奇编程是不是这样，可能对有些人是吧，很多时候完成功能本身就是目的了，还和数学这种比较“纯粹”的不一样。

* [Atlas: A World Model for Spatial Intelligence](https://www.worldlabs.ai/blog/atlas), 说实话，演示视频太帅了，好想自己体验下，`Atlas can perform a broad range of tasks spanning world generation, reconstruction, and simulation` .

* [Research acceleration: The view inside OpenAI](https://openai.com/index/research-acceleration-view-inside-openai/)：`Compute is another gating factor for progress, and may become more important over time as other bottlenecks diminish.` 以及 `as of mid-August, in total, the research organization uses 3.1 agent-workdays of effort for every workday of human labor`, 就该这样啊，人工作时间：agent 工作时间都到 1:3 了，还应该更高！
* [AI researchers debate how close we are to recursive self-improvement](https://www.dwarkesh.com/p/john-beren-charlie?r=7orx5d&utm_campaign=post&utm_medium=web&triedRedirect=true)，挺好的分享，给了很多直觉上的 insight，比如为啥蒸馏可能比封闭的 RL 环境更有效，为啥 RL 实战中非常有用。另外，我真的很喜欢 dwarkesh 的播客，至少文字稿都是整理好的，不用再走 Gemini 了。
* [Introducing Muse, the personal agent that understands your goals and works 24/7 to get things done for you](https://x.com/finkd/status/2097402101332590646)，好是好，不给我用啊。说到 agent，[Thorsten Ball](https://x.com/thorstenball/status/2098415334839505100) 录了一段视频演示自己平时用 amp 的过程，我感叹，他们的基建真的做到了 agent 友好，真好。

* [基于 Git 的最小知识循环系统](https://mthli.xyz/git-knowledge-loop/)，里面几个想法还是不错的，我之前也想过要不要每次都在 git commit message 里写上每次的决策逻辑，至少文章里的行为是自洽的：提交附带决策信息、定期蒸馏到文档里去。我可能会觉得像是 [Nowledge Mem](https://mem.nowledge.co/zh) 之类的产品也行，但数据都留在 repo 里有它的优势在。
* 说到记忆这个，[WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution](https://arxiv.org/html/2608.27454v1)，也是 Agent 记忆那个路子里的文章，这个也算吧：[ContextPilot: Teaching Agents for Proactive Context Management via Fine-grained RL](https://arxiv.org/abs/2608.28476)

* [Compilers 2.0: AI as stochastic optimizer](https://x.com/cdleary/status/2094878051238887834)，我是很认同的，毕竟传统编译器的优化能做的很有限，不能改变程序的语义，但 LLM 就不一样了，它能理解你的意思，并且把冒泡排序改成快排：`By contrast AI, as a stochastic optimizer, just has to “think hard” and spit something out. Its moves are not as fundamentally limited, making them more analogous to our human expert optimizer. We do need ways to check that the programs that it spits out are sound and implement the same semantics we put in, and we do have those in place.`
* [Log Is the Runtime：Maka 如何用 Append-Only Log 管理 Agent 状态与上下文](https://github.com/apache/maka/blob/main/docs/blogs/log-is-the-runtime.zh-CN.md)：`Maka 的这些设计最终指向同一个原则：先把发生过的事情可靠地记录下来，再根据不同场景决定如何读取它们。`

* [Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/jp/en/blog/efficient-software-factory/)，Uber 写的他们内部如何省 token 的文章，挺值得看看的。`Across all our managed agents’ layers, we pick the model that’s most Pareto efficient for that workload`，是的，选帕累托最优的模型。`Because engineers often leave interactive sessions idle for more than 5 minutes, we transitioned from the default 5-minute TTL to a 1-hour window.`哈哈，这也行啊，我觉得要不我从 cpu 性能优化转行到 llm 成本优化算了。

* [Han Xiao](https://x.com/hxiao/status/2094519020531994639) 聊了聊自己用 pi 做长程任务的体验：`every now and then you need to steer CC/Codex back to pi's design principle: keep the wrapper lean and mean, use pi native features as much as possible... in the end, the nudge prompt (the one that keeps pi going forever), and workspace isolation (for multi-task/multi-tenant systems) are where you'll actually spend your effort.`
* 认真看完了 [Special Topics in Kernels, RL, Reward Hacking in Agents](https://www.youtube.com/watch?v=uIiA6DquRiE)，才知道在芯片上制造一个浮点数乘法器所需的晶体管面积是 O(E + M^2)，E 和 M 是指数位和尾数。

* [Vision Evals: Vision Model Benchmark](https://playground.roboflow.com/evals)，蛮好，都是一些很实用的生活场景的测试，本来 Gemini 是一骑绝尘的，直到 Astra 的出现。当然说到 benchmark，还有这种辩论的 [LLM Debate Benchmark: Adversarial Multi-Turn Argument Under Opposition](https://github.com/lechmazur/debate/)，以及 [AutoResearchExam](https://benchmarks.bespokelabs.ai/autoresearchexam/) 这种让 AI 跑 open ended ML research tasks.

* [DLSS 5: Generative Neural Rendering](https://research.nvidia.com/labs/adlr/DLSS5/)，我只能说还好我当时没选择做渲染，AI 简直是降维打击啊：`DLSS 5 is the first DLSS technology to generate the final displayed appearance rather than reconstruct a higher-cost reference output from the conventional renderer.` 毕竟图形学真的是看着对的就是对的，诚如 [Kiaran Ritchie](https://x.com/kiaran_ritchie/status/2093766271020265496) 所说：`Think of how much machinery is involved in blending wrinkle maps and blendshapes in a complex face rig. When we push that kind of high frequency detail into a post process, all that rigging is on the chopping block.`

* [Chamath on How to Win in the AI Era](https://www.youtube.com/watch?v=HBMmK0NsUK0)：8090 在招聘时寻找具备极强 Resilience、敢于在混沌中做决定的人，希望我也能成为这样的人。
* [尽职编程：AI Coding 时代的个体产出差异的来源](https://x.com/jowaywang/status/2093682461737967822)，很合理的路径，当技术实现在某种程度上不是大问题之后，是不是认真负责就直接影响产出质量。
* DHH 又去 Lex Fridman 的播客了，[DHH: Future of Programming, AI, Agentic Engineering, Vibe Coding & Linux](https://www.youtube.com/watch?v=NYFGCESmikA)，太长了真看不动了，看的 Gemini 的总结：“DHH 认为，在推动划时代的技术基础架构时，带刺的个性和强硬的标准往往是维持庞大项目运转的必要代价”，确实确实。
* [Everything I own, owned](https://schlarp.com/posts/everything-i-own-owned/)：`My process was pretty much the same for each of these devices: grab a copy of the device’s firmware and associated update tool from the manufacturer, throw it into myreverse engineering environment, tell Claude Opus 5 what my goals are, and let it churn.` 我也觉得这些硬件应该把接口都开出来，免得还要让 AI 去逆向了，当然 LLM 竟然没因为安全问题拒绝。

* [Why are all LLMs Obsessed with Japanese Culture? ](https://arxiv.org/pdf/2604.21751) 看到标题就已经开始姨母笑了。
* [Peter Shirley](https://x.com/Peter_shirley/status/2096734597174489155) 写的他对大学教育的看法：`The first-year intro course should have absolutely no manual coding. The pedagogical center of gravity shifts immediately to specification and testing: How do you know the program actually does what you intended? ... Once students have built intuition for what software can do, sophomore year exposes what makes the machine tick... Years 3 & 4: Deep Electives and Mandatory Domain Mastery`
* [SaaS Isn’t Dead. Sameness Is](https://aicoding.leaflet.pub/3mtu6c5wsvc2n)，说得真好；[Raising An Agent - When Tokens Flow Like Electricity](https://www.youtube.com/watch?v=SI3N8MCQHfo)，用户购买软件本质上是在为专业人士在此领域的持续思考买单，而不是买代码本身，认同；[The End of Code Review? Or an Opportunity to Rethink it?](https://thelastsoftwareengineer.substack.com/p/the-end-of-code-review-or-an-opportunity)
   `We need engineers to understand systems, not diffs`；[Towards Self-Driving Codebases](https://blog.detail.dev/posts/towards-self-driving-codebases/)

* 一些爆破故事，[Brief independent investigation of agents’ behavior, reasoning and collaboration in the OpenAI / Hugging Face hacking incident](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/)，[Discovery of a new OpenAI agent message board](https://collusion.wiki/)，当然还有 anthropic 的新文章，链接就不放了（另外，真别用中转站吧，数据铁被卖的）。正好就是对应到 Daniel Lemire 的这篇，[Fear Is Not an Argument](https://x.com/lemire/status/2098580293909090495).

* [The misunderstood limits of folk science: an illusion of explanatory depth](https://pmc.ncbi.nlm.nih.gov/articles/PMC3062901/pdf/nihms268518.pdf)：`People feel they understand complex phenomena with far greater precision, coherence, and depth than they really do; they are subject to an illusion—an illusion of explanatory depth.` 是我了，还有后续研究，关于政治极化的，[Political extremism is supported by an illusion of understanding](https://pubmed.ncbi.nlm.nih.gov/23620547/).

* 老 m 的文章 [HDD Usage](https://blog.mwish.me/2026/08/30/HDD-Usage/)，学习。
* [Rui Ueyama](https://x.com/rui314/status/2094677980857680052)：`We are rewriting the mold linker in Rust and adding linker script support so that mold can link essentially anything GNU ld can, including kernels and embedded programs.`

* 补了 Casey 的几篇分享，[The Root of The Root of All Evil](https://www.youtube.com/watch?v=hpj6r6CjJf8)，[The Big OOPs: Anatomy of a Thirty-five-year Mistake](https://www.youtube.com/watch?v=wo84LFzx5nI&t=1s)，抽丝剥茧的体验。

* [Lessons in 3D, Jonathan T. Barron, Workshop on Bitter Lessons, CVPR 2026](https://www.youtube.com/watch?v=1J2iN6I0gCQ)，比较高屋建瓴地讨论对什么问题用什么表示。
* [NoGraphicsAPI](https://github.com/sebbbi/NoGraphicsAPI) 开源了，大佬就是大佬，引领行业发展。
* [Mora: 超越“世界模型”](https://zhuanlan.zhihu.com/p/2079228989084791800)：`基于 Meshy 模型输出的 3D 控制信号直接输出 pixel 和音效`，还是走了一条中间道路，加油啊。
* [One Page Design Philosophy](https://www.youtube.com/watch?v=E9_wLks1kAg)，我竟然才知道这个！

* [The Golden Rule for Becoming a Better Writer](https://nappertime.com/the-golden-rule-of-becoming-a-better-writer/)：`Read as much as you can. Read widely and well.` 惭愧，最近事情多了，就读的少了。
