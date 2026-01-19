---
title: The many aspects of Malloc (施工中)
tags:
  - Cpp
  - Performance
date: 2024-07-29
---



### Modern Malloc

注重通用情况下的分配速度、多核性能，减少碎片。

Mimalloc 之前做过分享，可以看看：[分享：Mimalloc Paper | 谢天的博客 (jsjtxietian.github.io)](https://jsjtxietian.github.io/2023/02/22/Mimalloc/)



------



### Arena

https://www.youtube.com/watch?v=nZNd5FjSquk&t=2322s

#### Stack Allocator

先看基础的 stack allocator（或者叫 bump allocator），从最简单的概念上来说，这和函数分配局部变量时使用的 stack 内存的管理方式是一样的。“When an allocation occurs (a variable is declared on the stack), its lifetime is chosen by virtue of which scope it is placed within. This is unlike `malloc` and `free`, which offers per-individual-allocation lifetime control”[^4]。也就是说，被分配出来的内存的 lifetime 和该 scope 绑定了，一个非常简单的例子大概是这样：

```c
U8 *stack_memory = ...;
U64 stack_alloc_pos = ...;

// allocating 64 bytes on the stack:
void *ptr = stack_memory + stack_alloc_pos; // `ptr` points to 64 bytes
stack_alloc_pos += 64;

// popping 64 bytes from the stack:
stack_alloc_pos -= 64;

// sub lifetime
U64 restore_stack_alloc_pos = stack_alloc_pos;
{
  // in here, increment stack_alloc_pos as needed!
}
stack_alloc_pos = restore_stack_alloc_pos;
```

优点很明显，不用去烦每一次的分配和释放，同时拥有极快的分配和释放（batch deallocation）速度；另外由于 cache 的关系，性能也会变好。


#### Arena Allocator

当然实际的程序不可能只靠这样一个简单的 stack allocator 就能撑住。我们会在同一时间需要许多不同的、独立的 stack 来表示不同的 lifetime，由此就诞生了所谓的 arena allocator，其 API 大概长这样：

```C
// create or destroy a 'stack' - an "arena"
Arena *ArenaAlloc(void);
void ArenaRelease(Arena *arena);

// push some bytes onto the 'stack' - the way to allocate
void *ArenaPush(Arena *arena, U64 size);
void *ArenaPushZero(Arena *arena, U64 size);

// pop some bytes off the 'stack' - the way to free
void ArenaPop(Arena *arena, U64 size);

// get the # of bytes currently allocated.
U64 ArenaGetPos(Arena *arena);

// also some useful popping helpers:
void ArenaSetPosBack(Arena *arena, U64 pos);
void ArenaClear(Arena *arena);
```

整个 arena 的思路应该是建立在下列假设的基础上：在程序中，应该有许多的 allocation 是共享相同的 lifetime 的，因此可以从属于相同的 arena。一个很显然的问题是 arena allocator 具有极强的侵入性，API 可能如下所示：

```c
// the function is *asking the user* where to allocate
ComplexStructure *MakeComplexStructure(Arena *arena);
```

当然这也可以理解成是一种“依赖注入”，通过强制传入 arena 参数，caller 就决定了接下来的分配的内存的 lifetime（所谓的 grouping lifetimes together）。这种侵入性其实是一种表达，arena 其实代表了一种程序员选择的 lifetime 参数，这就和 Rust 那种需要静态确定 lifetime 的方法产生了区别。此时，Releasing memory is a per-lifetime concern, not a per-allocation concern，(99% of code can now allocate & forget, by picking an arena—a named "null garbage collector")[^13]。

现代的内存分配器提供的 malloc 接口毕竟没有这样的信息，它们只能假设分配时间邻近、大小相似的内存块也更容易被同时使用，因此会将其尽量放置靠近一些；arena 则直接利用程序员传递的信息来将相同 lifetime 的内存以 bump 的形式分配，从性能角度来说也会更好，因为相同 lifetime 的内存大概率也会被使用。

Casy 在 Handmade hero 中曾经表达过的程序员的 mental development[^8]，第 n 层是所谓的 individual element thinking，主要是“RAII，thousands or millions of new/delete or malloc/free，ownership is a constant concern / mental overhead”；第 n+1 层则是 grouped element thinking，包括“large collections created/destroyed at the same time，very very few new/delete or malloc/free，heavy use of scratch space，hashes and reuse，ownership is obvious and trivial in 99% of cases”。这也许和 Casey 主要是做游戏有关，确实在游戏中，如果出现了一个 object，那未来可能就会有很多个。我倒是觉得对正确的问题使用正确的工具，RAII 也可以和 arena 结合起来用，arena 改改也可以传给 C++ pmr 的那些容器。

#### Extension

当然在实践中，arena allocator 本身的机制肯定是不够撑起多变的需求的。比如在游戏中，如果我分配了 1000 个 entity，需要释放中间的某一个该怎么办。就这个问题而言，解决方案可以是在 arena 里再加一个 freelist 的机制，在释放时候也将其加入 freelist，分配时优先从 freelist 分配，从而解决这个 memory reuse 的问题。更进一步说，可以用 arena 当成一个基础组件来构建成更“高级”的一些分配器。

不仅仅可以按照 lifetime 来分，也可以利用 arena 来表达数据的冷热程度，来完成数据的冷热分离。另外也可以利用 thread local 的空间来做每个 thread 自己的 arena，这样可以减少同步开销。Diagnostics, logging, visualization for all allocations can be implemented in a single, simple layer—easily controlled by you (Allocations are already bucketed to a unique ID - the arena pointer itself) [^13]

也需要注意 Arena alising 问题，两个 arena 可能实际是同一个。除了使用多个 Arena 以外，可以考虑`memory poisoning`，查问题方便很多。

```C
void *FunctionA(Arena *arena)
{
  ArenaTemp scratch = GetScratch();
  void *result = PushArrayZero(arena, U8, 1024);
  // fill result...
  ReleaseScratch(scratch);
  return result;
}

void FunctionB(void)
{
  ArenaTemp scratch = GetScratch();
  void *result = FunctionA(scratch.arena);
  // use result
  ReleaseScratch(scratch);
}
```

另一个问题是 arena 的扩容问题，解决方案也可以有很多，比如可以把 arena 用链表链起来。也可以直接使用一个很优雅的 virtual memory trick——用类似`VirtualAlloc`的接口 reserve 一块巨大的地址空间，然后按需 commit page。

#### Generational Arena

Generational Arena 在游戏中的使用场景比较典型。而且除了内存分配以外，资源管理也有类似的概念，比如[^3]提到了 HypeHype 用的 Generational Pool：在概念上可以理解为该 Pool 由两个相同长度的数组组成，第一个用来存储数据；第二个则对应到第一个数据的对应 slot 的 generation 信息，也就是第一个数组中对应的 slot 被重用了多少次。因此在某个 slot 的数据被 free 时，只需要将对应的 generation counter +1 即可。

Generational Pool 的 handle 本身其实就是一个 32bit 的值，前 16bit 用来索引数据数组，后 16bit 表达 generation 信息（数据多的话 handle 也可以是 64bit）。Pool 本身会有一个 getter 的 API，传入 handle 后会进行检查，如果 generation 值一致则返回实际的数据，不然返回 null，就像是 weak ref 一样。

另外，Rust 做游戏似乎尤其需要这个 [LogLog Games](https://loglog.games/blog/leaving-rust-gamedev/#ecs-solves-the-wrong-kind-problem)



Arena allocator 有许多实现可以参考，纯粹的 C 实现例如[^5][^12]，dynamic array[^9]、hashmap[^10]这种数据结构也有对应的文章可以参考。RAD Debugger 就是基于 arena 构建起来的[^6]，protobuf 也在特定场景推荐使用 arena[^7]。



------



### Huge Page 

使用 Hugepage 可以减少 TLB miss，因此可以提升性能。使用大页的难点在于，如果释放了一个块非 hugepage align 的内存，内核就需要把剩下的内存区域用小页表示，于是就失去了使用大页的好处；如果不释放，则会多占内存（fragmentation 问题）。C++ 中一个物体一经分配就不能移动，因此为了减少碎片，必须在分配内存的时候就聪明些。

《**Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator**》[^1] 提出了一个非常有趣的 claim：“It is worth slowing down the allocator, if doing so lets it make better decisions” ，最后他们设计了如标题所说的一个 hugepage aware 的分配器，尽量把内存分配到快满的大页上。最后在性能收益方面也满足他们的 claim：“Gains were not driven by reduction in the cost of malloc. Gains came from **accelerating user code**.”

《**Learning-based Memory Allocation for C++ Server Workloads**》[^2]利用机器学习来根据 calling context 来预测需要分配的内存块的 lifetime，来将具有相似的 lifetime 的内存放到相同的 Hugepage 里（这里就和 arena 有点像，不过 arena 是程序员手动指定的，这边是靠机器学习来猜），可以尽量减少 fragmentation 的发生。机器学习的开销则可以通过 cache 等机制来平摊。





### Closing Thoughts

也许其实不分配内存是最好的，每个分配至少占用 32byte（分配本身[^11] + 指针的 8byte），<=64byte 就没必要分配了。





欢迎提 issue 交流：[Issues · jsjtxietian/jsjtxietian.github.io](https://github.com/jsjtxietian/jsjtxietian.github.io/issues)




[^1]: [Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator ](https://www.usenix.org/conference/osdi21/presentation/hunter)
[^2]: [Learning-based Memory Allocation for C++ Server Workloads](https://dl.acm.org/doi/10.1145/3373376.3378525)

[^3]:[AaltonenHypeHypeAdvances2023.pdf (realtimerendering.com)](https://advances.realtimerendering.com/s2023/AaltonenHypeHypeAdvances2023.pdf)  第 15 页

[^4]: [Untangling Lifetimes: The Arena Allocator - by Ryan Fleury (rfleury.com)](https://www.rfleury.com/p/untangling-lifetimes-the-arena-allocator)
[^5]:[arena/arena.h at master · tsoding/arena (github.com)](https://github.com/tsoding/arena/blob/master/arena.h)
[^6]: [raddebugger/src/base/base_arena.h at master · EpicGamesExt/raddebugger (github.com)](https://github.com/EpicGamesExt/raddebugger/blob/master/src/base/base_arena.h)
[^7]: [C++ Arena Allocation Guide | Protocol Buffers Documentation (protobuf.dev)](https://protobuf.dev/reference/cpp/arenas/)
[^8]: [Handmade Hero Day 626 - Cleaning Up Traversables (youtube.com)](https://www.youtube.com/watch?v=f4ioc8-lDc0&t=6821s)
[^9]: [A simple, arena-backed, generic dynamic array for C (nullprogram.com)](https://nullprogram.com/blog/2023/10/05/)
[^10]: [An easy-to-implement, arena-friendly hash map (nullprogram.com)](https://nullprogram.com/blog/2023/09/30/)
[^11]:[How much memory does a call to ‘malloc’ allocate? – Daniel Lemire's blog](https://lemire.me/blog/2024/06/27/how-much-memory-does-a-call-to-malloc-allocates/)s
[^12]:[bitwise/ion/common.c at master · pervognsen/bitwise (github.com)](https://github.com/pervognsen/bitwise/blob/master/ion/common.c#L172-L209)
[^13]:[Enter The Arena: Simplifying Memory Management (2023)](https://www.youtube.com/watch?v=TZ5a3gCCZYo)
