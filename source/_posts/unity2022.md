---
title: Unity引擎升级踩坑记
tags:
  - GameDev
date: 2025-03-25 
---



唉。

### 先用原版引擎出包

最开始是单独拉了一个分支来做实验。

#### 先用Editor打开

用2022的editor打开项目自然是需要稍微改点编译报错，这个没啥有技术含量的地方，就是把一些Unity打开工程报错的地方修掉。比如项目里自己写的Tuple和.Net自带的冲突了（因为.Net版本升级），一些在2018中存在于Experimental命名空间的函数和类型也正常升级，要么换成正确的（比如UIElements、PlayerLoop等，TextureFormat用的astc的enum要改成ASTC_4x4），要么被废弃了就换其他的（比如Physics2D.colliderAABBColor）。

开始运行之后杂事也是很多，有的dll有冲突，有的方法会报错（2018中有个从StreamReader靠反射拿decoded_count，2022已经没有这个字段了），有的选项要改改（PlayerSetting改下insecureHttpOption），也修了一些因为P4抽风了merge造成的bug。不管如何虽然坑坑洼洼，好歹游戏在Editor上可以跑起来了。另外2022差点就不支持OpenGL ES 2.0了，而我们的项目还是2.0。

后面因为2022.3某个早期引擎有恶性bug会直接crash并且删library才能好，还是把引擎又升级到了2022.3比较新（后期）的版本，小版本一般都是修bug，升级起来倒是也没有太累（肝就完了）。另外在Mac上也遇到了神奇的问题，用官方Editor打开工程会有概率卡死，卡在Unity自己的构建后端`bee backend`，后面发现是用的Unity版本是x86版本的不是M系列芯片原生的Arm版，唉。

#### 开始出安卓包

开始出包路漫漫长，Unity的crash就不谈了（比如EditorUtility.UnloadUnusedAssetsImmediate、asset path为空的ab包会导致打包时候crash等）。最恶心的是平台部分，2022的安卓library有要求，见[Unity - Manual: Import an Android Library Project](https://docs.unity3d.com/Manual/android-library-project-import.html)。简而言之，除了一些gradle的改动之外，安卓的lib需要文件夹后面带个`.androidlib`，这给出包带来了巨大的麻烦，只能一个个处理好。更加恶心的事，因为文件目录的改动没法自动从开发分支merge过来，安卓部分的改动每次都要手动看。不仅gradle经常抽风，P4也在帮忙，mark for delete的文件夹P4不会删，但是如果名字里带`.androidlib`，依然会被unity认为是个安卓库，会导致找不到manifest而报错。

好不容易把包弄出来了，启动就crash（也是意料之中）,`Throwing new exception 'No interface method getPackStates...`，升级一下gradle里面googleplay的依赖即可。当然升级引擎也带来了副作用，见[Unity - Manual: Android requirements and compatibility](https://docs.unity3d.com/Manual/android-requirements-and-compatibility.html)：`Unity supports Android 6.0 “Marshmallow” (API level 23) and above` 会带来玩家流失，但目前这就不是我要处理的问题了。

#### 双线出包

双线出包其实是后面的事情了，但是放到这里一起说。我们经历了三个阶段：

* 第一个阶段，有单独的2022分支，我在上面随便改了测试；但是久了之后因为没有单独的服务器分支，会进不去游戏，偶尔需要merge点开发分支的代码、协议之类的过来
* 第二个阶段，单独的2022分支保留，每天开始从开发分支把美术资源、客户端代码等自动merge过来；我给了一个白名单，那些东西就保留2022分支不merge（包括安卓插件、ProjectSettings、Packages等）
* 第三个阶段，废弃单独的分支，把2022相关的内容做进开发分支；我写了脚本，会在做2022的包之前跑一下，可以自动把该分支处理成可以给2022出包的状态（客户端代码部分依靠宏来区分，其他部分就是按我硬写的来增删改）

第三个阶段其实已经不错了，合并分支还是带来了很多好处的。当然这里也有故事，我们对于2018的引擎有许多魔改，有的为了性能，有的为了功能。要共用客户端代码并且保持客户端功能一致的话，魔改的部分肯定是要优先处理的，这样QA也可以先测。总体来说也是经历了魔改功能全部关闭、把功能相关的魔改迁移过来、几乎全部迁移过量这个过程。2018和2022的魔改宏是分开的，方便分别控制。

美中不足的是安卓的lib那些还是没啥好办法自动能同时兼容2018和2022，另外提交C#代码的时候也没有2022的代码编译检查（2018的有，但是如果2018和2022都跑一遍时间太久了，不合算）。

#### 上线前

上线前主要是一些其他的工作，比如热更、混淆等等。

对于热更而言，资源热更走ab包的，其实没啥问题，主要是iFix这部分是不是兼容。老大当然是期望2022可以无缝吃2018的代码热更的，但是不太现实，只能区分开来。另外在2022上，选择.net standard会对iFix造成影响，打patch的时候iFix会认为你用了.net standard的string，但打包时候已经被unity linker干掉换成mscrolib的了，然后iFix就会找不到那个standard的string类型报异常。这里还有故事，2022的源码，il2cpp.exe的部分竟然还是给的binary，要源码要再付钱。。。

混淆也是有问题，主要是没有报错也没发现（可以考虑扫描globalmetadata）。2018中混淆的dll路径在是 `Library\ScriptAssemblies\Assembly-CSharp.dll`，2022中这个dll依然存在，但只是给editor用的了，真正的路径在`/Temp/StagingArea/Data/Managed`下面。解决方法就是按官方推荐的用`IPostBuildPlayerScriptDLLs`。

### Bug修复

当然运行不会是一帆风顺的，随意罗列一些修过的bug：

- 相比于2018，2022（或者说更新版本的C#和.Net）对排序函数的要求更严格了
- 2022强制要求TextureFormat.ETC_RGB4的width和height是4的倍数
- Prez的Shader因为PassTag不对导致不画了，纯黑（2018是vertex，但2022需要ForwardBase）
- 边缘光插件（主要是depthblur）因为Unity行为改了有问题，导致开启后处理后游戏大厅没有UI
- http请求会经常data type error，后面发现问题在于unity底层网络的实现换了：如果后端反一个 {} 这样的空数据，2018拿到的data是一个0长度的byte数组，2022拿到的则是null，也是一种GC优化吧
- 有一些动画制作不规范，有两个bone root，在2018上可以播放，2022直接T pose，让美术修了
- 2022的游戏切出去再切回来有花屏问题，看起来Unity2022为了消除掉切回来那瞬间的黑屏，自作聪明会在surface被销毁的时候自己存一份，然后切回来的时候展示几帧存的那份，但是存的那份明显有点问题，部分UI花了
- 文档里说`From inside OnCollisionStay or OnCollisionEnter you can always be sure that contacts has at least one element` ，这在2022上经过测试好像不是真的，遇到了产生碰撞但是没有碰撞点的情况
- 我猜是Unity2022为了底层支持frame pacing改了底层一些逻辑，在关闭frame pacing的情况下，设置Unity到90帧，实际帧率跑到了120

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
- 2018的Particle里`texture sheet animation`模块，里面解算`Frame over Time`那个curve有问题，导致2018用有bug的模块做出来的效果和2022表现又对不上了 => 同样没啥好办法，只能把表现明显的资源改了

其实Unity从来没有承认过自己的ab包是保证完全兼容的，[Unity Asset Bundles tips and pitfalls](https://unity.com/blog/engine-platform/unity-asset-bundles-tips-pitfalls)：

> Asset Bundles are generally forward compatible, so bundles built with older versions of Unity will in most cases work on games built on newer versions of Unity (assuming you do not strip the TypeTree info, as covered later). The opposite is not true, so bundles built on a version of Unity that’s newer than the one used for your game build are unlikely to load correctly.
>
> As the difference in version between the bundle and the engine used for the game build increases, compatibility becomes less likely. There are also cases where the bundle might still be loaded, but the objects contained within the bundle cannot be loaded correctly in the new version of Unity, likely due to a change in the way the objects are serialized, thus creating issues. In that case, you’ll need to rebuild your bundles to maintain compatibility.

### 优化

#### 编引擎

拿到了Unity源码，就开始编一下试试，也是一堆问题：

- 用Hub装依赖可能有问题，注意下modules.json 装的依赖对不对
- 本地编引擎注意NDK版本，另外编译可能需要accept一下sdk的license：["Failed to install the following Android SDK packages as some licences have not been accepted" error - Stack Overflow](https://stackoverflow.com/questions/54273412/failed-to-install-the-following-android-sdk-packages-as-some-licences-have-not)

* 编译安装so部分的引擎的文档不全，android sdk的31也需要，command line tools只能是6
* 在Mac上编，官方推荐出Mac Editor最高可用Xcode14；还是要我自己看一堆模板报错修了修，现在Xcode16可以正常编译了

#### 优化评估与迁移

这其实是整个过程里面最费时间的过程：评估我们在2018做的种种优化，能不能在2022上也实现。前面其实提过还有一部分关于新功能的对于引擎的魔改，这部分倒是都问题不大，几乎1：1复制即可。

有crash

- 大厅人物模型偶现没有影子 => 和shader keyword strip有关，不能strip不属于自己的pass的shader
- animation 16bit压缩，18的ab包的type tree是不完整的（生成type tree时候不走判断16bit的if分支），走safe binary read去读18打的带16bit animation压缩的ab包会崩溃（18和22的客户端都会）=> 重打ab包，不要带16bit压缩

#### 性能

* SafeBinaryRead太慢，除了animation以外的transfer优化 => ruiheng做了particle的，优化要考虑unity5.6打的ab包
* safebinaryRead对于整体性能（加载速度、内存）的影响 => Done，云柯那边写了强行按stream读的办法，但是要注意序列化字段要对齐，builtin resource也要考虑

[Unity Asset Bundles tips and pitfalls](https://unity.com/blog/engine-platform/unity-asset-bundles-tips-pitfalls)：

> For example, if the format or the structure of the object have changed, they allow you to do a Safe Binary read so Unity can attempt to load it regardless. This has a performance cost, so in general it’s recommended to update bundles whenever possible when you update the engine.



* cubemap多 => 关闭BuiltinSkyManager即可



Shader Include差异