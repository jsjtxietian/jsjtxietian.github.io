---
title: Curiosity Log 4
tags:
  - Curiosity
date: 2026-02-25
---



过年读完了《个体的颂歌》和《股票魔法师》，也长胖了好多，唉。无聊的时候就和 Gemini 聊天，这不比刷其他东西有趣多了。

《个体的颂歌》真不错，这本书回答的问题是：个体的形象是什么时候进入绘画的？虽然最早迈出这一步的并不是 15 世纪的佛拉芒画家，然而，他们的画像标志着一个具有决定性意义的突变：从这一时期开始，在欧洲就再未停止过描绘个体形象。主要介绍了三位艺术家：康宾、凡·艾克和凡·德尔·维登，我之前只听说过中间那位，所以算是长知识了！最令我印象深刻的细节是关于光与影子的阐释：在中世纪绘画中，物体是没有影子的，因为它们存在于永恒的神性空间。作者观察到，保罗·德·林堡在《豪华本祈祷书》中引入了投射的阴影，在《十月》中，播种者和树木都拖着长长的影子。这意味着画面定格于一天中太阳处于特定位置的某一个具体时刻，个体进入了时间之中。说到光线就意味着时间的流逝，个体的到来，画家作为作者的视角，很有启发。

《股票魔法师》是我继利弗莫尔和克罗之后读的第三本投资的书，感觉整体的流派都是一样的，技术上越来越细节了，等我继续实践，但这本书翻译有点差，LLM 大人请发力吧！



---



* 真大佬 Karpathy 总能深入浅出讲 LLM，新项目[microgpt](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)，找时间学习下。
* [I improved 15 LLMs at coding in one afternoon. Only the harness changed](https://x.com/_can1357/status/2021828033640911196)，有趣，没想到 Edit Tool 也这么有讲究，Codex uses apply_patch，Claude Code (and most others) use str_replace，Cursor trained a separate neural network，但是 no single edit format dominates across models and use cases，而且 none of these tools give the model a stable, verifiable identifier for the lines it wants to change without wasting tremendous amounts of context and depending on perfect recall.
* LLM 时代的低垂果实，[financial-services-plugins](https://github.com/anthropics/financial-services-plugins)、[Remote Control - Claude Code Docs](https://code.claude.com/docs/en/remote-control)，慢慢都会补齐吧。
* 当然少不了龙虾，[You Could've Invented OpenClaw](https://x.com/dabit3/status/2021387483364151451)，一些 agent 会遇到的挑战写的很清楚。
* [The path to ubiquitous AI](https://taalas.com/the-path-to-ubiquitous-ai/)，牛；新的芯片[MatX One](https://x.com/reinerpope/status/2026351870852358492): `The MatX One chip is based on a splittable systolic array, which has the energy and area efficiency that large systolic arrays are famous for, while also getting high utilization on smaller matrices with flexible shapes.` 
* 都在谈 harness，包括[OpenAI](https://openai.com/index/harness-engineering/)，Anthropic 也发了[Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler).
* 然后 LLVM 大佬发话了，[The Claude C Compiler: What It Reveals About the Future of Software](https://www.modular.com/blog/the-claude-c-compiler-what-it-reveals-about-the-future-of-software)，比较扎实的文章，作者在高度赞美的同时，也指出：`Implementing known abstractions is not the same as inventing new ones. I see nothing novel in this implementation.` 然后说未来`The most effective engineers will not compete with AI at producing code, but will learn to collaborate with it, by using AI to explore ideas faster, iterate more broadly, and focus human effort on direction and design.`
* 还有一些谈 Bottleneck 的文章，比如[The Final Bottleneck](https://lucumr.pocoo.org/2026/2/13/the-final-bottleneck/)，`I too am the bottleneck now. But you know what? Two years ago, I too was the bottleneck. I was the bottleneck all along. The machine did not really change that. And for as long as I carry responsibilities and am accountable, this will remain true.` 还有 open code 的作者：[your org rarely has good ideas. ideas being expensive to implement was actually helping](https://x.com/thdxr/status/2022574719694758147)，想想确实如此。我真的很认同 pi 的作者[说的](https://x.com/badlogicgames/status/2022381224229244994): `bottlenecks exist to slow the rate of compounding errors. agent generated code still suffers from compounding errors and shitty architectural decisions.`

* [The Software Development Lifecycle Is Dead](https://boristane.com/blog/the-software-development-lifecycle-is-dead/)，死吧死吧，没啥东西；这篇也是，[Software Industrial Revolution](https://cannoneyed.com/essays/software-industrial-revolution)，反正说的都差不多，要变了要变了，但是我们软件工程师还是会被需要的。[Building A Distributed SQL Database in 30 Days with AI](https://kellabyte.substack.com/p/building-a-distributed-sql-database)，很多这种大概扫一眼我都不细看了。还有这个，[How I Use Claude Code](https://boristane.com/blog/how-i-use-claude-code/):`never let Claude write code until you’ve reviewed and approved a written plan`.
* [How will OpenAI compete?](https://www.ben-evans.com/benedictevans/2026/2/19/how-will-openai-compete-nkg2x) 这是在帮 OpenAI 焦虑吗哈哈。真不缺焦虑：[Your startup idea is their weekend holiday](https://www.youtube.com/watch?v=jgLJ5xas2ow)
* 有一系列不错的“解毒”的文章，比如，[Flood fill vs. the magic circle](https://www.robinsloan.com/winter-garden/magic-circle/)里提到，与物理世界的丰富和复杂相比，数字世界（AI 目前在的世界）的一切精密，仅仅相当于管中窥豹的竹管。几个很好的观察：工程师们奋斗了几十年想完善打印机，但它依然会卡纸，如果 AI 自动化最终没能填满物理世界，那是因为卑微的“卡纸”挡住了它的路；缝纫机的 Lock Stitch 也不是人类能缝出来的，它是为了适应机器的能力和局限而专门开发的，所以缝纫并不是被“自动化”了，而是被重新设计了；同理，橄榄采收也不是被自动化了，而是被重塑了，适合被机器采收的那几个品种被大量种植，全球橄榄油的味道也随之改变了。毕竟，世界没有互联网也能运行，互联网没有世界无法运行。Andrej Karpathy 说 [It's 2026. Build. For. Agents](https://x.com/karpathy/status/2026360908398862478)，但这一切都需要时间。[这里](https://registerspill.thorstenball.com/p/joy-and-curiosity-75)也有个反问，`does it matter that AI can’t touch the physical world, when your career is 99% digital and you’re looking at a screen a lot?`
* 当然 Lemire 大佬反手甩了一个 AI 解决不了的[问题](https://x.com/lemire/status/2024856097387897063)，神吐槽：`Writing YAML is sometimes akin to doing advanced research.`
* [Why I’m not worried about AI job loss](https://davidoks.blog/p/why-im-not-worried-about-ai-job-loss)，我也不担心，法律法规、公司政治、官僚僵化、地方性知识、对互动的偏好以及对改变的抵触，只要这些“人造瓶颈”存在，AI 就不可能瞬间冲垮现有体系，技术扩散的速度远比人们想象的要慢且温和：`The ordinary person, the person who works at a regular job and doesn’t know what Anthropic is and invests a certain amount of money in a diversified index fund at the end of each month: that person will most likely be fine. I don’t think they have much to worry about from AI.`
* [Why aren't smart people happier?](https://www.experimental-history.com/p/why-arent-smart-people-happier)，虽然我确实不够聪明，但在这个意义上，我对象绝对比我有智慧。`But if you split problems into well-defined and poorly defined, you’ll notice that all of AI's progress has been on defined problems. That’s what artificial intelligence does.` 有洞见，作者举了个例子，如果用古希腊的语料训练现在的 AI，去问它如何登月，它只会说月亮是一个神，你没法上去的，它没法意识到月亮其实是个卫星。当然现在是科学的时代了（AI 都可以自己去科研了），但大意上没啥问题。这其实是设计想参与的领域了，人类生活的 Ought to be.

* [AI fatigue is real and nobody talks about it](https://siddhantkhare.com/writing/ai-fatigue-is-real): `AI reduces the cost of production but increases the cost of coordination, review, and decision-making. And those costs fall entirely on the human.` AI 反而让人更累了，这个观察蛮好的：`you are collaborating with a probabilistic system, and your brain is wired for deterministic ones. That mismatch is a constant, low-grade source of stress.` 作者还提了些建议，大概是放弃完美、避免 FOMO、可以常规性脱离 AI 练练脑子等。
* 这篇文章也是，[The AI Vampire](https://steve-yegge.medium.com/the-ai-vampire-eda6e4f07163)，把 AI 比作吸血鬼，作者会在长时间令人上瘾的 vibe coding 之后困到睡着。建议是，多摸鱼，然后：`the new workday should be three to four hours. For everyone. It may involve 8 hours of hanging out with people.`
* [Tool Shaped Objects](https://x.com/WillManidis/status/2021655191901155534)换了个角度，提醒我不要让我对 AI 的使用变成 Tool Shaped Objects —— `It fits in the hand the way a tool should. It produces the feeling of work-- the friction, the labor, the sense of forward motion-- but it doesn't produce work. The object is not broken, it is performing its function. It's function is to feel like a tool.` 确实，太多 AI 的 use case 是伪需求了，但这也不是新东西，作者提到`Tool Shaped Objects are not new. Entire product categories exist in this space. The productivity app that you configure for three weeks and then never use. The Notion workspace with fourteen linked databases tracking a life that does not require tracking.` 提醒自己，玩归玩，但是要能真的解决自己的需求，而不是工具本身的上瘾。
* 胡渊鸣大神的[如何有效地给 10 个 Claude Code 打工](https://zhuanlan.zhihu.com/p/2007147036185744607)，没啥新的东西，但是里面有句话很触动我：`我带团队到夏威夷团建。在街道上看到很多处于 “度假模式” 的悠闲的人，猛然感觉这一幕非常魔幻：似乎这个世界上在发生的最重要的事情，和这些人无关。而下一秒的技术变革，就会摧毁他们一直引以为傲的求生之技。` 这扑面而来的优越感（只有我在做正确的、有未来的事情），里面掺杂的焦虑，也许就是现在 startup ceo 的真实写照了。不论是不是在 AI 时代，悠闲应该都是我的目标才是，而不是反过来。

* [Two different tricks for fast LLM inference](https://www.seangoedecke.com/fast-llm-inference/)：`Anthropic’s fast mode is backed by low-batch-size inference, while OpenAI’s fast mode is backed by special monster Cerebras chips` 作者也回复了一些其他人的评论，只是猜测，但看看还挺有意思。

* Addy Osmani[发话了](https://x.com/addyosmani/status/2026172457233829922)：`Auto-generated AGENTS(.md) files hurt agent performance and inflate costs because they duplicate what agents can already discover`. 还好我都是手写 Agents.md 的，我把这当作人类注入信息的一环。
* DHH [回喷](https://x.com/dhh/status/2025586871309377657) "if AI is so great, why isn't all software perfect yet"，至少 Sass 整体行业的股价是暴跌了，然后微软的 Windows 也是越来越难用，所以啊，虽然 AI 好，还是看用的人。
* [Child’s Play, by Sam Kriss](https://harpers.org/archive/2026/03/childs-play-sam-kriss-ai-startup-roy-lee/)，感觉还是对这些旧金山 AI 科技精英 (highly agentic 的人) 的很好的观察，Cluely 公司的介绍里还有一句挺有意思，`The future won’t reward effort. It’ll reward leverage.`
* [我们发现缓存命中率是影响推理系统的最关键因素，Agents 的运作方式极度依赖缓存命中率](https://x.com/Hx1u0/status/2022603484051464307)，Claude Code 那个例子我笑了。
* [Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)，这个不错，jina ai 也在做。
* Andrej Karpathy[推荐](https://x.com/karpathy/status/2021633574089416993): `DeepWiki MCP + GitHub CLI is quite powerful to "rip out" any specific functionality from any github repo and target it for the very specific use case that you have in mind, and it actually kind of works now in some cases.`

* [10 Years Building Vertical Software: My Perspective on the Selloff](https://x.com/nicbstme/status/2023501562480644501)，作者推演说，凡是能被 LLM 轻易模拟的能力（搜索、解析、基础界面、通用逻辑）都将商品化，而真正的护城河将收缩到专有数据、合规性认证和底层的交易系统上。 [这里](https://x.com/michaelxbloch/status/2020238247977242727)也提了一些行业。

* [2025 年终总结：从时序数据库到 AI Infra 的转身](https://tanxinyu.work/2025-annual-summary/)，谁不想做 AI Infra 呢！这里说得真好：`这几年下来，我的一个体会是：如果一开始因为阻力没做到极致，后面即便阻力消失，也很容易因为惯性而不再补齐；但如果一开始就把它做到极致并且做成了，后续“怎么优化效率”往往是可解的`。以及对于 LLM 的观察，我深感认同——`它最有价值的地方，可能不是“直接写出一个完美答案”，而是帮助缩小很多原本需要靠人脉、经验和踩坑才能补齐的信息差`。

* [Kiaran Ritchie on X](https://x.com/kiaran_ritchie/status/2021665775413866942)：`AI is like DLSS for deformations. It's absolutely the right way to do these types of high frequency details going forward. For offline stuff at least.` AIGC 的脸和毛发细节真的好。
* [LLM 的小丑牌排行榜 BalatroBench](https://zhuanlan.zhihu.com/p/2005592983425266064)，有意思，靠 API 控制小丑牌的，还不是靠视觉。
* 最爱的工具之一 Live++ 出了新[blog](https://liveplusplus.tech/blog/posts/2026-02-23-phase_1_build_information.html)，继续学习，这个 AI 一时半会儿确实取代不了。作者还有个新项目，["Project Echo" early pre-alpha footage](https://www.youtube.com/watch?v=K_sdN5-N4iA)，太牛了，PS5 上的确定性 Replay。
* [What is OAuth?](https://leaflet.pub/p/did:plc:3vdrgzr2zybocs45yfhcr6ur/3mfd2oxx5v22b)，OAuth 的作者出来解释什么是 OAuth, 竟然和当年的 twitter 有关。
* [RocksDB development finds a CPU bug](https://rocksdb.org/blog/2026/02/17/cpu-bug.html)，这个直觉很强了。
* [How I made a shooter game in 64 KB](https://www.youtube.com/watch?v=qht68vFaa1M&t=1s)，游戏复古技术大赏。
* 关于技术债，[Why the way we look at technical debt is wrong](https://www.bigeng.io/why-the-way-we-look-at-technical-debt-is-wrong/).
* [Does Syntax Matter?](https://www.gingerbill.org/article/2026/02/21/does-syntax-matter/)，是 matter 的，讨论了 coherence、consistency、scannability 这些。
* [Adventures in Neural Rendering part 2: Cooperative vectors](https://interplayoflight.wordpress.com/2026/02/21/adventures-in-neural-rendering-part-2-cooperative-vectors/)，看完的感觉是，在 shader 里用上 tensor Core 怎么还是那么难。这篇也有些相关的 [State of HLSL: February 2026](https://www.abolishcrlf.org/2026/02/10/HLSLState.html)
* 2026 年了，还有人在[抓帧](https://blog.simonrodriguez.fr/articles/2026/02/a_frame_analysis_of_dark_souls_iii.html)黑魂 3！
* [Twenty Five Years of Computing](https://susam.net/twenty-five-years-of-computing.html)，写得很有趣的回忆，这里看笑了：`In my younger days, when I solved tricky problems like these, people would sometimes call me smart. Now people simply saw it as a consequence of my experience.`
* [Do Less](https://usefulfictions.substack.com/p/do-less): `And if your optimizing machine is still humming along, even if you are doing rest-like activities, you are not truly resting.` 唉，日常工作做优化也有坏处，总想着优化自己，其实需要多休息，多打游戏。
* Do less 的[代码版](https://x.com/mike_acton/status/989001065893801984): 1. Can we not do this at all? 2. Can we do this only once? 3. Can we do this fewer times? 4. Can we approximate the results so no one notices? 5. Can we use a small lookup table? 6. Can we use a small FIFO? 6. Can we constrain the problem further?
* [How to Reclaim Your Brain in 2026](https://www.youtube.com/watch?v=YvWU4Zd-IMc&t=10s): `Focus Requires "Boring" Breaks: Deep focus is limited by previous sensory input. To improve concentration, you should limit phone use and embrace silence or boredom before starting a difficult task. ` 有启发。

* 听朋友说教育账号的 gemini 是阉割了的，gemini app 质量不如 ai studio。体感下来确实如此，尤其是 app 上的 flash 感觉降智严重，最近一个例子，我在让 gemini 帮我调 Slidev 的版式，但是 flash 就经常以为我其实是让它用 Nano Banana 画图，唉。我倒是有 api，但是用 app 不就图个方便，以及不用手动管理记忆（虽然对我而言记忆也没那么重要）。
* Substack 要 age verification 了，纯恶心人（但不怪 Substack），还好可以用无痕模式先绕过。
* 《股票魔法师》有个繁中版翻译更好，我想让 MinerU 给我 ocr 一下，结果发现它不能很好地支持繁体竖排的排版识别，本来阅读顺序是从右往左，结果 ocr 出来的文本是从左往右的。简单调研了下，[Umi-OCR](https://github.com/hiroi-sora/Umi-OCR/releases/tag/v2.1.5) 准确率差点意思，[PDF24](https://tools.pdf24.org/zh/ocr-pdf) 这个不错但不是我想要的那种效果，那只能，让 Codex 帮我拉下 MinerU 的源码改改看看了，因为 vlm 的模型其实字识别的基本是 ok 的，主要是排版，排版靠的是 python 代码。虽然最后看起来应该是 vlm 模型的问题，光改 python 的后处理代码不太行，但我发现了两点：1，聪明有时被聪明误，因为默认 Codex 没有联网权限，让它用 pip 装包的时候它就一直以为是我的 pip 或者杀软有问题导致它装包失败的；2，taste 还是不够，torch 它用了默认的 cpu 版本所以测试巨慢，我让它换成 gpu 的才好点。所以还是要盯着啊。



