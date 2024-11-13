---
title: Benchmarking（施工中）
tags:
  - Performance
date: 2024-03-08
---



## Benchmarking is hard



## **用运行时间的最小值来对比**

- [Are your memory-bound benchmarking timings normally distributed? – Daniel Lemire's blog](https://lemire.me/blog/2023/04/06/are-your-memory-bound-benchmarking-timings-normally-distributed/)
- [Microbenchmarking calls for idealized conditions – Daniel Lemire's blog](https://lemire.me/blog/2018/01/16/microbenchmarking-calls-for-idealized-conditions/)
- [The mean misleads: why the minimum is the true measure of a function’s run time | by David Gilbertson | May, 2023 | Better Programming](https://betterprogramming.pub/the-mean-misleads-why-the-minimum-is-the-true-measure-of-a-functions-run-time-47fa079075b0)
- Use “delta” measurement. The simple way to do this is if you test has a measurement loop and times the entire loop, run it for N iterations and 2N, and then use (run2 – run1)/N as the time. This cancels out all the fixed overhead, such as the clock/rdpmc call, the call to your benchmark method, any loop setup overhead. It doesn’t cancel out the actual loop overhead though (e.g., increment and end-of-loop check) – even though that’s often small or zero. If you want to do that you need actually two separate loops with different numbers of calls (or inlined copies) of the code under test and apply delta. It’s kind of risky to do that due to alignment effects so the loop approach is usually fine.  [Microbenchmarking calls for idealized conditions – Daniel Lemire's blog](https://lemire.me/blog/2018/01/16/microbenchmarking-calls-for-idealized-conditions/#comment-295373)

## 在代码优化中做准确的、上下文敏感的计时 ##

[GHScan/TechNotes: Scan's personal technical notes](https://github.com/GHScan/TechNotes)

**Producing Wrong Data Without Doing Anything Obviously Wrong**：measurement bias is significant and commonplace， and Measurement Bias is Unpredictable

* changing the UNIX environment size changes the location of the call stack which in turn affects the alignment of local variables in various hardware structures.
* depending on link order, O3 either gives a speedup over O2  or a slow down over O2；Link order affects the alignment of code, causing conflicts within various hardware buffers (e.g. caches) and hardware heuristics (e.g. branch prediction)

[Do not believe everything you read in the papers](https://timharris.uk/misc/2016-nicta.pdf)

[Peter Kraft on X: "Let's say you commit a change that makes an application 0.05% slower. No big deal, right? Well, at the scale of Meta, it is a big deal--a small slowdown for a large application can waste thousands of servers. It's such a big deal that Meta needs a way to catch these performance https://t.co/4DkfL4OgUu" / X](https://x.com/petereliaskraft/status/1855678353308823860)

benchmark的文章[Getting Accurate Results - Algorithmica](https://en.algorithmica.org/hpc/profiling/noise/)
