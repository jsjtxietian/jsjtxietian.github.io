---
title: Curiosity Log 1
tags:
  - Curiosity
date: 2026-01-12
---

### 缘由

Hi 欢迎来到 Curiosity Log 第一期。这是一个记录我最近阅读与实践中遇到的有趣事物的双周报。

上周在看 [Joy & Curiosity #69](https://registerspill.thorstenball.com/p/joy-and-curiosity-69) 的时候，突然觉得，我每天读的这么多东西，除了让它们在 Obsidian 里吃灰（并且等着我慢慢整理成完美的主题文章以外），不如直接以类似 Joy & Curiosity 的形式定期发布出来。这既是我自己的思维记录，也是一种和朋友们分享我读到的有趣的东西的方式。直接引用 Joy & Curiosity 的 Slogan 就很合适：`Interesting & joyful things from the previous week`. 

如名字所示，本刊以好奇心为驱动，所以我感兴趣的不一定是读者感兴趣的。我会尽量带上我认为有趣的部分在哪儿。虽然很水的[c++中文周刊](https://www.zhihu.com/collection/740473368)已经全面AI化，但我觉得我还是喜欢自己手动整理，并非排斥AI，而是需要创造一些必要的阻碍让知识更加深化。这有点像 [link blog](https://simonwillison.net/2024/Dec/22/link-blog/) ，但会简单很多。

我感兴趣的领域：AI、性能优化、游戏开发、以及广义上的Liberal Art（文学、社会学、人类学等，甚至是投资）。我不会刻意给文章分类，但尽量有个逻辑在。另外评论内容可能显得很零散、没有章法，这一方面当然是为了降低我的启动耗能，另一方面 Curiosity Log 的目的也是固化一部分思维的火花，为了输出长文做准备。

单周更新可能太累了些，月度报告又太疏，双周更新的频率应该比较合适，能让我喘口气，也能让自己能经常花点时间坐下来思考自己的摄入。那么，请看第一期：



### 第一期

最近两周风平浪静，因为元旦调休上班上到有点累了，另外项目组也在赶版本，强度也不小（虽然我因为刚入职不久也不怎么需要加班）。最近自己的变化是，调整了阅读和 build 的顺序，把早上比较好的时间希望分给 build 多一些，晚上可以躺着阅读。

---

* 读完了《[情绪](https://book.douban.com/subject/30443490/)》，还是挺开眼界的。几个感想：1，根据书中所说，为了调节身体预算，大脑会基于过去的经验和当前的身体状态，计算下一刻最可能出现的感觉输入是什么并以此作为调节依据，我直接就想到了大模型也是**预测**下一个token，这种相似性还是挺有趣的；2，在用神经科学的理论破除理性 vs 情绪这种本质主义的 myth 之后，人类社会该就此作出如何的调整？作者在第11章谈了很多现有法律体系的问题，算是基于新的科学发现对 ought to be 的探讨吧；3，吃好、睡好、多读书还是蛮重要的；4，Gemini 当伴读是真的好，帮我检索、查证、补充背景。
* 最近脑子里一直回荡《伊利亚特》中的那个片段：”**正如树叶荣枯，人类的世代也如此，秋风将枯叶撇落一地，春天来到，林中又会滋发出许多新的绿叶，人类也是如此，一代出生一代凋谢**“，也不知道为啥会这样，也许这就是荷马的魅力，这个比喻确实堪称完美。

* 明显感觉 X 上很多牛逼程序员很多都转向拥抱 AI 了：DHH写了[Promoting AI agents](https://world.hey.com/dhh/promoting-ai-agents-3ee04945)，x64dbg的作者也[推崇](https://x.com/mrexodia/status/2010157660885176767)，还有人写了写 C 的[心得](https://x.com/DanielcHooper/status/2008661957252182494)，有人劝你 [Don't fall into the anti-AI hype](https://antirez.com/news/158)，还有很多不一一列举了，风向如此，只能顺风而为。

* 读到一篇讲 AI 时代个人治理的文章，[THE PERSONAL PANOPTICON](https://x.com/mollycantillon/status/2008918474006122936)，读了几句就大呼好福柯，我喜欢。文章里主要在谈**用 AI 完成对自己的全景“监视”与治理**，这当然是一个很好的话题，或者不如说，没人用福柯谈论现在才是比较奇怪的现象。但是作者举的例子并不能说服我：把账单丢给 AI 来让 AI 帮忙取消不应该存在的订阅，我读到这个满头冒问号，您是多忙/多有钱才根本不关心自己订阅了哪些月费服务啊。教父母用 CC 的那段确实不错，`For twenty years, software made them feel stupid. Now they tell it what to do`, AI 时代如何做软件设计也是很有趣的话题，考虑到 AI 似乎可以加强很多服务的 **accessibility**。

* 朋友发了这篇，[姚顺雨入职腾讯后首次公开露面](https://mp.weixin.qq.com/s/bkklBt6y41RiXr7El-vgYg?start=1574&end=1737)，里面谈到 to C 的话，**大部分人大部分时候其实不需要用到这么强的智能**，更多像是使用一个搜索引擎的加强版。我对此的感觉比较复杂，只能说我在手机上确实就是把 AI 当加强版搜索引擎用，希望各大公司之间的信息墙更少一些，在 PC 上则是希望模型越聪明越好，和我个人的使用习惯有关，手机上纯就是查点东西。

* Daniel Lemire关于 [old tech](https://x.com/lemire/status/2010300939970711918) 的一些评论，我还是挺认同的：`progress tends to look like onion layers: we add new technologies to our stack while keeping the existing ones`，MCP就是一种这样的技术。他之前也提过 [The long tail is longer than people imagine](https://x.com/lemire/status/1956104580690751832)，我想到了我本科还有个大型机专业呢。

* 他还有一篇谈 manager 可以在 AI 的帮助下重回编程的[讨论](https://x.com/lemire/status/2009532006565101619)：在 AI 的帮助下，manager 可以利用开会的空余时间去指挥 AI 有所产出，反正 AI 辅助的编程也是一种**异步的模式**，感觉还不错，之前我的关注点都在 AI 让我这种不会代码的人能写代码，其实对上层也许也会有影响。

* 简单扫了眼这个paper：[SuperCoder: Assembly Program Superoptimization with Large Language Models](https://arxiv.org/abs/2505.11480)，也许以后 C++ 有个 **-ollm** 模式，起一个最强的大模型来帮你优化生成代码，编译巨慢但是运行巨快。

* 读了一篇谈 [Observability](https://blog.sherwoodcallaway.com/observability-s-past-present-and-future/) 的文章，深有同感，我平时做性能其实一大部分时间都是在做可观测性，尤其是 AI 时代，可观测性更重要了。

* 花了点时间看了下吹哥最新的[访谈](https://www.youtube.com/watch?v=yNdRv5LFuQk&t=3749s)，发现个有趣的小细节：他们的地图编辑器里也有类似 **Spatial Documentation** 的 note，更详细的介绍在这里：[The Power of Spatial Documentation](https://rystorm.com/blog/the-power-of-spatial-documentation)

* 还是有大神在研究如何在shader里完成printf：[An Experimental Approach to printf in HLSL | Abolish \r\n](https://www.abolishcrlf.org//2025/12/31/Printf.html)，加油啊！

* Mike Turitzin 基于 **SDF** 做了个[游戏引擎](https://www.youtube.com/watch?v=il-TXbn5iMA)，也太强了，后面仔细研究下。不如直接劝退传统游戏引擎，拥抱 AI 吧：[2025年游戏技术最大变革：Neural Shader](https://zhuanlan.zhihu.com/p/1991557277451305725)，不管咋样，游戏引擎要有能力让我们开发者可以用上 GPU 里的那些 **Tensor Cores**，不然放着也是浪费啊。

* 前阵子工作太累了，就没搞啥，做了个 cc 的 skill 来帮我看 js 的火焰图，然后让 codex 帮我把 js 的火焰图直接融合到 native 的火焰图里去，还挺有用的，后面会单独写文章介绍这个。

* 借助 Gemini 花了两个小时做了之前一直想做的一个东西，把 [Graphics Programming Weekly Database](https://www.jendrikillner.com/article_database/) 里的数据都扒出来，加上向量检索的能力，可以在[这里](https://jsjtxietian.github.io/Graphics-Programming-Weekly-With-AI/)体验下，主要是验证了自己的idea，然后我觉得不如干脆数据都放在本地然后起个 cc 来帮我总结调研得好。

* 工作之余一直在思考如何做一个 AI native 的游戏引擎。游戏是做给人玩的，互动性很强，虽然是好事，但是现有的游戏引擎是给人设计的，AI 时代很难让 AI 可以去端到端完成任务，因为**很难去构造一个合适的 verification loop**（新鲜的例子见[这里](https://x.com/gdechichi/status/2010433509362680246)），我不觉得 MCP 等方案可以解决这个问题，毕竟游戏引擎算是游戏的操作系统，太过庞大了。也许这也是好事，我暂时很难被取代；同时也是坏事，我总有一种我在基于我强大的多模态能力给 AI 打工的感觉。那 AI 时代的游戏引擎长啥样就很值得思考了，或者说给 agent 设计的游戏引擎会是啥样呢。

  
