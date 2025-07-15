---
title: Unity引擎升级踩坑记
tags:
  - GameDev
date: 2025-03-25
---



从前年年底开始我就开始着手给项目组升级Unity使用版本，现在用的是Unity2018，希望升级到Unity2022。说实话最开始没有想到这个task做到现在才可以说基本差不多了。记录一些遇到的问题，也当是给自己的一个纪念。

### 先用原版引擎出包

最开始是从开发分支单独branch了一个分支来做实验，这样提交代码自由些。

#### 先用Editor打开

用2022的editor打开项目自然是需要稍微改点编译报错，这个没啥有技术含量的地方，就是把一些Unity打开工程报错的地方修掉。比如项目里自己写的Tuple和.Net自带的冲突了（因为.Net版本升级），一些在2018中存在于Experimental命名空间的函数和类型也正常升级，要么换成正确的（比如UIElements、PlayerLoop等，TextureFormat用的astc的enum要改成ASTC_4x4），要么被废弃了就换其他的（比如Physics2D.colliderAABBColor）。插件也是麻烦的地方，Cinemachine这种插件的代码也是稍微修了修才能编过。不仅如此，Unity还会偷偷给你塞com.unity.ads、com.unity.purchasing这种垃圾插件。

开始运行之后杂事也是很多，除了dll冲突、运行时候报错、PlayerSetting选项调教（比如insecureHttpOption）等各种预期之内的工作，也修了一些因为P4抽风了merge造成的bug。不管如何，虽然坑坑洼洼，好歹游戏在Editor上可以跑起来了。另外2022差点就不支持OpenGL ES 2.0了，而我们的项目还是2.0。

后面因为2022.3某个早期引擎有恶性bug会直接crash并且删library才能好，还是把引擎又升级到了2022.3比较新（后期）的版本，小版本一般都是修bug，升级起来倒是也没有太累（肝就完了）。另外在Mac上也遇到了神奇的问题，用官方Editor打开工程会有概率卡死，卡在Unity自己的构建后端`bee backend`，后面发现是用的Unity版本是x86版本的不是M系列芯片原生的Arm版，换了原生版就好了，唉。

#### 开始出安卓包

开始出包路漫漫长，Unity的crash就不谈了（比如EditorUtility.UnloadUnusedAssetsImmediate、asset path为空的ab包会导致打包时候crash等）。最恶心的是平台部分，2022的安卓library有要求，见[Unity - Manual: Import an Android Library Project](https://docs.unity3d.com/Manual/android-library-project-import.html)。简而言之，除了一些gradle的改动之外，安卓的lib需要文件夹后面带个`.androidlib`，这给出包带来了巨大的麻烦，只能一个个处理好。因为文件目录的改动没法自动从开发分支merge过来，2018那边也在正常开发，安卓部分的改动每次都要手动看，这里经常容易出问题。

当然，最开始出安卓包倒是没去考虑bugly、firebase那些可能要升级才能使用的插件，先都暂时禁用了，看看能不能出包玩起来再说。不仅gradle经常抽风，P4也在帮忙：mark for delete的文件夹P4不会删，但是如果名字里带`.androidlib`，依然会被unity认为是个安卓库，会导致找不到manifest而报错。

好不容易把包弄出来了，启动就crash（也是意料之中）,`Throwing new exception 'No interface method getPackStates...`，升级一下gradle里面googleplay的依赖即可。当然升级引擎也带来了副作用，见[Unity - Manual: Android requirements and compatibility](https://docs.unity3d.com/Manual/android-requirements-and-compatibility.html)：`Unity supports Android 6.0 “Marshmallow” (API level 23) and above` 会带来玩家流失，但目前这就不是我要处理的问题了（Update：最近通过改代码的方式又改成支持Api level 21了，看起来Unity只是自己升了下，没有什么一定要升的理由）。

#### 双线出包

双线出包其实是后面的事情了，但是放到这里一起说。我们经历了三个阶段：

* 第一个阶段，有单独的2022分支，我在上面随便改了测试；但是久了之后因为没有单独的服务器分支，会进不去游戏，偶尔需要merge点开发分支的代码、协议之类的过来
* 第二个阶段，单独的2022分支保留，每天开始从开发分支把美术资源、客户端代码等自动merge过来；我给了一个白名单，那些东西就保留2022分支不merge（包括安卓插件、ProjectSettings、Packages等）
* 第三个阶段，废弃单独的分支，把2022相关的内容做进开发分支；我写了脚本，会在做2022的包之前跑一下，可以自动把该分支处理成可以给2022出包的状态（客户端代码部分依靠宏来区分，其他部分就是按我硬写的来增删改）

第三个阶段其实已经不错了，合并分支还是带来了很多好处的。当然这里也有故事，我们对于2018的引擎有许多魔改，有的为了性能，有的为了功能。要共用客户端代码并且保持客户端功能一致的话，魔改的部分肯定是要优先处理的，这样QA也可以先测。总体来说也是经历了魔改功能全部关闭、把功能相关的魔改迁移过来、几乎全部迁移过量这个过程。2018和2022的魔改宏是分开的，方便分别控制。

美中不足的是安卓的lib那些还是没啥好办法自动能同时兼容2018和2022，只能手动看，倒也不是不能自动化，而是似乎没人有空弄。另外也想尽量减少对于2018正常开发的影响，所以我这边就会难受点了，现在想想似乎AI倒是很适合来做这个事情。另外提交C#代码的时候也没有2022的代码编译检查（2018的有，但是如果2018和2022都跑一遍时间太久了，不合算），同事的ide经常会会加点奇怪的using进代码，导致我会第二天发现daily包没出来，然后再摇人来改。

#### 上线前

上线前主要是一些其他的工作，之前提到的被禁用的bugly、firebase那些插件要重新加回包里。另外的就是热更、混淆、anti-hack之类的。

对于热更而言，资源热更走ab包的，其实没啥问题，主要是iFix这部分是不是兼容。老大当然是期望2022可以无缝吃2018的代码热更的，但是不太现实，只能区分开来。另外在2022上，选择.net standard会对iFix造成影响，打patch的时候iFix会认为你用了.net standard的string，但打包时候已经被unity linker干掉换成mscrolib的了，然后iFix就会找不到那个standard的string类型报异常。这里还有故事，2022的源码，il2cpp.exe的部分竟然还是给的binary，要源码要再付钱。。。

混淆也是有问题，主要是没有报错也没发现（可以考虑扫描globalmetadata）。2018中混淆的dll路径在是 `Library\ScriptAssemblies\Assembly-CSharp.dll`，2022中这个dll依然存在，但只是给editor用的了，真正的路径在`/Temp/StagingArea/Data/Managed`下面。解决方法就是按官方推荐的用`IPostBuildPlayerScriptDLLs`。

反外挂那边问题更多，毕竟如果线上需要同时跑两个引擎的包，有一堆配表工作要做。有趣的是，即使预先已经考虑了反外挂的问题，线上还是发现了更多之前没考虑到的问题。新包就像是一个投进原来的架构的炸弹，考验原先结构是不是真的高内聚低耦合。

为了不影响客户端，最开始两个客户端没有做吃配置热更的分离，这是一个巨大的错误，也造成了很严重的事故。引擎总想不影响别人偷偷做东西，实际上总是很难。

### Bug修复

出包之后，运行当然不会是一帆风顺的，罗列一些修过的bug：

- 有一些因为安卓的so没更新到最新的bug（因为前文所说的原因，在最开始都需要手动merge安卓的lib，会有遗忘的），有些时候不会报错，只是行为不太正确，比如上报的值为空；当然merge了lib也可能有问题，因为gradle那边也没法自动merge，会有一堆问题，尤其是和登录相关的改动。后面给安卓的lib路径加了提交检查，提醒每次改动要考虑2022下的情况
- 2018中有个从StreamReader靠反射拿decoded_count，2022已经没有这个字段了
- 相比于2018，2022（或者说更新版本的C#和.Net）对排序函数的要求更严格了
- 2022强制要求TextureFormat.ETC_RGB4的width和height是4的倍数
- Prez的Shader因为PassTag不对导致不画了，纯黑（2018是vertex，但2022需要ForwardBase）
- 边缘光插件AmplifyColor（主要是depthblur）因为Unity行为改了有问题，导致开启后处理后游戏大厅没有UI
- http请求会经常data type error，后面发现问题在于unity底层网络的实现换了：如果后端反一个 {} 这样的空数据，2018拿到的data是一个0长度的byte数组，2022拿到的则是null，也是一种GC优化吧
- 有一些动画制作不规范，有两个同名root bone，在2018上可以播放，2022直接T pose，让美术修了
- 2022的游戏切出去再切回来有花屏问题，看起来Unity2022为了消除掉切回来那瞬间的黑屏，自作聪明会在surface被销毁的时候自己存一份，然后切回来的时候展示几帧存的那份，但是存的那份明显有点问题，部分UI花了
- 文档里说`From inside OnCollisionStay or OnCollisionEnter you can always be sure that contacts has at least one element` ，这在2022上经过测试好像不是真的，遇到了产生碰撞但是没有碰撞点的情况
- 我猜是Unity2022为了底层支持frame pacing改了底层一些逻辑，在关闭frame pacing的情况下，设置Unity到90帧，实际帧率跑到了120
- 压缩的库在升级后也有问题，照着修了修：[Encoding 437 data could not be found · Issue #441 · adamhathcock/sharpcompress](https://github.com/adamhathcock/sharpcompress/issues/441)
- 通过sub-scene方式进行的level streaming会有几十上百个冗余的Cubemap，每个64k，发现unity2022自己作妖，关掉BuiltinSkyManager就行了
- 异形屏渲染也有问题，和resizableWindow、renderOutsideSafeArea啥的有关系，不过不是我修的
- 偶现的玩游戏会越来越卡，后面发现是因为我们进游戏会关GC，但是如果正好在增量GC期间强行把整个大的GC关了就会导致内部状态没有reset设置对，引擎会一直尝试做增量GC，直到每帧给的时间用完，下一帧继续，配合2022的帧时间机制，会越来越卡
- Prefab序列化如果和代码不匹配，可能直接crash
- 修了ShaderBinaryData::GetBlobData里面的空指针crash，也不是很确定就是Unity自带的还是我改出来的，反正先保护着

#### 关于序列化

2022理论上是兼容2018的meta文件的，但其实真的走下来发现问题也不小：

- Editor跑游戏的时候会有报错，注意有一些meta文件因为有多余的`\n`所以加载失败了
- 有的prefab和material加载不出来，看了下yaml，里面有多余的空行（其实是`\r\r\n `），写个脚本统一换成`\r\n`。
- meta文件的fileID生成逻辑在2018和2022中不一致，导致如果unity 2018的meta文件不是最新的，可能merge到2022的时候会有问题，导致prefab里面记录的id找不到而missing
- 部分动画的fbx的meta文件里有两个fileID指向同一个动画（例如7400000，7400002），serializedVersion: 19的meta部分情况下会被直接升到22200，导致clipAnimations会记录第二个id，就会导致引用丢失（2018的serializedFile是靠740000来记录的）；在2018的editor下强制重导之后版本是23，就不会被强制升到22200

#### Timeline

2022的timeline已经变成了C#上的package，不像是2018一样代码都在引擎内部。在2022读取2018打出来的ab包中的timeline的时候，有非常多的问题：

* Unity2018中timeline相关的`m_AssemblyName`是`UnityEngine.Timeline.dll`, 2022改成了`Unity.Timeline.dll`，我给改回去了
* Unity2022中修改了`PropertyName`的序列化方式，id在2018是按int读写，2022中改成了按string读，就导致默认都是0，timeline中很多节点对应不上，这我又给改回去了
* timeline的序列化字段中有父track的mute属性，我们的资源中有些是true有些是false，在2018中没问题，反正也不会去读取这个字段，但是2022原生支持这个功能，如果是true会去把整个父track和子全mute了读。为了不重打ab包，先不改资源，强行把2022中timeline的mute in hierarchy字段改成只看自己是否被mute，和2018的行为对齐（辛苦美术了就是）

- 2018的ab包timeline用了AnimationTrack的`m_OpenClipPreExtrapolation`等，2022中给这些字段换了名字，在`FormerlySerializedAs`里加上了旧的名字来兼容，但是，这个attribute只在editor下有用，runtime不会管这个。解决方法，我把名字给改回去了
- 2022调整了`ScriptRunBehaviourLateUpdate`和`ConstraintManagerUpdate`的先后顺序，先更新ParentConstraint，后在LateUpdate中更新Timeline，导致相比2018，部分特效的位置会落后一帧。这没啥好办法，只能把表现明显的资源改了
- 2018的Particle里`texture sheet animation`模块，里面解算`Frame over Time`那个curve有问题，导致2018用有bug的模块做出来的效果和2022表现又对不上了。同样没啥好办法，只能把表现明显的资源改了

其实Unity从来没有承认过自己的ab包是保证完全兼容的，[Unity Asset Bundles tips and pitfalls](https://unity.com/blog/engine-platform/unity-asset-bundles-tips-pitfalls)：

> Asset Bundles are generally forward compatible, so bundles built with older versions of Unity will in most cases work on games built on newer versions of Unity (assuming you do not strip the TypeTree info, as covered later). The opposite is not true, so bundles built on a version of Unity that’s newer than the one used for your game build are unlikely to load correctly.
>
> As the difference in version between the bundle and the engine used for the game build increases, compatibility becomes less likely. There are also cases where the bundle might still be loaded, but the objects contained within the bundle cannot be loaded correctly in the new version of Unity, likely due to a change in the way the objects are serialized, thus creating issues. In that case, you’ll need to rebuild your bundles to maintain compatibility.

### 优化

在基本功能稳定运行后，接下来考虑的是优化和性能问题。

#### 编引擎

拿到了Unity源码，就开始编一下试试，也是一堆问题：

- 用Hub装依赖可能有问题，注意下modules.json 装的依赖对不对
- 本地编引擎注意NDK版本，另外编译可能需要accept一下sdk的license：["Failed to install the following Android SDK packages as some licences have not been accepted" error - Stack Overflow](https://stackoverflow.com/questions/54273412/failed-to-install-the-following-android-sdk-packages-as-some-licences-have-not)

* 编译安装so部分的引擎的文档不全，android sdk的31也需要，command line tools只能是6
* 在Mac上编，官方推荐出Mac Editor最高可用Xcode14；还是要我自己看一堆模板报错修了修，现在Xcode16可以正常编译了

最近的时候，因为谷歌商店的要求[Support 16 KB page sizes  | Compatibility  | Android Developers](https://developer.android.com/guide/practices/page-sizes#benefits)，就把Unity在新版的changelist又做到目前引擎版本上，其实也没啥，引擎这边就是个`-Wl,-z,max-page-size=16384`，主要是要push其他部门升级对应的so。

#### 优化评估与迁移

这其实是整个过程里面最费时间的过程：评估我们在2018做的种种优化，能不能在2022上也实现。前面其实提过还有一部分关于新功能的对于引擎的魔改，这部分倒是都问题不大，几乎1：1复制即可。旧版本上已有优化的评估与迁移确实很花时间，幸运的是整体看起来，因为我们原来写的方式就很“外挂”，大部分的优化也可以以“迁移”的方式挂到新的引擎代码里面。我也是正好借着这个机会把我们组之前做的东西几乎全部学习了一遍。

两点感受，首先是需要好的工具支持，我自己很早就写了一些脚本来本地编译、替换so、重新打包签名等等，省了很多时间；但是我很晚才把在真机上调试引擎代码的方案走通，这里也浪费了一些时间（当然我们本地打包几乎不可能，而且editor和so的代码是分开的，导致真机调试也稍微有点麻烦）。另外也需要耐心与运气，有时候Unity自己的行为改动会影响优化的效果，只能慢慢查。

随手记录一些问题：

- 原来在2018里面include头文件来引入类型的做法在2022上也遇到了麻烦，一些循环include问题，总是可以处理的，无非就是恶心点
- 因为shader底层的实现改了，所以2018上的一些关于shader的内存优化很难1：1迁移，认真理解并且重新实现之后也会有一堆crash。还好大部分都还好查，空指针保护一下，只要是必现，都能查出来！偶现的就很麻烦了，毕竟乱删内存的时候，谁知道unity哪里给你存了个指针或者id指向那块地方
- 2018中会对animation做16bit位的压缩，但是实现方法有点问题，导致如果ab包中的animation被压缩了，生成的type tree其实是错误的（因为生成type tree时候不走判断16bit的if分支）。因此在2022的客户端包走safe binary read去读18打的带16bit animation压缩的ab包时会崩溃。这个没啥好办法，评估影响之后，只能先重打ab包了
- 当然也有不能用的优化、2022自己已经实现了的优化、会crash暂时没空去查的优化
- Unity的构建系统有点一言难尽，就不说perl的问题了，基于压缩包的external依赖管理也是非常神奇的，也给我们造成了一些问题

#### 性能

客户端包本身的性能其实还行，这也是升级引擎主要想要的，升级引擎是借势，可以利用Unity自己这几年写的一些好东西：

* 更小的包体，主要是il2cpp上的优化
* 大幅减少的卡顿，主要是增量GC、一些多线程加载和初始化等优化
* 几乎差不多的内存、帧率和启动时间，其实内存会好点，因为更小的so确实也会导致PSS小一些些

但是在考虑到ab包的时候就很麻烦了，由于项目的原因，不可能重新去把线上的ab包全部重打，[Unity Asset Bundles tips and pitfalls](https://unity.com/blog/engine-platform/unity-asset-bundles-tips-pitfalls)：

> For example, if the format or the structure of the object have changed, they allow you to do a Safe Binary read so Unity can attempt to load it regardless. This has a performance cost, so in general it’s recommended to update bundles whenever possible when you update the engine.

2022的客户端包读取2018打的ab包要走SafeBinaryRead，实在是太慢了，尤其是animation、particle这些（Instantiate时间倒是有所缩短）。想了办法，因为我们只有2022只需要兼容2018的ab包，那就看改代码强行走stream binary read，但是要注意序列化字段要对齐，builtin resource也要考虑。效果其实还不错，只是上线发现了不少crash，一部分原因是没料到线上竟然还有Unity5.6打的ab包，直接炸，另一些偶现的现在也没查出来，太难了。

#### More

其实到现在我这部分的工作已经差不多了，后面有同事一起来看那些更麻烦的问题。当然也有很多要做的，我们对于Unity2022的理解还比较浅，很多东西还可以试试：

* 新的工具：比如 [Hot Reload | Edit Code Without Compiling | Utilities Tools | Unity Asset Store](https://assetstore.unity.com/packages/tools/utilities/hot-reload-edit-code-without-compiling-254358?srsltid=AfmBOoq6rzNTA51Wczw_2_C4dbnrfv47fG-s2BZkR3R_tAdlUA67GOYB) [Unity - Scripting API: FrameTiming](https://docs.unity3d.com/2022.3/Documentation/ScriptReference/FrameTiming.html) [Profiler counters API guide | Unity Profiling Core API | 1.0.2](https://docs.unity3d.com/Packages/com.unity.profiling.core@1.0/manual/profilercounter-guide.html)
* 各种调教：内存参数、job system的调教、大小核分配策略、ProjectSettings里面一堆东西
  * 比如实测下来开il2cpp的faster and smaller性能会差20%，感觉不应该差那么多，也值得研究研究

* cpp那边似乎支持asan了，有空要跑跑看，其他的编译参数也可以玩玩，lto，relr等等

也有很多问题要解决，加油吧。