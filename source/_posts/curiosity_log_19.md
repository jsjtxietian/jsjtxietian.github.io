---
title: Curiosity Log 19 - Jev time
tags:
  - Curiosity
date: 2026-09-24
---

假期快乐朋友们。

最近发掘出了用 Astra 来写软著的玩法，这种其实没啥人看但又需要页数的东西用 AI 写是真的方便。Astra 会自己翻代码整理功能、自己截图并写说明、自己对着 word 格式写好文案，太舒服了，我基本就是对着最终成果稍微指点了一下某些格式错误，其他的一字没改，太爽了。虽然感觉 Astra 偶尔也降智，会被气死。这种体验太不好了，本来 sol 用得好好的，慢慢降智到不能用了，然后 Astra 出来惊为天人，但是又体验慢慢下滑，唉，过山车啊，我要训练自己不对 AI 生气。

另外也在昨天洗澡的时候突然领悟了一点真正的 AI Native 时代的应用开发，似乎确实就是应该让 AI 去 on the fly 生成想要的界面，我作为开发者其实提供的是数据底层这种基础设施，有点像是 Cursor Canvas 或者 Artifacts 那种感觉。然后慢慢沉淀出来好用的界面，我再去把它固化。拿剧本编辑器说，我当然可以做出那种固定的筛选界面，去展示出比如某个人在某个任务里所有的对话等等，但似乎有数据的话，也可以直接让 AI 生成这样的界面，比如直接生成 html，这个就可以更进一步解锁一些玩法，比如接入 AI 建模、AI 生图等等，给 AI 准确的数据 & 一个沙盒，让 AI 发挥它的能动性和创造力。

读完了《阿莱夫》，开始读《看不见的城市》，写了一篇小文 [看不见的城市与看得见的 AI 绘画](https://jsjtxietian.space/2026/09/23/ai_image/)。游戏的话，开了个坑《神界原罪 增强版》，然后玩了家庭库里的《余烬守卫》，确实是非常有创意的游戏，推荐。上周和芥子聊天也有结果了，暂时没有缘分，下次吧。

---

* 又是热闹的两周，[Grok 4.7](https://x.ai/news/grok-4-7)， [MiMo v2.6 Flash/Pro](https://mimo.xiaomi.com/mimo-v2-6) ，[Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)，[GPT-6 Sol and GPT-6 Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/)，还没用上 Opus 5.5（已经在 push 合作方尽快上线了），`Opus 5.5 communicates more naturally, addressing some of the most common feedback we heard on Opus 5.`

* 这两周的明星当然是 Jev 了，[Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)，确实是非常有趣的东西：`Think of Jev as a frontier-intelligence function call: unstructured state in, typed probabilistic decisions out.` 看到很多玩法：[Jev picking the next command from shell history](https://x.com/thorstenball/status/2100858434904109099)， [uses Jev to predict the line you next most likely want to jump to](https://x.com/thorstenball/status/2101215311953313815)，[2048 · Simple Jev](https://simple-jev.featherless.ai/cool-demo/2048/)，[jevchat: Turns Jev into a chatbot](https://github.com/kyle-pena-nlp/jevchat/). 太火了，Jina 也来学一下 [Structured Decisions](https://jina.ai/api-dashboard/structured-decisions-test/).
* 作者整理的文档 [thoughts on a typesafe coding agent](https://docs.google.com/document/d/1G61uUB0FifUnmmrPzFQojZ3KpczYKmXGpgEXDJ2l_Zg/edit?tab=t.0)，我最感兴趣的是这个 `“Meta-attention”: Smart context / relevance / filtering. The idea that context is static can be entirely removed`，如果 jev 可以帮忙来按需组装 context，想象空间还是挺大的，联系到这篇 [重新发明打孔纸带](https://psiace.me/zh/posts/reinvent-the-punch-tape/) ，以及 [这里](https://www.youtube.com/watch?v=g8BuAtM3fp4&t=1s) 提到的突破注意力瓶颈的办法。

* [Laya — 33ms Multilingual System 1 Decision Engine with Calibrated Probabilities](https://laya.convaiinnovations.com/): `TypeSafe AI... proposed the exact same non-autoregressive decision concept as if it was a brand-new scientific breakthrough.` 唉，时也命也，`It took a year of research, from our March 2025 arXiv paper to today, but the core realization remains: not every AI problem requires an autoregressive chatbot.`

* [Measurements for understanding the pace of AI development inside frontier labs](https://www.anthropic.com/institute/measuring-pace-of-ai-development): `Claude “leads” 26% of Anthropic’s AI R&D work.The share of work at or above “AI collaborates” is above 90%.`  还有这个 `With many agents working together, we have found it important to give agents an individual identity`, raft 无敌了。

* 说到 RSI，这篇也提到了，[Noam Brown – Agent swarms, alignment, & recursive self-improvement](https://www.dwarkesh.com/p/noam-brown)，这个 insight 不错：`One really interesting thing is that if you have a person and you want two copies of them, you can’t just clone the person. But with AIs, it’s actually really easy to just say, “Okay, just fork yourself,” and then have both copies work on this thing and then merge back together.` 以及这个，[Why I still haven’t bought into true RSI](https://www.interconnects.ai/p/where-i-stand-on-rsi).

* [What I believe about the future of software development](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/)，有一些有趣的想法，比如 `It’s questionable whether cheaper models will be used.` 比如 `Code review will die. I mean: it’s already dead. But in the future, humans won’t find a bug or an issue with the code produced by a model, at least not in a reasonable time.` Marc Brooker 也发表了关于 Code review 的 [看法](https://x.com/marcjbrooker/status/2101005954708021604)，`Short-term, many teams do it for good reasons...What does the future look like? Review tools, powered by LLMaaJ-style techniques, static analysis, and automated reasoning methods. Principled approaches to testing and validation (PBT, DST, model-guided fuzzing, etc). Correct-by-construction techniques.`
* 接着上一篇，还有一个 `Models will become so fast that UI will be generated on the fly. A lot of UI exists because software can’t understand what you want. Menus, settings screens, dashboards, filters: much of it is a human-accessible API to a dumb machine. Smart machines need much less UI.` 这里就是一个 demo：[Operating System powered by Qwen 3.8 27B at 1950 tokens/sec](https://x.com/analogalok/status/2099130228866228368)，界面都是你双击 icon 之后直接让 ai 生成的，很有趣的概念，`at 2,000 tokens/second, software is just an on demand hallucination that runs instantly. the model weights ARE the operating system runtime.`

* [Learning to Solve Hard Problems in RL for LLMs by Never Giving Up](https://arxiv.org/abs/2609.13443): `We demonstrate that training LLMs with RL does not improve performance equally across a dataset. RL shows large improvements on easy problems that an LLM is already good at solving, but small improvements on hard problems.`
* 说到 RL，小米似乎在直播他们的 RL 训练，[mimo-v2.6 RL](https://mimo.xiaomi.com/rl/#overview).
* [LightMem-Ego: Your AI Memory for Everyday Life](https://arxiv.org/abs/2607.11487)，这个还挺有意思的。
* [Introducing Strands harness: frontier performance with 28% lower token cost](https://strandsagents.com/blog/introducing-strands-harness/): `Deepseek Harness proved to be the most token-efficient overall, however, it typically reported the lowest accuracy scores.` 笑了，加油啊！
* Daniel Lemire 的 [A summer of AI optimization](https://x.com/lemire/status/2102369812806504705): `The techniques used are all well-known. So why all these optimizations all of a sudden? Simply put, in my view, because it got cheap to try new ideas.` 还有结尾的，`There is a lot of talk about the risks of AI in software...when we see the downsides, we tend to ignore the benefits... In this instance, the benefits are concrete. Millions of people run these libraries, and this summer, they got faster.` 写得多好啊。
* Jeff Dean 的新分享，[2026 Frontier & Pioneer Symposium](https://www.youtube.com/watch?v=0kC3xOZChdA&t=266s)，可以看看。
* 来学点做海报的提示词，[AI-generated posters don’t have to be horrible](https://john.hartnup.uk/2026/06/07/ai-event-posters.html).
* 小扎的 profile: [Mark Zuckerberg - Colossus](https://colossus.com/article/mark-zuckerberg-profile/), 最近 Muse 刚登顶 App Store，可惜我下下来用不了。

* mold 的 rust port 好快，[mold 🦠: A Modern Linker in Rust 🦀](https://github.com/rui314/mold)
* 才知道 Cloudflare 有这个 [Cloudflare Quick Tunnels](https://try.cloudflare.com/): `One command creates a public, encrypted URL for anything running on your machine. No account, DNS records, or open ports.`

* [Supporting Thousands of Simulated NPCs in Kingdom Come Deliverance 2](https://www.youtube.com/watch?v=yMlTT-yqdmc)，很多不错的优化思路。

