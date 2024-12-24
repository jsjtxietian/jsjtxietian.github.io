---
title: Float（施工中）
tags:
  - GameDev
date: 2023-06-07
---


关于浮点数的一些记录。



## 浮点数表示

[Single-precision floating-point format](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) The bits are laid out as follows:

![img](./../Assets/float/Float_example.svg)

![5858d28deea4237a7c1320f7e649fb104aecb0e5](./../Assets/float/5858d28deea4237a7c1320f7e649fb104aecb0e5.svg)

公式：

![908c155d6002beadf2df5a7c05e954ec2373ca16](./../Assets/float/908c155d6002beadf2df5a7c05e954ec2373ca16.svg)

denormal or subnormal values: when all exponent bits are zero, the formula changes to: (−1)<sup>s</sup> × 0.m × 2<sup>1-bias</sup>

And when all exponent bits are one:

* Mantissa = 0 => ∞
* Mantissa ≠ 0 => NaN

![image-20241224115317225](./../Assets/float/image-20241224115317225.png)

### 理解方式

[Pro .NET Benchmarking](https://aakinshin.net/prodotnetbenchmarking/) 这本书提到的Sanglard interpretation: **a floating-point number is represented by a sign, a window between two consecutive powers of two, and an offset within that window.** All numbers can be splitted into nonoverlapped intervals (windows): [0.125;0.25), [0.25; 0.5), [0.5; 1), [1; 2), [2; 4), and so on. Each window also can be split into nonoverlapped subintervals (buckets). 

If we want to convert a number to the IEEE 754 notation, we should find the window that contains this number. The index of the window is the exponent value. Next, we should find the bucket inside the window that contains the number. The bucket index (offset) is the mantissa value. If the number is negative, we should do the same for the absolute value of this number and put 1 in the sign bit.

例子：

0 10011100 11011100110101100101001

* 符号位：0
* 指数位：156，E − Ebias = 156 − 127 = 29 **=>** Window is [2<sup>29</sup>; 2<sup>30</sup>]
* 小数位：7236393 **=>** Window被分割为2<sup>23</sup>个bucket，该数的bucket index为7236393
* Window范围为[536,870,912; 1,073,741,824]，按照2<sup>23</sup>个bucket切割，每个bucket为64
* 最后结果：536870912 + 64 * 7236393 = 1000000064

[Floating Point Visually Explained](https://fabiensanglard.net/floating_point_visually_explained/) 这里有另外的例子，用这种方法表示6.1：

![img](./../Assets/float/floating_point_window.svg)



[Onboarding floating-point](https://www.altdevarts.com/p/onboarding-floating-point) 系列也提到了类似的思路，从定点数讲到如何理解浮点数，浮点数作为压缩等等。



## 比较

[Comparing Floating-Point Numbers Is Tricky](https://bitbashing.io/comparing-floats.html)

Since the result of every floating-point operation must be rounded to the nearest possible value, math doesn’t behave like it does with real numbers. 

The C standard library contains a `FLT_EPSILON`, equal to the difference between 1.0 and the value that follows it. For values smaller than 1, `FLT_EPSILON` quickly becomes too large to be useful. For values greater than 2, `FLT_EPSILON` is smaller than the distance between adjacent values, so `fabs(a - b) <= FLT_EPSILON` will always be false.









[How Python Compares Floats and Integers](https://blog.codingconfessions.com/p/how-python-compares-floats-and-ints)

## 性能

* Floating point number division is faster than integer division because of the exponent part requires only a relatively cheap fixed-cost subtraction. [performance - Why float division is faster than integer division in c++? - Stack Overflow](https://stackoverflow.com/questions/55832817/why-float-division-is-faster-than-integer-division-in-c#:~:text=Floating point number division is,one plain subtraction is used.)
* Denormal numbers的性能问题 [hardware-effects/floating-point](https://github.com/Kobzol/hardware-effects/tree/master/floating-point)
* TODO：pro .net benchmark的其他问题



## 工具

* 查看浮点数：[Float Exposed](https://float.exposed/0x4e6e0000)



## More（TODO）

*  资料汇编 [Floating-point further reading - by Mike Acton - AltDevArts](https://www.altdevarts.com/p/floating-point-further-reading) 
* [从零开始实现浮点数跨平台确定性（帧同步） - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/682531986)

- [cbloom rants: Float to int casts for data compression](http://cbloomrants.blogspot.com/2023/07/float-to-int-casts-for-data-compression.html)
- [Float Compression 0: Intro · Aras' website (aras-p.info)](https://aras-p.info/blog/2023/01/29/Float-Compression-0-Intro/)
- [Exposing Floating Point – Bartosz Ciechanowski](https://ciechanow.ski/exposing-floating-point/)
- [Managing Rounding Error (pbr-book.org)](https://pbr-book.org/3ed-2018/Shapes/Managing_Rounding_Error)
- Demystifying Floating Point Precision[21 « November « 2017 « The blog at the bottom of the sea (demofox.org)](https://blog.demofox.org/2017/11/21/)
- [Float Toy (evanw.github.io)](https://evanw.github.io/float-toy/)
- [Comparing Floating-Point Numbers Is Tricky (bitbashing.io)](https://bitbashing.io/comparing-floats.html)
- [Comparing Floating Point Numbers, 2012 Edition | Random ASCII – tech blog of Bruce Dawson (wordpress.com)](https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/)
- [What Every Computer Scientist Should Know About Floating-Point Arithmetic (oracle.com)](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- [How Python Compares Floats and Integers (codingconfessions.com)](https://blog.codingconfessions.com/p/how-python-compares-floats-and-ints)
- gpgpu for science
- round
- 压缩
- fp16
