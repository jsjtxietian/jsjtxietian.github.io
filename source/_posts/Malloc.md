---
title: The many aspects of Malloc (施工中)
tags:
  - Cpp
  - Performance
date: 2024-07-29
---



### Modern Malloc

注重通用情况下的分配速度、多核性能，减少碎片。

Mimalloc之前做过分享，可以看看：[分享：Mimalloc Paper | 谢天的博客 (jsjtxietian.github.io)](https://jsjtxietian.github.io/2023/02/22/Mimalloc/)



### Arena

#### Stack Allocator

先看基础的stack allocator（或者叫bump allocator），从最简单的概念上来说，这和函数分配局部变量时使用的stack内存的管理方式是一样的。“When an allocation occurs (a variable is declared on the stack), its lifetime is chosen by virtue of which scope it is placed within. This is unlike `malloc` and `free`, which offers per-individual-allocation lifetime control”[^4]。也就是说，被分配出来的内存的lifetime和该scope绑定了，一个非常简单的例子大概是这样：

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

优点很明显，不用去烦每一次的分配和释放，同时拥有极快的分配和释放（batch deallocation）速度；另外由于cache的关系，性能也会变好。


#### Arena Allocator

当然实际的程序不可能只靠这样一个简单的stack allocator就能撑住。我们会在同一时间需要许多不同的、独立的stack来表示不同的lifetime，由此就诞生了所谓的arena allocator，其API大概长这样：

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

整个arena的思路应该是建立在下列假设的基础上：在程序中，应该有许多的allocation是共享相同的lifetime的，因此可以从属于相同的arena。一个很显然的问题是arena allocator具有极强的侵入性，API可能如下所示：

```c
// the function is *asking the user* where to allocate
ComplexStructure *MakeComplexStructure(Arena *arena);
```

当然这也可以理解成是一种“依赖注入”，通过强制传入arena参数，caller就决定了接下来的分配的内存的lifetime（所谓的 grouping lifetimes together）。这种侵入性其实是一种表达，arena其实代表了一种程序员选择的lifetime参数，这就和Rust那种需要静态确定lifetime的方法产生了区别。不仅仅可以按照lifetime来分，也可以利用arena来表达数据的冷热程度，来完成数据的冷热分离。另外也可以利用thread local的空间来做每个thread自己的arena，这样可以减少同步开销。

这让我想到了Casy在Handmade hero中曾经表达过的程序员的mental development[^8]，第n层是所谓的individual element thinking，主要是 “RAII，thousands or millions of new/delete or malloc/free，ownership is a constant concern / mental overhead”；第n+1层则是grouped element thinking，包括“large collections created/destroyed at the same time，very very few new/delete or malloc/free，heavy use of scratch space，hashes and reuse，ownership is obvious and trivial in 99% of cases”。这也许和Casey主要是做游戏有关，确实在游戏中，如果出现了一个object，那未来可能就会有很多个。我倒是觉得对正确的问题使用正确的工具，RAII也可以和arena结合起来用，arena改改也可以传给C++ pmr的那些容器。

当然在实践中，arena allocator本身的机制肯定是不够撑起多变的需求的。比如在游戏中，如果我分配了1000个entity，需要释放中间的某一个该怎么办。就这个问题而言，解决方案可以是在arena里再加一个freelist的机制，在释放时候也将其加入freelist，分配时优先从freelist分配，从而解决这个memory reuse的问题。更进一步说，可以用arena当成一个基础组件来构建成更“高级”的一些分配器。

另一个问题是arena的扩容问题，解决方案也可以有很多，比如可以把arena用链表链起来。也可以直接使用一个很优雅的virtual memory trick——用类似`VirtualAlloc`的接口reserve一块巨大的地址空间，然后按需commit page。

Arena allocator有许多实现可以参考，纯粹的C实现例如[^5][^12]，dynamic array[^9]、hashmap[^10]这种数据结构也有对应的文章可以参考。RAD Debugger就是基于arena构建起来的[^6]，protobuf也在特定场景推荐使用arena[^7]。



#### Generational Arena

Generational Arena在游戏中的使用场景比较典型。而且除了内存分配以外，资源管理也有类似的概念，比如[^3]提到了HypeHype用的Generational Pool：在概念上可以理解为该Pool由两个相同长度的数组组成，第一个用来存储数据；第二个则对应到第一个数据的对应slot的generation信息，也就是第一个数组中对应的slot被重用了多少次。因此在某个slot的数据被free时，只需要将对应的generation counter +1即可。

Generational Pool的handle本身其实就是一个32bit的值，前16bit用来索引数据数组，后16bit表达generation信息（数据多的话handle也可以是64bit）。Pool本身会有一个getter的API，传入handle后会进行检查，如果generation值一致则返回实际的数据，不然返回null，就像是weak ref一样。

另外，Rust做游戏似乎尤其需要这个 [LogLog Games](https://loglog.games/blog/leaving-rust-gamedev/#ecs-solves-the-wrong-kind-problem)



### Huge Page 

使用Hugepage可以减少TLB miss，因此可以提升性能。使用大页的难点在于，如果释放了一个块非hugepage align的内存，内核就需要把剩下的内存区域用小页表示，于是就失去了使用大页的好处；如果不释放，则会多占内存（fragmentation问题）。C++中一个物体一经分配就不能移动，因此为了减少碎片，必须在分配内存的时候就聪明些。

《**Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator**》[^1] 提出了一个非常有趣的claim：“It is worth slowing down the allocator, if doing so lets it make better decisions” ，最后他们设计了如标题所说的一个hugepage aware的分配器，尽量把内存分配到快满的大页上。最后在性能收益方面也满足他们的claim：“Gains were not driven by reduction in the cost of malloc. Gains came from **accelerating user code**.”

《**Learning-based Memory Allocation for C++ Server Workloads**》[^2]利用机器学习来根据calling context来预测需要分配的内存块的lifetime，来将具有相似的lifetime的内存放到相同的Hugepage里（这里就和arena有点像，不过arena是程序员手动指定的，这边是靠机器学习来猜），可以尽量减少fragmentation的发生。机器学习的开销则可以通过cache等机制来平摊。





### Closing Thoughts

也许其实不分配内存是最好的，每个分配至少占用32byte（分配本身[^11] + 指针的8byte），<=64byte就没必要分配了。

有GC真好。

欢迎提issue交流：[Issues · jsjtxietian/jsjtxietian.github.io](https://github.com/jsjtxietian/jsjtxietian.github.io/issues)






[^1]: [Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator ](https://www.usenix.org/conference/osdi21/presentation/hunter)
[^2]: [Learning-based Memory Allocation for C++ Server Workloads](https://dl.acm.org/doi/10.1145/3373376.3378525)

[^3]:[AaltonenHypeHypeAdvances2023.pdf (realtimerendering.com)](https://advances.realtimerendering.com/s2023/AaltonenHypeHypeAdvances2023.pdf)  第15页

[^4]: [Untangling Lifetimes: The Arena Allocator - by Ryan Fleury (rfleury.com)](https://www.rfleury.com/p/untangling-lifetimes-the-arena-allocator)
[^5]:[arena/arena.h at master · tsoding/arena (github.com)](https://github.com/tsoding/arena/blob/master/arena.h)
[^6]: [raddebugger/src/base/base_arena.h at master · EpicGamesExt/raddebugger (github.com)](https://github.com/EpicGamesExt/raddebugger/blob/master/src/base/base_arena.h)
[^7]: [C++ Arena Allocation Guide | Protocol Buffers Documentation (protobuf.dev)](https://protobuf.dev/reference/cpp/arenas/)
[^8]: [Handmade Hero Day 626 - Cleaning Up Traversables (youtube.com)](https://www.youtube.com/watch?v=f4ioc8-lDc0&t=6821s)
[^9]: [A simple, arena-backed, generic dynamic array for C (nullprogram.com)](https://nullprogram.com/blog/2023/10/05/)
[^10]: [An easy-to-implement, arena-friendly hash map (nullprogram.com)](https://nullprogram.com/blog/2023/09/30/)
[^11]:[How much memory does a call to ‘malloc’ allocate? – Daniel Lemire's blog](https://lemire.me/blog/2024/06/27/how-much-memory-does-a-call-to-malloc-allocates/)s
[^12]:[bitwise/ion/common.c at master · pervognsen/bitwise (github.com)](https://github.com/pervognsen/bitwise/blob/master/ion/common.c#L172-L209)
