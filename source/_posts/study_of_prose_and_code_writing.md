---
title: 我的左右脑，代码和写作
tags:
  - Vibe
date: 2025-09-28
---

这两天偶然看到这篇paper，还挺有意思 [Neurological Divide: An fMRI Study of Prose and Code Writing](https://dijkstra.eecs.umich.edu/fmri/icse20-data/icse2020-fmri-preprint.pdf)，利用功能性磁共振成像 (fMRI) 技术对写代码和散文写作过程进行了对比研究，并发现这两者在大脑神经活动上存在显著差异，我直接quote这篇paper：

> While prose writing entails significant left hemisphere activity associated with language, code writing involves more activations of the right hemisphere, including regions associated with attention control, working memory, planning and spatial cognition.

看图更直观：

![image-20250928123732836](../Assets/study_of_prose_and_code_writing/image-20250928123732836.png)

三个主要结论分别是：

* 代码写作和散文写作在大脑神经活动上存在着显著且广泛的差异：大脑并不将这两者视为相似的任务。
* 在较低层次上（例如，生成一个单词或一个代码元素），写代码需要大脑中与精细的自上而下的控制、规划和分类相关的区域进行更显著的活动。尽管表面上相似，但与散文相比，代码似乎是一种在类别上完全不同的视觉刺激。
* 高层次的长篇代码编写与散文写作有着显著的不同，散文写作涉及传统上与语言相关的左脑区域，而我们发现了一种明显的半脑侧化区别：与散文写作相比，代码写作并不会显著调用这些区域，反而是激活了与注意力、记忆、规划和空间能力相关的右脑区域。

有趣的是超过1/3的参与者在事后调查中报告说，他们认为代码写作和散文写作有相似之处 ，但fMRI的客观测量结果狠狠打脸。

简单读完之后我的感受是，啊我的脑子，我想多了解你，毕竟了解更多自己的脑子总是挺好的。鉴于我整个白天都在写代码了，所以为了我脑子的全面发展，我要多写作一些其他方面的文章，比如现在在干的这件事！

> Update:
>
> 又读到一篇文章，[Relating Natural Language Aptitude to Individual Differences in Learning Programming Languages](https://www.nature.com/articles/s41598-020-60661-8)，实验表明，自然语言能力 (Language Aptitude) 是预测编程学习成果（如学习速度和准确性）的强有力指标，会和上面那篇paper结论稍微有些冲突，说明学习编程、阅读代码和编写代码可能是利用了不同大脑认知资源的独立活动。

简单引申一下，这里很明显的一个后续方向是，AI时代的程序员会如何，我想有了Copliot帮助下的程序员在写代码的时候估计激活区域是会有些区别的，vibe有vibe的模式嘛。

想起之前确实读到过一篇有一点点相关的，[Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task](https://arxiv.org/abs/2506.08872)。如果说上一篇paper研究的是大脑在自力更生时是如何高效运作的，这一篇就是研究了当这种认知被外包给AI时会发生什么。实验将被试分成三组，根据相同的题目撰写论文，但每个小组的写作辅助工具不同，LLM组可以使用ChatGPT，搜索组可以使用搜索引擎，纯脑力组不使用任何工具，使用脑电图评估论文写作过程中的认知负荷。发现与完全依靠自己或使用搜索引擎的学生相比，使用LLM的学生的大脑网络连接性最弱，认知参与度最低，同时LLM组对自己所写论文的“所有权感”最低。所以说尽管LLM提供了极大的便利，它其实是有潜在的认知成本的，我可不希望有这种长期依赖AI会产生的“认知债务” ，因为凡是债务总有要还的那天。

当然我没有批判LLM这一系列工具的意思，工具毕竟看怎么使用。而且每当有方便的新工具出来总会被批判一番的，比如当年的谷歌[Is Google Making Us Stupid](https://www.theatlantic.com/magazine/archive/2008/07/is-google-making-us-stupid/306868/)。我只是好奇从整体而言，使用或者甚至是滥用它会怎么影响我，至少我目前有个有趣的观察是，AI让我变得更没有耐心了——vibe coding有“毒”，尤其是我当给它一个我认为很简单能做好的task，它却一直失败的时候，我会很暴躁，虽然自己也知道这种情绪完全没有意义就是了。

之前看到有老师在朋友圈发了相关的讨论，AI对人的comprehension、reasoning、agency的影响，“比方说，人自以为对创作成果的完全自主，却不知已被AI价值潜移默化影响；人自以为对AI建议的有效筛选，却不知当欺骗性AI提供“合理解释”时，就会落入盲目相信的陷阱”。所以我决定后面有空用AI帮我deep research一下这一方面，利用AI研究AI对人认知方面的的影响，写一篇更详细的文章吧。

我自认为还是一个比较注重保护自己脑子的人（虽然经常晚睡，但是在改了，同时讨厌绝大多数意义上的信息推送），不管如何我总希望我的脑子被狠狠锻炼的，所以还是多写作，多写不同的东西，多创造新的东西！
