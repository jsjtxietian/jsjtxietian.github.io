---
title: Curiosity Log 5
tags:
  - Curiosity
date: 2026-03-07
---


这两周还挺开心/躺平，每天下班除了买菜备菜，就是读《追忆似水年华》+ 玩孤山独影。我还是挺接受普鲁斯特的叙事和文风的，节奏不错。目前第一本读完一半，读完就准备去读读《普鲁斯特的空间》，其实之前坐飞机的时候读了点《从荷马到古希腊抒情诗》还没读完。

孤山独影在写文章之前刚打完（或者说弃坑），嘛，在雪山最顶上水不够了，又懒得回档打，就这样吧，我确实也不是那种追求完美通关的人，vibe 到了就好。

好友 tracy 写的好文：[科普征文 | 光之信使：黑洞照片背后的科学与技术](https://mp.weixin.qq.com/s/Tkb0JdC-ZMa4HIM8uiGYEA)，思考了下 LLM 时代，科普文章的价值是不是有所转移，大概是吧。在知识的整合与参考方面，AI 的效率和广度远超人类，优秀的科普文章应该填补的是“我不知道我不知道”的盲区，激发好奇，起一个“议程设置”的作用，也许如此。

另外就是，对于人文社科类的书而言，彻底放弃原来那套做笔记/摘抄的方法了。有了 NotebookLM 之后，也与时俱进一下，不再大部分时间花在记录原文上，而只记录大概的结构、有趣的细节以及一些元分析等内容。然后手机上可以下个 App 没事和 AI 聊聊这些，不断地去 Recall. 

---

* [What Claude Code Actually Chooses](https://amplifying.ai/research/claude-code-picks/report) 这还挺有意思的，当你让 Claude 选择它要使用的工具/技术栈的时候，Claude 会怎么选。不出意外地，`Claude Code frequently builds custom solutions rather than recommending third-party tools.` 另外就是 AI 确实有自己偏好的技术栈，合理，而且不同的模型偏好差别也不大，有趣。列下模型喜欢的：Vercel, PostgreSQL, Stripe, Tailwind CSS, shadcn/ui, pnpm, GitHub Actions, Sentry, Resend, Zustand, plus stack-specific picks like Drizzle (JS) or SQLModel (Python) for ORMs, NextAuth.js (Next.js) for auth, and Vitest (JS) or pytest (Python) for testing.
* 说到 tool 还有这篇也不错，how do you design the tools of your agent?  [Lessons from Building Claude Code: Seeing like an Agent](https://x.com/trq212/status/2027463795355095314). 另外 GPT 5.4 也有 tool search 了。

* 每周都有新的用 AI 重写了 xxx 的故事：[How we rebuilt Next.js with AI in one week](https://blog.cloudflare.com/vinext/)，或者这篇 [Ladybird adopts Rust, with help from AI](https://ladybird.org/posts/adopting-rust/)，或者 AI 又解决了某个很难的问题，比如限定时间内纯 C 手写 gpt2 推理引擎：[GPT-5.4 code-golfs GPT-2](https://x.com/hansonwng/status/2030000810894184808)；连 Knuth 也用上了 [claude-cycles.dvi](https://cs.stanford.edu/~knuth/papers/claude-cycles.pdf)，更别提 [Sebastian Aaltonen](https://x.com/SebAaltonen/status/2027847942527127556) 了，时代的风确实变了。
* AI 帮找安全漏洞，[Partnering with Mozilla to improve Firefox’s security](https://www.anthropic.com/news/mozilla-firefox-security)，这个观察很有趣，`Claude is much better at finding these bugs than it is at exploiting them.` 
* AI 时代的 Engineering Culture —— [Building An Elite AI Engineering Culture In 2026](https://www.cjroth.com/blog/2026-02-18-building-an-elite-engineering-culture), AI 时代的面试—— [How We Hire Engineers When AI Writes Our Code](https://www.tolans.com/relay/how-we-hire-engineers-when-ai-writes-our-code).
* 提升 Agent 某些方面的表现，如 [Agentic Code Reasoning](https://arxiv.org/abs/2603.01896)；每周也都有对这些工具的[思考](https://www.jmduke.com/posts/five-observations-ai-tools.html): `it seems like the logical endpoint is infinite and perfectly abstracted sandboxes with previewing, isolation, and very tight feedback loops.` 包括这篇 [Agent Harness is the Real Product ](https://x.com/Hxlfed14/status/2028116431876116660)，ref 还挺全的。也有对工具的“逆向”，[Investigating how Codex context compaction works](https://x.com/Kangwook_Lee/status/2028955292025962534)
* 每周也都会看到一些推理加速的文章，[FlashAttention4 的 paper](https://x.com/nrehiew_/status/2029591405954531629)；[Prefill 太慢？我们快了 3 倍还提升了推理质量](https://zhuanlan.zhihu.com/p/2010425058682770994)，总感觉和 [llama.vim : plugin for Neovim](https://github.com/ggml-org/llama.cpp/pull/9787) 里提的有点像，利用 RoPE 的加性原理进行旋转/偏移。
* 每周也都有一些反思 AI 编程的帖子，[747s and Coding Agents](https://carlkolon.com/2026/02/27/engineering-747-coding-agents/)，讨论认知债务的：[How Generative and Agentic AI Shift Concern from Technical Debt to Cognitive Debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/)，[Nobody knows how the whole system works](https://surfingcomplexity.blog/2026/02/08/nobody-knows-how-the-whole-system-works/)，[When AI Writes the World's Software, Who Verifies It?](https://leodemoura.github.io/blog/2026/02/28/when-ai-writes-the-worlds-software.html)
* 也都有关于 long-running agents 的[讨论](https://x.com/karpathy/status/2029696850366971921)，online finetuning 还是 memory based techniques，说到 Memory，看到这个项目有趣 [memUBot](https://github.com/NevaMind-AI/memUBot)，说到 finetune，[Unsloth AI](https://x.com/UnslothAI/status/2028845314506150079)做了 Qwen3.5 的，小模型还是有用的，比如 [OCR](https://x.com/stevibe/status/2029126123465130326)，比如 [PhoneDriver: Android Phone Control With Qwen3-VL](https://github.com/OminousIndustries/PhoneDriver)。当然最近吃千问的瓜也不错。
* 神奇的 paper，[Real Money, Fake Models: Deceptive Model Claims in Shadow APIs](https://arxiv.org/html/2603.01919v1)，讨论不靠谱的第三方 api 如何影响了科研。

* [Logan Kilpatrick](https://x.com/OfficialLoganK/status/2026510487022625040)：我们需要更多的算力，The compute bottleneck is massively under appreciated.  I would guess the gap between supply and demand is growing single digit % every day. 联系到这个 [Inside the Trillion-Dollar AI Buildout](https://www.youtube.com/watch?v=kAIVualeQjM)，但半导体股价最近跌跌跌。
* [借助语义抽象层和 Agent 编排器在 UE 工程中实现工程生产可用的 Vibe Engineering](https://zhuanlan.zhihu.com/p/2012213279079019611)，MCP 确实不行，这种思路也许可行。
* [RenderDocMCP](https://github.com/halby24/RenderDocMCP)，马上用上，另外也许可以直接把 renderdoc 接进游戏里算了，那个 app 总被系统杀。
* 好不容易读一篇 old fashion 的技术文章，[C++ Performance Improvements in MSVC Build Tools v14.51](https://devblogs.microsoft.com/cppblog/c-performance-improvements-in-msvc-build-tools-v14-51/#new-ssa-loop-optimizer)
* 这个工具不错，[ClipPing: Displays a visual notification in the active window when the clipboard is updated](https://github.com/kevingosse/ClipPing)，我一直觉得是 Win 系统的 bug
* [统计学里有哪些振聋发聩颠覆三观的证明和定理](https://www.zhihu.com/question/37896333/answer/1991160339182683668)，虽然是 AI，但说的几个都不错，另外也一直想读下《概率论沉思录》。
* 我也是用上 Windows Codex App 了，体验目前还不错，别人问 Codex 是不是 100% AI 写的，回：[Not yet, and that’s why it works extremely well](https://x.com/thsottiaux/status/2030141318782144546).
* 上次的 MinerU 魔改失败了，还是模型原因，[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR/blob/main/readme/README_cn.md) 的排版也不行，不过我后面发现其实我直接读英文更快，也只是玩玩能不呢识别繁体 + 正确排版。
* 总体来说能给新 Insights 的文章确实少了，唉，主要最近在休息模式没啥 Build 的兴致，也是工作变忙所致。