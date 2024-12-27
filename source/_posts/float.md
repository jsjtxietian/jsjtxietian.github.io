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

图见[Exposing Floating Point – Bartosz Ciechanowski](https://ciechanow.ski/exposing-floating-point/)

![All the special values](./../Assets/float/float_special_values.svg)

* denormal or subnormal values: when all exponent bits are zero, the formula changes to: (−1)<sup>s</sup> × 0.m × 2<sup>1-bias</sup> (bias = 127 for 32bit)
  * `x` and `y` can be normal float but `x - y` is subnormal. If it wasn’t for subnormals the difference after rounding would be equal to 0, thus implying the equality of not equal numbers.

* floats have both +0.0 and -0.0 => `0.0 == -0.0` is true even though the two zeros have different encoding. Additionally, `-0.0 + 0.0` is equal to `0.0`, so by default the compiler can’t optimize `a + 0.0` into just `a`, [performance - What does gcc's ffast-math actually do? - Stack Overflow](https://stackoverflow.com/questions/7420665/what-does-gccs-ffast-math-actually-do/22135559#22135559)
* when all exponent bits are one:
  * Mantissa = 0 => Infinity
  * Mantissa ≠ 0 => NaN => By default the result of any operation involving NaNs will result in a NaN as well. NaNs are not equal to anything, even to themselves.
* Incrementing the integer representation of the maximum `float` value by one => You get infinity. Decrementing the integer form of the minimum `float` => You enter the world of subnormals. Decrease it for the smallest subnormal => You get zero. Things fall into place just perfectly. The two caveats with this trick is that it won’t jump from +0.0 to −0.0 and vice versa.


![image-20241224115317225](./../Assets/float/image-20241224115317225.png)



`bfloat16` is  a 16-bit floating point number type with a much smaller range and precision than the IEEE-standard `float32` type, making it much faster to compute with. The `bfloat16` is much easier to convert to and from `float32` than `float16` is -- it's just a single bit shift, because its exponent takes the same number of bits.

![img](./../Assets/float/674b311f019791da08e5ac9a_674b30c8926734b9369d885f_bfloat.png)



### 一种直观的理解方式

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



## 精度问题

[Demystifying Floating Point Precision](https://blog.demofox.org/2017/11/21/)

Here’s a table showing the amount of precision you get with each data type at various exponent values. N/A is used when an exponent is out of range for the specific data type.

![latex](./../Assets/float/latex.png)

A half float has a maximum exponent of 15, the precision is 32 which is the smallest step that can be made in a half float at that scale. That range includes the smaller number but not the larger number. That means that the largest number a half float can store is one step away (32) from the high side of that range. So, the largest number that can be stored is 65536 – 32 = **65504**.

* Floating point numbers have between 6 and 7 digits of precision, regardless of exponent.
* Half floats have 10 mantissa bits and 2^10 = 1024, so they just barely have 3 digits of precision.
* Doubles have 52 mantissa bits and 2^52 = 4,503,599,627,370,496. That means doubles have between 15 and 16 digits of precision.



### 游戏中的例子

一个例子，如果记录游戏时间，每帧+0.0333，什么时候float开始失效：

* floating point numbers have a precision of 0.03125 at exponent value 18. So, exponent 18 is close, but it’s precision is smaller than what we want – aka the precision is still ok.
* things break down at exponent 19, which has precision of 0.0625. Time is actually moving almost twice as fast in this case!
* At exponent 20, we start at 1056576.00 and adding 1/30 doesn’t even change the value. Time is now stopped.

**When will I hit precision issues** => `value = pow(2, ceil(log2(mantissa * precision))`



另一个例子，[A matter of precision](https://tomforsyth1000.github.io/blog.wiki.html#[[A%20matter%20of%20precision]])：

if you are doing any sort of precise timing - physics, animation, sound playback - you need not just good precision, but totally reliable precision, because there tend to be a bunch of epsilons that need tuning. You're almost always taking deltas between absolute times, e.g. the current time and the time an animation started, or when a sound was triggered. Everything works fine in your game for the first five minutes, because absolute time probably started at zero, so you're getting lots of precision. But play it for four hours, and now everything's really jinky and jittery. **The reason is that four hours is right about 2^24 milliseconds, so you're running out of float precision for anything measured in milliseconds**, which is why physics and sound are particularly susceptible - but almost any motion in a game will show this jittering.

- Don't start your times at zero. Start them at something big. Ideally do the same with position - by default set your origin a long way away.
- float32 has precision problems even in normal circumstances - you only get about seven digits of precision. float64 is a tricky beast to use in practice - writing "double" in C is not sufficient.
- Variable precision is a nightmare for reproducibility and testability - even float64. Any time you want to use doubles in a game, you probably haven't understood the algorithm.
- Fixed-point may be old, but it works well for absolute time and position.
- Help yourself guard against precision-cancellation problems by not exposing absolute time and position to most parts of your app. Any time you think you need them, you're almost certainly going about the problem wrong.



### Storing Integers

a floating point number can EXACTLY store all integers from -2<sup>MantissaBits+1</sup> to 2<sup>MantissaBits+1</sup>

见 [types - Which is the first integer that an IEEE 754 float is incapable of representing exactly? - Stack Overflow](https://stackoverflow.com/questions/3793838/which-is-the-first-integer-that-an-ieee-754-float-is-incapable-of-representing-e)

* For half floats that means you can store all integers between (and including) -2048 to +2048.
* For floats, it’s -16,777,216 to +16,777,216  
* For doubles it’s -9,007,199,254,740,992 to +9,007,199,254,740,992 => Doubles can in fact exactly represent any 32 bit unsigned integer, since 2^32 = 4,294,967,296.





## 比较

[Comparing Floating-Point Numbers Is Tricky](https://bitbashing.io/comparing-floats.html)

Since the result of every floating-point operation must be rounded to the nearest possible value, math doesn’t behave like it does with real numbers. 

The C standard library contains a `FLT_EPSILON`, equal to the difference between 1.0 and the value that follows it. For values smaller than 1, `FLT_EPSILON` quickly becomes too large to be useful. For values greater than 2, `FLT_EPSILON` is smaller than the distance between adjacent values, so `fabs(a - b) <= FLT_EPSILON` will always be false.

对于[Boost Floating-point Comparison - 1.63.0](https://www.boost.org/doc/libs/1_63_0/libs/math/doc/html/math_toolkit/float_comparison.html)，after removing template boilerplate and edge case handling for infinity and NaNs, they resemble:

```c++
float relative_difference(float a, float b)
{
    return fabs((a - b) / min(a, b));
}

float epsilon_difference(float a, float b)
{
    return relative_difference(a, b) /
           FLT_EPSILON;
}
```



引入UPL的概念： **units of least precision between inputs**.  Boost offers a function called `float_distance` to get the distance between values in ULPs, but it’s about an order of magnitude slower than the approaches discussed so far.

**Adjacent floats (of the same sign) have adjacent integer values when reinterpreted as such**（参考上文的理解方法）, calculating the ULPs between values :

```c++
int32_t ulpsDistance(const float a, const float b)
{
    // Save work if the floats are equal.
    // Also handles +0 == -0
    if (a == b) return 0;

    const auto max =
        std::numeric_limits<int32_t>::max();

    // Max distance for NaN
    if (isnan(a) || isnan(b)) return max;

    // If one's infinite and they're not equal, max distance.
    if (isinf(a) || isinf(b)) return max;

    int32_t ia, ib;
    memcpy(&ia, &a, sizeof(float));
    memcpy(&ib, &b, sizeof(float));

    // Don't compare differently-signed floats.
    if ((ia < 0) != (ib < 0)) return max;

    // Return the absolute value of the distance in ULPs.
    int32_t distance = ia - ib;
    if (distance < 0) distance = -distance;
    return distance;
}
```

Relative epsilons—including ULPs-based ones—don’t make sense around zero. The exponential nature of floats means that many more values are gathered there than anywhere else on the number line.

using it meaningfully is difficult:

```c++
bool nearlyEqual(float a, float b,
        float fixedEpsilon, int ulpsEpsilon)
{
    // Handle the near-zero case.
    const float difference = fabs(a - b);
    if (difference <= fixedEpsilon) return true;

    return ulpsDistance(a, b) <= ulpsEpsilon;
}
```

When comparing floating-point values, remember:

- `FLT_EPSILON`… isn’t float epsilon, except in the ranges [-2, -1] and [1, 2]. The distance between adjacent values depends on the values in question.
- When comparing to some known value—especially zero or values near it—use a fixed ϵ that makes sense for your calculations.
- When comparing non-zero values, some ULPs-based comparison is probably the best choice.
- When values could be anywhere on the number line, some hybrid of the two is needed. Choose epsilons carefully based on expected outputs.

### How Python Compares Floats and Ints

[How Python Compares Floats and Integers](https://blog.codingconfessions.com/p/how-python-compares-floats-and-ints)

Languages like C and Java implement implicit type promotion, converting integers to doubles and comparing them bit by bit. 

Python is unique in this respect. It has infinite precision integers, making type promotion unfeasible in many situations. Consequently, Python uses its specialized algorithm to compare these numbers, which itself has edge cases:

1. If both `v` and `w` are float objects, then Python simply compares their underlying double values.
2. However, if `w` is an integer object, then:
   1. If they have opposite signs then it’s sufficient to compare the signs.
   2. Else if `w` is a huge integer (Python has infinite precision ints) then also we can skip comparing the actual numbers because `w` is larger.
   3. Else if `w` fits within `48` bits or less, then Python converts `w` into a double, and then does a direct comparison between `v` and `w`’s double values.
   4. Else if the exponents of `v` and `w` in their normalized fraction form are not equal then it is sufficient to decide based on their exponents.
   5. Else, compare the actual numbers. To do this, split `v` into its integer and fraction parts and then compare `v`’s integer part with `w`. (While taking into account the fractional part of `v`).

why Python gives the result for `9007199254740993 == 9007199254740993.0` as `False`, because it sees this as a comparison between `9007199254740993` and `9007199254740992.0`.



## 渲染

[A matter of precision](https://tomforsyth1000.github.io/blog.wiki.html#[[A%20matter%20of%20precision]])：The most obvious place this happens in games is when you're storing world coodinates in standard float32s, and two objects get a decent way from the origin. The first thing you do in rendering is to subtract the camera's position from each object's position, and then send that all the way down the rendering pipeline. The rest all works fine, because everything is relative to the camera, it's that first subtraction that is the problem. For example, getting only six decimal digits of precision, if you're 10km from the origin (London is easily over 20km across), you'll only get about 1cm accuracy. Which doesn't sound that bad in a static screenshot, but as soon as things start moving, you can easily see this horrible jerkiness and quantisation.



fp16的shader + lux问题：

[Sebastian Aaltonen on X: "Physically correct direct sun light (day) is 100,000 lux. fp16 maximum value is 65504.0. fp10 and fp11 have also 5 bit mantissa, so their range is the same. Do people pre-expose their lights to fit into fp16?" / X](https://x.com/SebAaltonen/status/1727247423385526323)





## 性能

* Floating point number division is faster than integer division because of the exponent part requires only a relatively cheap fixed-cost subtraction. [performance - Why float division is faster than integer division in c++? ](https://stackoverflow.com/questions/55832817/why-float-division-is-faster-than-integer-division-in-c#)
* Denormal numbers的性能问题 [hardware-effects/floating-point](https://github.com/Kobzol/hardware-effects/tree/master/floating-point)



## 工具

* 查看浮点数：[Float Exposed](https://float.exposed/0x4e6e0000)
* [Float Toy (evanw.github.io)](https://evanw.github.io/float-toy/)



## More

* 资料汇编：[Floating-point further reading - by Mike Acton - AltDevArts](https://www.altdevarts.com/p/floating-point-further-reading) 
* Links：[21 « November « 2017 « The blog at the bottom of the sea](https://blog.demofox.org/2017/11/21/)
* boost的文档：[Floating-point Comparison - 1.63.0](https://www.boost.org/doc/libs/1_63_0/libs/math/doc/html/math_toolkit/float_comparison.html)




## TODO

* [从零开始实现浮点数跨平台确定性（帧同步） - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/682531986)

- [cbloom rants: Float to int casts for data compression](http://cbloomrants.blogspot.com/2023/07/float-to-int-casts-for-data-compression.html)
- [Float Compression 0: Intro · Aras' website (aras-p.info)](https://aras-p.info/blog/2023/01/29/Float-Compression-0-Intro/)
- [Exposing Floating Point – Bartosz Ciechanowski](https://ciechanow.ski/exposing-floating-point/)
- [Managing Rounding Error (pbr-book.org)](https://pbr-book.org/3ed-2018/Shapes/Managing_Rounding_Error)
- [Comparing Floating Point Numbers, 2012 Edition | Random ASCII – tech blog of Bruce Dawson (wordpress.com)](https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/)
- [What Every Computer Scientist Should Know About Floating-Point Arithmetic (oracle.com)](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- [Intermediate Floating-Point Precision | Random ASCII – tech blog of Bruce Dawson](https://randomascii.wordpress.com/2012/03/21/intermediate-floating-point-precision/)
- gpgpu for science
- 压缩
- fp16 渲染
- 定点数 浮点数
- 转化 float  Converting a Floating-Point Number to IEEE-754 Format
- TODO：pro .net benchmark的其他问题
- [the secret life of NaN](https://anniecherkaev.com/the-secret-life-of-nan)
