---
title: Curiosity Log 13
tags:
  - Curiosity
date: 2026-06-27
---

mwish 前阵子送了我一本《营养学》，最近睡前不想看美股（跌麻了）就没事翻翻，还挺有意思的。翻到运动营养学那边说其实比如 30 分钟的跑步完全没必要喝市面上的那种运动饮料，深有感触。我以前减肥的时候，或者说想减肥的时候，工作日都会在公司跑步机跑 4-5km，但我会带着一瓶运动饮料去，晚上还喜欢喝椰子水。然后我和 Gemini 老师聊健身的时候，顺便问了下椰子水这个事情，才意识到我不仅应该只喝白水，而且不该晚上喝这种会升糖的饮料。现在又在营养学这本书里看到，也算是验证了 AI 的观点。扯远一点说，有了 AI 的话，看这种科普书还有价值吗？我想是有的，但价值不仅仅是在知识传递了。优质的科普书更像是一份经过人工审核过的优质地图，AI 则是一个十分有耐心、知识渊博但不会主动关心我的老师，我可以从地图中发现我感兴趣的事情，去找老师请教。但，减肥还是好难。

端午三天都在躺着（广州这个天气啊），打完了 007，当然有很多小缺点，但瑕不掩瑜，确实有小时候看 007 的感觉，那个味对了，弄得我都想去玩杀手系列了；也体验了下《Order of the Sinking Star》的 Demo，很喜欢这个美术和音效，但我确实这脑子不太适合推箱子也是真的。最近上班压力越来越大，真的没啥心思去继续普鲁斯特的文学批评了，《普鲁斯特的空间》《普鲁斯特与符号》当然是好书，但我最近脑子真不够用了（也和最近几年越来越不喜欢很后现代的解读有关）。这时候我一般就回到古希腊，虽然这次不是荷马，是回到了赫西俄德，《神谱》《工作与时日》，慢慢读吧。

说到上班，最近又开始大小周了，其实今天就是在周六上班的时候写的这份 Curious Log. 仔细想想在 Garena 的三年只有一次周六被迫去公司半天加班，果然离开了才发现前司的好吗（就不说以前在 ApexM 的时候了，那时候强度可太大了）。作为一个摸鱼高手 + 一个不喜欢被迫做事的人，只能表演上班了！事情当然是有的，可惜我就是不想干，保护自己的身体健康和情绪可太重要了。不过我确实在让 AI 做点 side quest（我咋感觉 CC + dsv4 pro 体验很一般呢，不过可能是我 key 的问题，需要连着官方服务排查一下），就看抽卡能不能成功了。

猎人都更新 411 话了，生活还是很有希望的！

---

* [Previewing GPT-5.6 Sol: a next-generation model](https://openai.com/index/previewing-gpt-5-6-sol/)，这起名字也是好起来了，Sol,  TErra, Luna. METR 的 [评测](https://metr.org/blog/2026-06-26-gpt-5-6-sol/) 也挺有趣的：` METR observed substantial situational awareness and reasoning about the evaluation environment.` AI 知道你在测试它 hh.

* [The Topological Trouble With Transformers](https://arxiv.org/abs/2604.17121)，我觉得很有洞见的一篇文章，里面举的例子很有意思：`In a standard decoder, activation flows strictly upward. If a model resolves a complex concept (like "river bank") at layer 12 in step T, step T+1's early layers cannot access it. The model must rebuild the state from raw history, leading to logical flips.`  对于一个多义词 bank，可能模型在第 12 层确定了它是岸边那个 bank，但对于前几层来说，这个信息是没法往下传递的，如果后面又出现了 ATM 啥的，可能前几层网络就会认为这是银行那个 bank，造成混乱：`Although the transformer’s feedforward design has expanded the limits of context-based retrieval, its topological structure remains fundamentally at odds with the iterative nature of state tracking.` 从这个角度上看也可以解释一小部分为什么模型越大越强吧，以及 COT 为啥有用，当然作者也是”批判“了 COT 的：`Allowing a model to talk to itself, whether in natural language or latent space, sends signals from deep in the transformer to shallow layers, thereby propagating state forward... However, the reliance on intermediate outputs to track micro-state may perform wasteful computation steps and unnecessarily consume the context window.`
* [Evaluating Large Language Models in Scientific Discovery](https://arxiv.org/abs/2512.15567)，神句：`Shared failure modes among top-performing LLMs. When comparing the top performers across different providers (i.e., gpt-5, grok-4, deepseek-R1, and claude-sonnet-4.5), we observe that their accuracy profiles are highly correlated, which tend to rise and fall on the same scenarios. Moreover, top-performing LLMs frequently converge on the same incorrect set of most difficult questions, even when their overall accuracies differ.`
* [NVIDIA ACE Game Agent SDK](https://developer.nvidia.com/blog/build-on-device-ai-companions-with-the-nvidia-ace-game-agent-sdk-and-unreal-engine-5-plugins/)，感觉很不错欸，而且 API 是我一直关注的 [Sherief, FYI](https://x.com/SheriefFYI/status/2066971180989604026) 大佬设计的。东西是真的多，Agent、Chat、RAG、ASR、SLM、TTS，应有尽有。
* [Introducing Engram: Scaling compute on your context](https://x.com/EngramLab/status/2069465879696576844)，做定制模型的来了：`we start from strong pre-trained models and spend training compute on the context you care about...Our north star is a single training algorithm that can absorb arbitrary amounts of data into a model that gets continually better. We currently run this process on all of our company data every day, but are moving towards retraining every hour, and eventually, every minute.`
* Midjourney 很神奇的项目，[Midjourney Medical](https://www.midjourney.com/medical)；这个也不错，从 [searchbox](https://github.com/hanxiao/searchbox) 看到 [dataroom](https://github.com/hanxiao/dataroom)，Jina 的老大好活跃：`In my view, search is test-time compute (TTC): you wire trained embeddings, rerankers, multi-vector retrievers, query expanders into a pipeline at test-time to squeeze out relevancy. Don't scale TTC, say a keyword search hands you the answer, and it's probably not good enough. Scale it, say add embedding search then filter with a reranker, and you most likely get a better one.`

* [On the Interplay of Pre-Training, Mid-Training, and RL on Reasoning Language Models](https://arxiv.org/abs/2512.07783)，好想自己做研究！先从这个开始学吧，[RLHF & Post-Training Course by Nathan Lambert](https://rlhfbook.com/course).

* [antirez on X](https://x.com/antirez/status/2066236816261325224): `If you need AI to do a search for you in the real world, ds4-agent is basically SOTA... In MacOS I run the browser the first time it is used with -g, create each tab in background with CDP, so basically you never see the window unless you don't click in the icon, but it is a real browser without limitations. Everything works: YouTube comments can be fetched, Google searches, ..., btw everything is in ds4_web.c`.

* [The doom justifies the valuation](https://geohot.github.io//blog/jekyll/update/2026/06/19/the-doom-justifies-the-valuation.html)，虽然我确实很喜欢 GLM 那种偏技术的 blog，但我也不讨厌 Anthropic 那种偏思辨的 blog 风格，看看人家取名字多有水平：Haiku, Sonnet, Opus, Fable, Mythos... 当然 OpenAI 也赶上了。
* [礼崩乐坏的时代：）](https://zhuanlan.zhihu.com/p/2052472619958527207)，挺好的回顾：`讲道理，看上去只要TSMC忠义无双还是满产不烧厂，传统电子消费就会继续被放血去喂AI这个吞金兽。就得继续冲DRAM的股票。只要算力芯片不停放量，存储涨价的逻辑就不会反转，存储标的长期利好。。。嗨，这世界大抵是病了，Logic拼命向前跑，却成了DRAM大宗商品周期的高级打工人。` 但反过来说，美光回怼苹果也有道理，当年你对内存压价压那么狠，早知如此，何必当初啊。
* [Introducing Claude Tag \ Anthropic](https://www.anthropic.com/news/introducing-claude-tag)，这不是 [Raft - Where humans and AI agents build together](https://raft.build/) 么！

* [Three Years of r/ChatGPT: Societal Impact Evaluations from Social Media Data](https://arxiv.org/abs/2606.05750)，感觉 AI 的影响确实足够，真的是很适合各行各业去研究，社会学、传播学、人类学等等。当然还有这个，[New paper: every law in America is technically public. But not really, until now](https://x.com/barrowjoseph/status/2067993371541492025)，笑死我了：`California and Florida, you need to get your shit together so people can actually understand your laws! And Ohio and West Virginia, wtf is going on with how you run people's lives??`
* 到游戏，本周大新闻就是，Sandy Petersen 对 Quake3 的 [复盘](https://x.com/SandyofCthulhu/status/2069592209645785294)，里面有 `We worked long and hard, and I think it broke us spiritually`；然后 John Carmack 也出来了：`I pushed everyone too hard. I didn’t appreciate how maturing companies need more slack, and that running people at startup intensity constantly will wear them out... Sorry, Sandy.`  马斯克也评论说 `But Quake was an incredible game. Great products are not made without pain and extreme dedication.` 我想也是，虽然我很在意 WLB，但想办好事情，其实真的很难。
* Kiaran Ritchie 直接说 [You're all doing IK solvers wrong](https://x.com/kiaran_ritchie/status/2069135923108008009)，我不太懂这一块，看着挺有道理的，更有意思的是，AI 时代，直接让 AI 搞个 demo 验证下就行，比如 Mike Acton 就做了 [Single-Chain IK — Length + Direction](https://macton.github.io/single-chain-ik/).

* [从 5.9ms 到 1.0ms：一个 byte store 如何让 for 循环慢了 6 倍](https://zhuanlan.zhihu.com/p/2048571053698502907)，读了一半猜到是 load-store forward 的问题了，好文。
* pgo 是真的好，msvc 终于有了，[Boosting Adobe Photoshop’s Performance with MSVC and SPGO](https://devblogs.microsoft.com/cppblog/boosting-adobe-photoshops-performance-with-msvc-and-spgo/).

* [how to be good at research](https://x.com/itsreallyvivek/status/2064686372737454155)，又 cue 到 hamming.
* 项目里有一些从视频提取信息的需求，同事用上了这个 [CVPR 2026 Oral VGGT Omega](https://github.com/facebookresearch/vggt-omega)，感觉真是不错的工作。
* 最近股市震荡好厉害，我不太适合在这个环境里赚钱，Dell 和 Apple 都震破我止损了，果断斩仓。

