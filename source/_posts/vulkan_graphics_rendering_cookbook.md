---
title: Vulkan 3D Graphics Rendering Cookbook 读书笔记
tags:
  - GameDev
date: 2025-05-30
---

是时候重新学习vulkan了！这篇文章是关于 [Vulkan 3D Graphics Rendering Cookbook](https://www.packtpub.com/en-us/product/vulkan-3d-graphics-rendering-cookbook-9781803236612) 的读书笔记，这本书我看过第一版（[3D Graphics Rendering Cookbook](https://www.amazon.com/Graphics-Rendering-Cookbook-comprehensive-algorithms/dp/1838986197)），但是当时太囫囵吞枣了。代码在 [PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition)，我把仓库给了deepwiki [3D-Graphics-Rendering-Cookbook-Second-Edition | DeepWiki](https://deepwiki.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition)

## Chap 1 Establishing a Build Environment

配环境的一些东西，依赖管理用的是 [bootstrapping](https://github.com/corporateshark/bootstrapping)，除了一些依赖的仓库以外，还有很多二进制的资产依赖。CMake那边则是靠一个`SETUP_APP`宏让每一章都有单独的cmake project，方便学习。

* 多线程的库用的是[Taskflow](https://taskflow.github.io/taskflow/index.html)
* 依赖 [glslang](https://github.com/KhronosGroup/glslang) 来做runtime的SPIRV生成
* 依赖 [stb](https://github.com/nothings/stb) 读取图片文件，[KTX-Software](https://github.com/KhronosGroup/KTX-Software) 来压缩图像到BC7（[BC7 Format](https://learn.microsoft.com/en-us/windows/win32/direct3d11/bc7-format)），并把BC7保存到`.ktx`格式。为了和PicoPixel这个软件保持兼容，选择了KTX1.0格式。注意这里先走的`ktxTexture2_CompressBasis`，然后走`ktxTexture2_TranscodeBasis`压缩到BC7，然后走`memcpy`直接到ktx1.0格式。最后提了一句最新的可以直接考虑 [basis_universal](https://github.com/BinomialLLC/basis_universal)

CI那边就是每次push会自动build一轮。

## Chap 2 Getting Started with Vulkan

和Vulkan的API的交互部分都依赖于[lightweightvk](https://github.com/corporateshark/lightweightvk), 在这个库的基础上，init swapchain的代码还是很简洁的：

```cpp
int main()
{
  int width  = 960, height = 540;

  GLFWwindow* window                 = lvk::initWindow("Simple example", width, height);
  std::unique_ptr<lvk::IContext> ctx = lvk::createVulkanContextWithSwapchain(window, width, height, {});

  while (!glfwWindowShouldClose(window)) {
    glfwPollEvents();
    glfwGetFramebufferSize(window, &width, &height);
    if (!width || !height)
      continue;
    lvk::ICommandBuffer& buf = ctx->acquireCommandBuffer();
    ctx->submit(buf, ctx->getCurrentSwapchainTexture());
  }

  ctx.reset();
  glfwDestroyWindow(window);
  glfwTerminate();
  return 0;
}
```

vulkan那些基础概念可以看[Understanding Vulkan® Objects](https://gpuopen.com/learn/understanding-vulkan-objects/)

开始讲lightweightvk的一些实现，大部分代码都在 VulkanClass.cpp里，非常高内聚，简洁清晰，阅读体验很好。

### Initializing Vulkan instance and graphical device

* 教了下怎么手动关闭一些validation layer：[vulkan.lunarg.com/doc/view/latest/windows/layer_configuration.html](https://vulkan.lunarg.com/doc/view/latest/windows/layer_configuration.html)，宏定义很有意思，用了 `#if defined(VK_EXT_layer_settings) && VK_EXT_layer_settings` , 见 [Check if `VK_EXT_layer_settings` is defined · corporateshark/lightweightvk@12bbe18](https://github.com/corporateshark/lightweightvk/commit/12bbe18d68ac288c02cb871dfae92facb3dc711f)

* 用伟大的volk来动态去加载vulkan那些entry point

* We can think of **Vulkan devices as collections of queues and memory heaps**. To use a device for rendering, we need to specify a queue capable of executing graphics-related commands, along with a physical device that has such a queue.

* `addNextPhysicalDeviceProperties`里还用了`std::launder`：

  ```cpp
  void lvk::VulkanContext::addNextPhysicalDeviceProperties(void* properties) {
    // ...
    std::launder(reinterpret_cast<VkBaseOutStructure*>(properties))->pNext =
        std::launder(reinterpret_cast<VkBaseOutStructure*>(vkPhysicalDeviceProperties2_.pNext));
    vkPhysicalDeviceProperties2_.pNext = properties;
  }
  ```

* Sometimes, especially on mobile GPUs, graphics and compute queues might be the same. 处理这种边界情况

* 提了一嘴比较重要的vulkan feature，descriptor indexing 和 dynamic rendering（终于不用搞renderpass了）；这边做了很多check，保证想要的device extension都是available的，保证强制开的那些feature都是支持的，使用了宏和lambda来简化代码

### Initializing Vulkan swapchain

* A swapchain is an object that holds a collection of available offscreen images, or more specifically, **a queue of rendered images waiting to be presented to the screen**. OpenGL里present的过程都是走平台函数，比如eglSwapBuffers，vulkan给了我们更多的控制

* `chooseSwapSurfaceFormat`的顺序很有趣，先优先选择驱动给的列表里第一个出现的BGR或者RGB，然后根据颜色空间找完全match的，没有的话有有fallback机制
* `chooseUsageFlags`有bug，提了[Issue #24](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/24)；要确定surface本身支持`VK_IMAGE_USAGE_STORAGE_BIT`, format支持Optimal tiling（swapchain的image必须支持这个），才能给swapchain加上`VK_IMAGE_USAGE_STORAGE_BIT`
* 注意debug callback的声明还带了calling convention：`VKAPI_ATTR VkBool32 VKAPI_CALL vulkanDebugCallback`，On Windows, Vulkan commands use the stdcall convention；这边没展示`VK_EXT_debug_utils`，可以给vulkan的object加名字或者tag

### Using Vulkan command buffers

* **Vulkan command buffers are used to record Vulkan commands which can be then submitted to a device queue for execution**. Command buffers are allocated from pools which allow the Vulkan implementation to amortize the cost of resource creation across multiple command buffers. Command pools are be externally synchronized which means one command pool should not be used between multiple threads.

* 提了一嘴第一版的书在每帧结束会调用一个`vkDeviceWaitIdle`，所以比较粗暴，这一版更新了。

* 对于command buffer相关的聚合：

    ```cpp
    struct CommandBufferWrapper {
        VkCommandBuffer cmdBuf_ = VK_NULL_HANDLE;
        VkCommandBuffer cmdBufAllocated_ = VK_NULL_HANDLE;
        SubmitHandle handle_ = {}; // index for submitted buffer and integer ID for submission
        VkFence fence_ = VK_NULL_HANDLE; // GPU-CPU sync
        VkSemaphore semaphore_ = VK_NULL_HANDLE; // GPU-GPU sync
        bool isEncoding_ = false; // prevent the reuse of a command buffer that has already been acquired but has not yet been submitted
    };
    ```

* `acquire`用来获取下一个可用的command buffer，kMaxCommandBuffers = 64，用完了就要等空闲的command buffer；`acquire`最后会直接调用`vkBeginCommandBuffer`开始录制。

* `purge`用来回收command buffer，传个0给`vkWaitForFences`看下fence当前的状态决定要不要reset command buffer

* `VulkanImmediateCommands::submit`上来直接结束录制command buffer，然后开始处理semaphore的逻辑：`waitSemaphore`里的semaphore可以来自一个swapchain里的acquire semaphore或者任何用户传过来的，加上一个`lastSubmitSemaphore_`，用来保证所有的command buffer都是一个个处理的；`signalSemaphores`有两个，第一个是跟着command buffer一起的用来保证执行顺序的，第二个是在帧结束和swapchain的presentation同步用的。注意`waitSemaphore_`和`signalSemaphore_`是一次性的，被用完需要清空；`submitCounter_`用来当作id记录，有wrap行为，需要跳过0

* `isReady`有点像更高层意义上的timeout为0的`vkWaitForFences`，看到这里理解了`SubmitHandle`的作用，同时记录了buffer的index和submit的index，可以用来判断这个command buffer是不是已经执行完了，最后才走`vkWaitForFences`。

* The three methods provide GPU-GPU and GPU-CPU synchronization mechanisms. 

  * The `waitSemaphore()` method ensures the current command buffer waits on a given semaphore before execution. A common use case is using an “acquire semaphore” from our VulkanSwapchain object, which signals a semaphore when acquiring a swapchain image, ensuring the command buffer waits for it before starting to render into the swapchain image. 
  * The `signalSemaphore()` method signals a corresponding Vulkan timeline semaphore when the current command buffer finishes execution. 
  * The `acquireLastSubmitSemaphore()` method retrieves the semaphore signaled when the last submitted command buffer completes. This semaphore can be used by the swapchain before presentation to ensure that rendering into the image is complete.

* `VulkanContext::submit`还有present swapchain的功能，这里要去操作timeline semaphore：There is a uint64_t frame counter VulkanSwapchain::currentFrameIndex_, which increments monotonically with each presented frame. We have a specific number of frames in the swapchain—let’s say 3 for example. Then, we can calculate different timeline signal values for each swapchain image so that we wait on these values every 3 frames. We wait for these corresponding timeline values when we want to acquire the same swapchain image the next time, before calling vkAcquireNextImageKHR(). For example, we render frame 0, and the next time we want to acquire it, we wait until the signal semaphore value reaches at least 3. 在`submit`的最后，去`acquireLastSubmitSemaphore`拿到semaphore让swapchain去等。present正好还处理defer的task，竟然是个`std::packaged_task`，跟`SubmitHandle`一起的，处理一些vulkan资源

* `VulkanSwapchain::getCurrentTexture`，先wait on the timeline semaphore using the specific signal value for the current swapchain image；the pattern here is that for rendering frame N, we wait for the signal value N. After submitting GPU work, we signal the value N+numSwapchainImages.

* 主要难点在于semaphore的同步。最后推荐了去看《Vulkan Cookbook》来了解细节，这边都是讲的上层如何抽象了（这种东西看一回忘一回

### Initializing Vulkan shader modules

这一小节讲如何load shader：

```c++
// 把 std::unique_ptr 当 const std::unique_ptr& 传总感觉怪怪的
lvk::Holder<lvk::ShaderModuleHandle> vert = loadShaderModule(ctx, "Chapter02/02_HelloTriangle/src/main.vert");
// ...
```

* `ShaderModuleDesc`设计上兼容传入string或者SPRIV的blob，如果`dataSize`为0则`data`是null terminated string，不为0则是一个SPRIV的binary；`VkShaderModule`会被存在一个pool里
* SPIRV-Reflect被用来从SPIRV里面获得push constants的大小；`createShaderModuleFromGLSL`最后就是调用读取SPIRV的代码，在之前会给glsl插入一些开启extension和给bindless的帮助函数。

### Initializing Vulkan pipelines

```c++
lvk::Holder<lvk::RenderPipelineHandle> rpTriangle = ctx->createRenderPipeline({
    .smVert = vert,
    .smFrag = frag,
    .color  = { { .format = ctx->getSwapchainFormat() } },
});

while (!glfwWindowShouldClose(window)) {
  // ...
  lvk::ICommandBuffer& buf = ctx->acquireCommandBuffer();

  buf.cmdBeginRendering(
      { .color = { { .loadOp = lvk::LoadOp_Clear, .clearColor = { 1.0f, 1.0f, 1.0f, 1.0f } } } },
      { .color = { { .texture = ctx->getCurrentSwapchainTexture() } } });
  buf.cmdBindRenderPipeline(rpTriangle);
  buf.cmdPushDebugGroupLabel("Render Triangle", 0xff0000ff);
  buf.cmdDraw(3);
  buf.cmdPopDebugGroupLabel();
  buf.cmdEndRendering();

  ctx->submit(buf, ctx->getCurrentSwapchainTexture());
```

* A Vulkan pipeline is an implementation of an abstract graphics pipeline, which is a sequence of operations that transform vertices and rasterize the resulting image. Essentially, **it’s like a single snapshot of a “frozen” OpenGL state**. Vulkan pipelines are mostly immutable, meaning multiple Vulkan pipelines should be created to allow different data paths through the graphics pipeline. 
* **LightweightVK uses opaque handles to work with resources**, so `lvk::RenderPipelineHandle` is an opaque handle that manages a collection of VkPipeline objects, and `lvk::Holder` is a RAII wrapper that automatically disposes of handles when they go out of scope. **详见Chap3 Storing Vulkan Objects**
  * `Handle`这个类型很有意思，模板参数只是用来让Handle变成强类型防止不同资源种类的Handle互相赋值的，注释说了`specialized with dummy structs for type safety`
  * 整个idea来自：[Modern Mobile Rendering @ HypeHype](https://enginearchitecture.realtimerendering.com/downloads/reac2023_modern_mobile_rendering_at_hypehype.pdf)，Handle里面有实际的index和generation counter，实际的数据在Pool里
* `RenderPipelineDesc`用来描述rendering pipeline，主要包括各个阶段的shader以及enrey point等等，还有Specialization constants，以及其他各种各样的rendering state
* 除了一些cache的vertex input bindings and attributes数据以外，每个`RenderPipelineState`有一个`VkPipelineLayout`和`VkPipeline`，specialization constants的内存也在这里管理，会自动处理好descriptor set layouts；`createRenderPipeline`里会把`RenderPipelineState`拷贝到`RenderPipelineState`里面，然后再特意把specialization constants的数据也memcpy出来，这样caller那边就可以传一个`RenderPipelineState`过来然后不用管生命周期了，大部分都是值类型的没关系，只有specialization constants因为用了指针所以需要特殊处理下
* `getVkPipeline`超长函数：
  * 先检查缓存下来的descriptor set layout是不是变了，会变是因为用了Vulkan descriptor indexing来管理所有的贴图，可能贴图多了会导致新创建descriptor set layout，`deferredTask`前文提过，用来清理资源
  * 后面在只给active的color attachments准备color blend attachments => 拿shader => 准备vertex input state => 准备`VkSpecializationInfo` => 创建`VkPipelineLayout`，准备push consants => 走`VulkanPipelineBuilder`创建`VkPipeline`
  * Here one descriptor set layout `vkDSL_` is duplicated multiple times to create a pipeline layout. This is necessary to **ensure compatibility with MoltenVK which does not allow aliasing of different descriptor types**.
  * `VulkanPipelineBuilder`是Builder pattern，帮忙设置好了一大堆默认值，传入shader等各种参数，最后调用`build`即可；`build`里面先会处理好dynamic state相关，然后填填东西，终于创建出来了`vkCreateGraphicsPipelines`
* 其他：
  * `cmdBeginRendering`是vulkan1.3的dynamic rendering的封装，这里只是简单提了下需要传入`lvk::RenderPass`和`lvk::Framebuffer`。
  * `cmdPushDebugGroupLabel`增强debug能力，renderdoc里可以看到：[How do I annotate a capture? — RenderDoc documentation](https://renderdoc.org/docs/how/how_annotate_capture.html)
  * 这里用的shader很简单，直接硬写的值，所以不需要传入啥
* 最后简单说了下GLM那个demo，演示了下push constant的用法，同样的shader既画cube又画wireframe
* 最后提了下怎么兼容旧的vulkan，在`RenderPipelineDynamicState`里面加个id，可以去索引到存在`VulkanContext`里的对应的render pass；代码可以看[igl/src/igl/vulkan/RenderPipelineState.h at main · facebook/igl](https://github.com/facebook/igl/blob/main/src/igl/vulkan/RenderPipelineState.h)。

## Chap3 Working with Vulkan Objects

第二章看的太累了，第三章要开始有趣起来了。

### Dealing with buffers in Vulkan

More specifically, a Vulkan buffer refers to a `VkBuffer` object that is associated with memory regions allocated through `VkDeviceMemory`. 这小节主要是讲用assimp导入模型和VMA。

导入相关的代码就很平铺直叙，没啥可说的；后面绘制模型的部分也是，mvp矩阵是靠push constants机制直接传值，vulkan1.3保证至少有128byte的push constant大小（我自己的3060Ti上是256bytes）；另外画wireframe的时候设置了下depth bias防止明显的flickering。

* buffer三种storage类型： `StorageType_Device`对应GPU的local memory, `StorageType_HostVisible`对应CPU可以读写并且coherent的memory, `StorageType_Memoryless`对应不用来当storage的memory

* 创建buffer的时候要考虑是不是使用staging buffer去把数据拷贝到device-local buffer上；为了用vulkan1.2的buffer device address需要开启`VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT`（**这里代码上有的地方用了这个有的用了_KHR后缀的**）

* `VulkanBuffer`又是一个聚合，所有host visible的buffer都自动map过，直接用cpp的指针更新其内容即可；如果不是coherent的要记得调用`flushMappedMemory`让GPU可以看到CPU更新过的内存，`invalidateMappedMemory`则是反过来的，让GPU写的内存可以被CPU看到，对mobile尤其重要

* 创建buffer的时候也有根据是否使用了VMA的分支代码，不用VMA就是直接使用vulkan；创建的最后会根据flag来判断是否要调用`vmaMapMemory`或者`vkMapMemory`来map地址

* `VulkanContext::destroy(BufferHandle handle)`则要注意生命周期，不能在GPU还在使用buffer的时候就释放buffer，所以把相关过程丢到`deferredTask`里去了，等所有提交过的command buffer都执行完再释放

### Implementing staging buffers

* `VulkanContext::upload`方法，如果`buffer.isMapped()`那就走非staging的流程，不然就调用`stagingDevice_->bufferSubData`

* `VulkanStagingDevice`提供了处理device-local的buffer和image相关的函数，`MemoryRegionDesc`用来表示会用到的staging buffer的一块，除了size和offset以外还包括了用来上传的SubmitHandle；默认的`minBufferSize_`可以放下一个RGBA 2k贴图

* `getAlignedSize`实现如此优雅：

  ```cpp
  uint32_t getAlignedSize(uint32_t value, uint32_t alignment) {
    return (value + alignment - 1) & ~(alignment - 1);
  }
  ```

* `getNextFreeOffset`会先去找之前分配的有没有能复用的，找到的话就用上，把原来服用的那个从deque去掉，把新的空闲块加进deque；如果找不到够大的，只能先用cache到的最大的，然后分块上传buffer了；如果还是不行，只能调用`waitAndReset`等待整个staging buffer空闲

* `bufferSubData`主要就是处理当前buffer太大需要多次上传的情况；拿到可以用staging buffer块就把数据拷贝进去，然后走`VulkanImmediateCommands`拿到command buffer来把数据再拷贝到实际要用的buffer那儿；这里还要记得设置pipeline barrier

* buffer讲完讲了下`imageData2D`，可以一次性上传一个image的多层layer，包括多个mipmap层级，计算方法好像有点问题，提了[Issue #26](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/26)；这里和buffer不一样，如果拿到的staging不够大就等，而不是和buffer一样可以while循环慢慢拷贝；后面又是Memory barrier，image layout转到`TRANSFER_DST_OPTIMAL`，拷贝完再转到`SHADER_READ_ONLY_OPTIMAL`; 这个库出于简单，只跟踪整个VkImage的layout信息，其实可以更细化一些，但是也没必要。

* The Vulkan image layout is a property of each image subresource that defines how the data in memory is organized in a manner that is opaque to the user and specific to the Vulkan drivers. Correctly specifying the layout for various use cases is crucial; failing to do so can lead to undefined behavior, such as distorted images.

* 这里大量使用了[ldrutils/lutils/ScopeExit.h at master · corporateshark/ldrutils](https://github.com/corporateshark/ldrutils/blob/master/lutils/ScopeExit.h)来延迟一些行为，像是go的`defer`

* 最后提了一句ReBar，推荐了[Vulkan Memory Types on PC and How to Use Them](https://asawicki.info/news_1740_vulkan_memory_types_on_pc_and_how_to_use_them)

### Using texture data in Vulkan

A Vulkan image is a type of object backed by memory, designed to store 1D, 2D, or 3D images, or arrays of these images.

Demo展示了下基于bindless的渲染，Bindless rendering is a technique that enables more efficient GPU resource management by eliminating the need to explicitly bind resources like textures, buffers, or samplers. 提了一嘴`kTextures2D[]`和`kSamplers[]`的0号元素都是dummy, prevent sparse arrays in GLSL shaders and ensure that all shaders can safely sample non-existing textures.

* `TextureDesc`的介绍，`createTexture`的debugName可以覆盖`TextureDesc`自己的debugName，`dataNumMipLevels`指定了想要upload的mimap的数量，`generateMipmaps`则代表需要强制生成mipmap

* `createTexture`上来先把LightweightVK的图片格式转到vulkan的图片格式，depth format那边找最近的，color format则11对应；冗长的错误处理之后，开始加flag，`VK_IMAGE_USAGE_TRANSFER_DST_BIT`之类，为了方便给除了Memoryless的image都加上了从GPU回读的flag：`VK_IMAGE_USAGE_TRANSFER_SRC_BIT`；设置一些友好的debugName；提了一嘴MSAA的支持，chap10会讲

* 然后创建`VulkanImage`，解释了下`getOrCreateVkImageViewForFramebuffer`，Image views used as framebuffer attachments should have only 1 mip-level and 1 layer, this function precaches such image views inside the array `imageViewForFramebuffer_[][]`，it supports a maximum of 6 layers, which is just enough for rendering to the faces of a cube map

* 然后开始填`VkImageCreateInfo`，这里也有代码处理multiplanar image；另外sharing mode都是EXCLUSIVE，因为lightweight vk本身不考虑跨多个vulkan queue；接着就是根据是否使用VMA的分支，使用VMA并且图片numPlanes为1就很简单，不然有点复杂，memory can only be bound to a VkImage once. Therefore, the code handles binding disjoint memory locations in a single call to vkBindMemory2() by chaining everything together using pNext pointers. 后面再研究（估计也不需要研究）

* 开始创建`VkImageView`，Vulkan images can have multiple aspects simultaneously, such as combined depth-stencil images, where depth and stencil bits are handled separately. Additionally, Vulkan supports image view component swizzling. An image view can control which mip-levels and layers are included. Here, we create an image view that includes all levels and layers of the image. 后续需要给framebuffer attachments创建单独的image views，只有一层layer和一个mipmap；Storage images因为不支持swizzling， 所以也单独有自己的image view.

* 创建完毕设置`awaitingCreation_`为true，指示后续去更新bindless descriptor set；`createImageView`那边没啥神秘的

* `VulkanContext::destroy(lvk::TextureHandle handle)`提了下，主要是销毁顺序和时机，也是大量使用`SCOPE_EXIT`和`deferredTask`；也考虑到了`isOwningVkImage_`相关的逻辑，如果为false则不去销毁` VkImage`和`VkDeviceMemory`，false的主要用途是，allows us to create as many non-owning copies of a VulkanImage object as we need, which is very useful when we want to create multiple custom image views of the same VkImage

### Storing Vulkan objects

详细讲之前隐约提到过的handle系统了，值类型的handle确实好，作为64位的整数可以随便到处传，也不用付出shared_ptr那样atomic的开销。idea来自：[AaltonenHypeHypeAdvances2023.pdf](https://advances.realtimerendering.com/s2023/AaltonenHypeHypeAdvances2023.pdf) 

```cpp
template<typename ObjectType>
class Handle final {
 public:
  Handle() = default;
  bool empty() const { return gen_ == 0;}
  bool valid() const { return gen_ != 0;}
  uint32_t index() const { return index_;}
  uint32_t gen() const { return gen_; }
  void* indexAsVoid() const { 
      return reinterpret_cast<void*>(static_cast<ptrdiff_t>(index_));
  }
  bool operator==(const Handle<ObjectType>& other) const {...}
  bool operator!=(const Handle<ObjectType>& other) const {...}
  explicit operator bool() const { return gen_ != 0; }

 private:
  Handle(uint32_t index, uint32_t gen) : index_(index), gen_(gen){};
  template<typename ObjectType_, typename ImplObjectType>
  friend class Pool;

  uint32_t index_ = 0;
  uint32_t gen_ = 0;
};

static_assert(sizeof(Handle<class Foo>) == sizeof(uint64_t));
```

* handle只能被friend class pool去构造，Pool的声明中的类型不定义没关系，这里只是声明一下是友元
* `indexAsVoid`是把数据传给第三方库用的，比如imgui
* 还补了一个assert来保证是8byte，猜测是防止意外塞入虚函数或者奇怪的对齐规则
* 前文提过Handle<> template还被加了tag，防止不同类型的handle可以互相赋值

Handles do not own objects they point to. Only the Holder<> class does. 我个人理解，**Handle就是个POD类型，Holder是基于之上的RAII类型**，有点像是std::unique_ptr，只能move

```c++
~Holder() {
  lvk::destroy(ctx_, handle_);
}
Holder& operator=(std::nullptr_t) { reset(); return *this; }
```

现在还看不到IContext的声明，所以先前向声明`lvk::destory`将就用

**Pool: stores a collection of objects of type ImplObjectType inside std::vector and can manage handles to these objects.** The LightweightVK implementation in VulkanContext uses them to store all implementation-specific objects that are accessible by handles from the interface side.

vector里存了PoolEntry，带着generation信息，以及freelist要用的字段。Note里提了可以做冷热分离啥的，为了简单起见略过了。这里create和PoolEntry都只接受R-value reference. 

```c++
struct PoolEntry {
  explicit PoolEntry(ImplObjectType& obj) : obj_(std::move(obj)) {}
  ImplObjectType obj_ = {};
  uint32_t gen_ = 1;
  uint32_t nextFree_ = kListEndSentinel;
};
```

### Using Vulkan descriptor indexing

好东西！This feature allows applications to place all their resources into one large descriptor set and make it available to all shaders. There’s no need to manage descriptor pools or construct per-shader descriptor sets. The Vulkan descriptor indexing feature enables descriptor sets to be updated after they have been bound.

`VulkanContext`里就有descriptor set相关的字段，同时`lastSubmitHandle_`其实就是最近用这个descriptor set的提交。

* `growDescriptorPool`，先检查`maxTextures`和`maxSamplers`是不是超过了硬件支持的大小，然后destory旧的descriptor set，再创建新的descriptor set layout给所有pipeline共用，记加上`CREATE_UPDATE_AFTER_BIND_BIT`，最后创建`vkDSet_`
* `checkAndUpdateDescriptorSets`用来更新descriptor set，先检查`awaitingCreation_`，然后开始填`VkDescriptorImageInfo`，提了一嘴Multisampled images can only be accessed from shaders using texelFetch(), which is not supported by LightweightVK. 最后因为要更新整个descriptor set，要注意等一下上次的submithandle，保证vulkan没有在用。

shader里面插入的bindless descriptor set大概这样：

```glsl
layout(set = 0, binding = 0) uniform texture2D kTextures2D[];
layout(set = 1, binding = 0) uniform texture3D kTextures3D[];
layout(set = 2, binding = 0) uniform textureCube kTexturesCube[];
layout(set = 3, binding = 0) uniform texture2D kTextures2DShadow[];
layout(set = 0, binding = 1) uniform sampler kSamplers[];
layout(set = 1, binding = 1) uniform samplerShadow kSamplersShadow[];

vec4 textureBindless2D(uint textureid, uint samplerid, vec2 uv) {
  return texture(nonuniformEXT(sampler2D(
    kTextures2D[textureid], kSamplers[samplerid])), uv);
}
```

虽然set的id看着不同，但是其实是同一个，为了兼容MoltenVK才写成这样。

nonuniformEXT见：[GLSL/extensions/ext/GL_EXT_nonuniform_qualifier.txt at main · KhronosGroup/GLSL](https://github.com/KhronosGroup/GLSL/blob/main/extensions/ext/GL_EXT_nonuniform_qualifier.txt)  不加会有问题，这是non-uniform acess

最后提了两个优化点：1，可以use a couple of round-robin descriptor sets and switch between them, eliminating the need for the heavy wait() function call before writing descriptor sets；2，perform incremental updates of descriptor sets，可以看下`VK_DESCRIPTOR_BINDING_UPDATE_UNUSED_WHILE_PENDING_BIT`

## Adding User Interaction and Productivity Tools

比较轻松的一章，加点外围的基础设置。

### Rendering ImGui user interfaces

抽象也比较干净：

```c++
std::unique_ptr<lvk::ImGuiRenderer> imgui = std::make_unique<lvk::ImGuiRenderer>(*ctx, "data/OpenSans-Light.ttf", 30.0f);
// inside render loop
imgui->beginFrame(framebuffer);
ImGui::Begin("Texture Viewer", nullptr, ImGuiWindowFlags_AlwaysAutoResize); 
ImGui::Image(texture.index(), ImVec2(512, 512)); // pass index be used with the bindless rendering
ImGui::ShowDemoWindow();
ImGui::End();
imgui->endFrame(buf);
```

简单讲了下`ImGuiRenderer`这个类，就是一些imgui渲染需要的东西，有个3个`DrawableData`，To ensure stall-free operation, LightweightVK uses multiple buffers to pass ImGui vertex and index data into Vulkan.

 imgui用的shader是写在HelpersImGui.cpp里的：

```glsl
struct Vertex {
  float x, y;  float u, v;  uint rgba;
};

layout(std430, buffer_reference) readonly buffer VertexBuffer {
  Vertex vertices[];
};

layout(push_constant) uniform PushConstants {
  vec4 LRTB;
  VertexBuffer vb;
  uint textureId;  
  uint samplerId;
} pc;
```

The buffer_reference GLSL layout qualifier declares a type and not an instance of a buffer, 这里依赖`GL_EXT_buffer_reference`，把gpu buffer address用push constant传进来，LTRB指的是2d viewport orthographic projection的一些参数，用来在vertex shader拼projection矩阵，颜色用`unpackUnorm4x8`解回vec4

* `createNewPipelineState`比较简单，注意一下sRBG的模式作为specialization constant传给shader；`updateFont`则是处理字体贴图相关的逻辑；构造函数里就是正常的初始化，加了`ImGuiBackendFlags_RendererHasVtxOffset`来提升性能
* `beginFrame`里创建vulkan pipeline；`endFrame`逻辑比较多，实际录制需要的command；按需创建新的vb和ib，注意vb因为shader里用了programmable vertex pulling所以类型是`BufferUsageBits_Storage`，buffer上传的时候因为buffer都是host visibie，所以直接memcpy，而且因为是vertex pulling所以也不需要给render pipeline传vertexInput；后续还有viewport clip，scissor test等等, use both the index offset and vertex offset parameters to access the correct data in our large per-frame vertex and index buffers

### Integrating Tracy & Using Tracy GPU profiling

讲讲tracy的集成，一些cmake和宏定义，`LVK_PROFILER_FRAME`会在`lvk::VulkanSwapchain::present()`被调用，标志一帧的结束。demo跑起来有点问题，提了[Issue #29](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/29)

GPU profiling更有趣一些，初始化那边比较全面，考虑了各种fallback，checks the available Vulkan time domains and enables different Tracy GPU profiling features based on their availability.

cpp小trick，这里用lambda的好处是可以让`hasHostQuery`变成const:

```cpp
const bool hasHostQuery = vkFeatures12_.hostQueryReset && [&timeDomains]() -> bool {
   for (VkTimeDomainEXT domain : timeDomains)
   if (domain == VK_TIME_DOMAIN_CLOCK_MONOTONIC_RAW_EXT || domain == VK_TIME_DOMAIN_QUERY_PERFORMANCE_COUNTER_EXT)
      return true;
   return false;
}();
```

如果设备支持host querying，就只初始化`tracyVkCtx_`即可，不需要额外的command buffer，不然就也要自己创建，然后根据设备是不是支持 calibrated timestamp（`VK_EXT_calibrated_timestamps`）分别初始化。代码就按宏`LVK_WITH_TRACY_GPU`看就行了，比较直接。

FPS那节太无聊了略过。

### Using cube map textures in Vulkan

A useful property of cube maps is that they can be sampled using a direction vector. We can store the diffuse part of the physically based lighting equation in an **irradiance cube map**.

Cube maps are often stored as **equirectangular projections**. The equirectangular projection is such a projection that maps longitude and latitude (vertical and horizontal lines) to straight, even lines, making it a very easy and popular way to store light probe images.

先介绍了`Bitmap`类，可以用来封装8bit或者float类型的bitmap。`comp_`代表number of components per pixel，用了函数指针来抽象不同数据类型的bitmap的操作。

讲了下从equirectangular到cube map的转换，正确的方法是按cube map的像素去采样equirectangular图（bilinear interpolation），而不是反过来，反过来会有摩尔纹。

`faceCoordsToXYZ`用来把cube map上表面像素坐标转化为方向向量（立方体表面上的一点）

`convertEquirectangularMapToVerticalCross`把一个 equirectangular 转换为一个 vertical cross 格式的cube map，`kFaceOffsets`代表每个面在数据中的偏移位置，后面把从`faceCoordsToXYZ`拿到的方向向量转到[球面坐标](https://en.wikipedia.org/wiki/Spherical_coordinate_system)，然后再映射到equirectangular内的坐标，做双线性插值得到颜色。

`convertVerticalCrossToCubeMapFaces`则最后转成tightly packed rectangular cube map faces, the resulting cube map contains an array of six 2D images. 这俩函数不合成一个我猜是因为可以把vertical cross的保存下来debug用。

最后讲demo的代码，读取hdr文件用的是`stbi_loadf`，就是正常上传，`cerateTexture`内部处理好了相关逻辑。

skybox的shader我看了下，就是构造了一个单位立方体，vertex里算的时候：`gl_Position = pc.proj * mat4(mat3(pc.view)) * vec4(1.0 * pos[idx], 1.0)`把view矩阵的平移部分去掉了，因为skybox本来也不会移动，后面算了下direction传给frag，frag就是采样一下。

渲染小黄鸭的shader也不复杂，注意vertexshader里变换法线：`mat3 normalMatrix = transpose( inverse(mat3(pc.model)) )`，其他都没啥，正常的shader。

### Working with a 3D camera & Adding camera animations and motion

`CameraPositioner_FirstPerson`讲了下怎么实现第一人称相机，主要是鼠标、键盘交互以及四元数旋转的一些操作，比如从鼠标的屏幕空间移动算出相机本身应该旋转多少，从view矩阵（四元数）得到forward、right、up，怎么得到view等。demo的代码和cube map那一章一样，只是view和cameraPos从写死的变成了外面传入的。

`CameraPositioner_MoveTo`则是一个可以被imgui控制坐标和朝向的相机，基本原理也差不多，这次不用四元数了直接存欧拉角（imgui控件上调整的是欧拉角）。注意移动到目标位置还带上damping效果，欧拉角要记得clip一下，防止旋转时候不走最短路径，以及防止角度无限增长。

### Implementing an immediate-mode 3D drawing canvas & Rendering on-screen graphs

讲`LineCanvas3D`的一节，The LineCanvas3D class has its internal 3D line representation as a pair of vertices for each and every line, whereas each vertex consists of a vec4 position and a color. 除了线还有plane、box、视锥frustum这样的primitives. 

* plane是n * n的那种网格，box需要传入model matrix。视锥更复杂一些，先定义好8个corner点（NDC空间下），然后用提供的view-projection矩阵的逆矩阵转换一下，转到视锥的形状，然后划线。
* `render`函数就是很正常的感觉，也是programmable vertex pulling，用push constant把mvp矩阵和gpu buffer地址传进去

后一节讲了下`LineCanvas2D`，就简单很多，`render`函数纯粹依赖于imgui的基础设施，先画个full-screen ImGui window with all decorations removed and user input disabled，然后直接往drawlist里塞line

`LinearGraph`则是基于ImPlot画图用的，可以用来画FPS图。`renderGraph`里面要先确定极值，这样可以normalize一下图表，然后imgui画个window，在里面ImPlot画图。

### Putting it all together into a Vulkan application

主要是VulkanApp的抽象，VulkanApp.h header provides a wrapper for LightweightVK context creation and GLFW window lifetime management. 还自带了个first-person camera, context可以从VulkanApp要。

Run the main loop using a lambda provided by the `VulkanApp::run()` method.

## Chap5 Working with Geometry Data

要开始进入复杂一些的话题了。

### Generating level-of-detail meshes using MeshOptimizer & Implementing programmable vertex pulling

MeshOptimizer provides algorithms to help optimize meshes for modern GPU vertex and index processing pipelines. It can reindex an existing index buffer or generate an entirely new set of indices from an unindexed vertex buffer. 按顺序：

* 用`meshopt_generateVertexRemap`生成remap table
* `meshopt_remapIndexBuffer`和`meshopt_remapVertexBuffer`一套组合拳
* 用`meshopt_optimizeVertexCache`来优化（讨论见[Shaded vertex reuse on modern GPUs – Interplay of Light](https://interplayoflight.wordpress.com/2021/11/14/shaded-vertex-reuse-on-modern-gpus/)）文档上说是Reorders indices to reduce the number of GPU vertex shader invocations，应该是最大化 GPU 的 Post-Transform Vertex Cache 命中率
* 用`meshopt_optimizeOverdraw`来优化overdraw（理论上需要view-dependent的算法，没看过具体实现原理），Reorders indices to reduce the number of GPU vertex shader invocations and the pixel overdraw
* 用`meshopt_optimizeVertexFetch`来优化vertex fetch的效率，Reorders vertices and changes indices to reduce the amount of GPU memory fetches during vertex processing，主要是优化vertex buffer的局部性
* 最后用`meshopt_simplify`生成不同lod的顶点数据，generate a new index buffer that uses existing vertices from the vertex buffer with a reduced number of triangles.

demo的渲染很简单，就是生成俩index buffer，一个给mesh，然后画

**programmable vertex pulling (PVP)**: By combining multiple meshes into a single buffer and rendering them with a single draw call, developers could avoid rebinding vertex arrays or buffer objects, significantly improving draw call batching. This technique enables merge-instancing, where multiple small meshes are combined into a larger one to be processed as part of the same batch. 具体性能考虑可以参考 [nlguillemot/ProgrammablePulling: Programmable pulling experiments (based on OpenGL Insights "Programmable Vertex Pulling" article by Daniel Rakos)](https://github.com/nlguillemot/ProgrammablePulling)

PVP的demo也很简单，之前已经大概提过这个了，主要是vertex buffer的usage flag要设成`BufferUsageBits_Storage`而不是`BufferUsageBits_Vertex`，然后push constants把buffer地址传进去。

注意这一章wireframe换了个画法，从原来走push constant，换成了用geometry shader算下每个像素的barycoords，根据这个来显示三角形边缘。

### Rendering instanced geometry & with compute shaders

用`gl_InstanceIndex` ，can be used to fetch material properties, transformations, and other data directly  from buffers.

Demo是渲染100万个旋转方块，每个都有自己的位置、旋转角度。CPU这边初始化了100万个方块的vec3 positions and float initial rotation angles，也就是100万个vec4进 immutable storage buffer。其他就是`cmdDraw`除了传顶点数量，再传个instance数量。

vertex shader里定义了index数组和vertex数组，还因为要在shader里自己做矩阵运算，定义了translate和rotate，对应到glm::的相关函数。注意这里用uvec2来代表uint64的数据类型：

```glsl
layout(push_constant) uniform PerFrameData {
	mat4 viewproj;
	uint textureId;
	uvec2 bufId;
	float time;
};
layout(std430, buffer_reference) readonly buffer Positions {
  vec4 pos[]; // pos, initialAngle
};
// inside main():
vec4 center = Positions(bufId).pos[gl_InstanceIndex];
```

文档见：[Buffer device address :: Vulkan Documentation Project](https://docs.vulkan.org/samples/latest/samples/extensions/buffer_device_address/README.html)  之前imgui的demo是直接把VertexBuffer放进 push constant。

vertex shader其他部分就是继续拼cube，算出frag shader要用的东西。

后一个demo是把矩阵计算给compute shader去做，矩阵的buffer有两个，在奇数偶数帧会轮换着使用，避免不必要的同步。注意push constant因为是per VkPipelineLayout，所以compute和graphics都要push一次（这里是共享一样的结构，所以推的同一份数据）。

`cmdDispatchThreadGroups`来dispatch compute shader，每个local workgroup设置为处理32个mesh。`cmdBeginRendering`里传了compute shader的buffer作为dependency，会自动去设置barrier。

### Implementing an infinite grid GLSL shader & tessellationpipeline

灵感来源于：[Borderland between Rendering and Editor - Part 1 · Our Machinery](https://ruby0x1.github.io/machinery_blog_archive/post/borderland-between-rendering-and-editor-part-1/index.html)，最后也推荐了 [The Best Darn Grid Shader (Yet)](https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8)

讲了讲实现，主要是shader部分。Our grid implementation will adjust the number of rendered lines based on the grid LOD. We will switch the LOD when the number of pixels between two adjacent grid cell lines drops below a certain threshold, which is calculated in the fragment shader. 

vertex shader里比较简单，就是变换一下坐标，the -1 to +1 points are scaled by the desired grid size. The resulting vertex position is then translated by the 2D camera position in the horizontal plane and, finally, by the 3D origin position.

fragment shader更为复杂，calculates a programmatic texture that resembles a grid. The grid lines are rendered based on how quickly the UV coordinates change in screen space to avoid the Moiré pattern.

不继续研究了，就记一下有这个东西。



讲tessellation的，Hardware tessellation consists of two new shader stages in the graphics pipeline. The first stage is called the **tessellation control shader** (TCS), and the second is the **tessellation evaluation shader** (TES). Note里说了they may not be
as efficient as using mesh shaders on modern GPUs，哈哈...

不继续研究了，记一下推荐的 [OpenGL 4 Tessellation With Displacement Mapping | Geeks3D](https://www.geeks3d.com/20100804/test-opengl-4-tessellation-with-displacement-mapping/) 以及GPU gems2的Chapter 7. Adaptive Tessellation of Subdivision Surfaces with Displacement Mapping

### Organizing mesh data storage

这章认真看！Let’s define a **LOD** as an index buffer of reduced size that uses existing vertices and hence can be used directly for rendering with the original vertex buffer. We define a **mesh** as a collection of all vertex data streams and a collection of all index buffers, one for each LOD. 

目前为了简单，都用32bit的offset和index；所有数据都塞到一个blob里，就可以直接一个fread或者mmap把所有数据加载进来。这一节主要是专注于几何数据的处理。Mesh的结构基于offset来做：

```cpp
// All offsets are relative to the beginning of the data block (excluding headers with a Mesh list)
struct Mesh final {
  uint32_t lodCount = 1;    // Number of LODs in this mesh.
  uint32_t indexOffset = 0;   // The total count of all previous vertices in this mesh file
  uint32_t vertexOffset = 0;
  uint32_t vertexCount = 0;   // Vertex count (for all LODs)
  // Offsets to LOD indices data. The last offset is used as a marker to calculate the size
  uint32_t lodOffset[kMaxLODs + 1] = { 0 };
  uint32_t materialID = 0;
  inline uint32_t getLODIndicesCount(uint32_t lod) const { return lod < lodCount ? lodOffset[lod + 1] - lodOffset[lod] : 0; }
};
```

每个lod的index buffer不会单独存，都是从offset算出来的，`lodOffset`多存一个方便算最后一个LOD的size，见`getLODIndicesCount`。 MeshData就很直接：

```cpp
struct MeshData {
  lvk::VertexInput streams = {};
  std::vector<uint32_t> indexData;
  std::vector<uint8_t> vertexData;
  std::vector<Mesh> meshes;
  std::vector<BoundingBox> boxes;
  std::vector<Material> materials;
  std::vector<std::string> textureFiles;
  // ...
};
```

`VertexInput`就是vertex stream的格式，里面记录了`VkVertexInputAttributeDescription`和`VkVertexInputBindingDescription`要用的数据。注意这里其实没区分vertex数据要不要interleave，代码上是都支持的，实际上需要profile了再看哪个好。

读取代码就很直截了当，有个练习是可以把index buffer和vertex buffer也合成一个。最后提了下这个适合存static mesh，如果有比如reload、异步加载等等的需求，最好还是分开存放。也提了一些后续篇章会处理的问题，是不是要把material也存进去，更进一步，texture是不是也要存进去等等。

### Implementing automatic geometry conversion & Indirect rendering in Vulkan

吐槽了下第一版的书把mesh转换工具做成单独的，结果很多读者直接跑demo没跑转换工具，发现有问题，这一版做成了和demo一起，按需转mesh。

Demo里有个`convertAIMesh`的函数，把assimp的mesh转化为上一节介绍的格式。position存储格式是vec3，uv是half的vec2（感觉16 bit unorm UVs更好）用`packHalf2x16`打包，normal用`packSnorm3x10_1x2`打包成2_10_10_10_REV。用`put`函数往vector里写：

```cpp
template <typename T> inline void put(std::vector<uint8_t>& v, const T& value)
{
  const size_t pos = v.size();
  v.resize(v.size() + sizeof(value));
  memcpy(v.data() + pos, &value, sizeof(value));
}
```

`loadMeshFile`比较简单，给`aiImportFile`加了一大堆flag之后加载mesh，然后初始化meshData，调用`convertAIMesh`，最后算下AABB。`saveMeshData`就更直接了。



Indirect rendering is the process of issuing drawing commands to the graphics API, where most of the parameters to those commands come from GPU buffers. We create a GPU buffer and fill it with an array of `VkDrawIndirectCommand` structures, then fill these structures with appropriate offsets into our index and vertex data buffers, and finally emit a single `vkCmdDrawIndirect()` call.

讲了一下`VkMesh`这个类，构造函数是大头，正常地准备一些mesh用的index和vertex buffer之后，开始准备indirect buffer，注意这里的std::launder怪怪的，感觉似乎没必要：

```cpp
std::vector<uint8_t> drawCommands;
drawCommands.resize(sizeof(DrawIndexedIndirectCommand) * numCommands + sizeof(uint32_t));
// store the number of draw commands in the very beginning of the buffer
memcpy(drawCommands.data(), &numCommands, sizeof(numCommands));
DrawIndexedIndirectCommand* cmd = std::launder(reinterpret_cast<DrawIndexedIndirectCommand*>(drawCommands.data() + sizeof(uint32_t)));
```

indirect buffer最开始存draw command的数量，虽然这个demo里用不到（给以后用的，可以让GPU来算draw command的数量然后存到buffer里）。`DrawIndexedIndirectCommand`和`VkDrawIndexedIndirectCommand`基本一模一样，结构是这样：

```cpp
struct DrawIndexedIndirectCommand {
  uint32_t count;
  uint32_t instanceCount;
  uint32_t firstIndex;
  int32_t baseVertex;
  uint32_t baseInstance;
};
```

shader都相对简单，没用pvp，和之前一样的shader。

### Generating textures in Vulkan using compute shaders & Implementing computed meshes

迁移这个[Industrial Complex](https://www.shadertoy.com/view/MtdSWS)到vulkan demo里，当然首先要自己加一些输入输出：

```glsl
layout(local_size_x = 16, local_size_y = 16) in;
layout(set = 0, binding = 2, rgba8) uniform writeonly image2D kTextures2DOut[];
```

`image2D`代表了`kTextures2DOut`里面存的都是texture的pixel，给compute shader写出图像用的，image的id和当前时间就从push constant里拿。用`gl_GlobalInvocationID.xy / dim`拿到uv开始算，然后`imageStore`写回。算法上就是把`mainImage`的参数改了改，然后自己在`main`里写了个5x5的antialiasing。

C++那边，texture创建的时候要给`TextureUsageBits_Storage`，这样compute shader才能访问到；然后这个texture作为依赖传给了`cmdBeginRendering`，保证在shader里采样这个贴图之前compute shader已经跑完了，具体的函数在`transitionToShaderReadOnly`里，加pipeline barrier来转image layout。

vertex和frag shader则是基于这个[Rendering a fullscreen quad without buffers](https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/) 的一个全屏shader:

```glsl
void main() {
  uv = vec2((gl_VertexIndex << 1) & 2, gl_VertexIndex & 2);
  gl_Position = vec4(uv * 2.0 + -1.0, 0.0, 1.0);
}
```

很聪明，只需要三个顶点，也不需要设置vbo啥的。



用compute写个这个[Torus knot - Wikipedia](https://en.wikipedia.org/wiki/Torus_knot)，我不去研究具体的算法，而是看compute shader怎么去生成这样的mesh，A compute shader generates vertex data, including positions, texture coordinates, and normal vectors. This data is stored in a buffer and later utilized as a vertex buffer to render a mesh in a graphics pipeline.

index buffer是cpu端生成的，不可变；vertex buffer按一个顶点12个float来算（vec4 positions, vec4 texture coordinates, and vec4 normal vectors），这样不用考虑padding问题，注意buffer的flag，既是Vertex也是Storage；shader那边也是用specialization constant来让color和texture shader共用代码。

这里很有趣的是，在最开始compute来写vertex buffer的时候，把vertex buffer也加到自己的依赖里，用memory barrier保证上一帧已经渲染完了，生成texture的compute同理，想做什么我理解，但是底层运作机制我还要想想。

**TODO：回头重新研究下lightweightvk的那套同步**

Since only one queue is being used, the device workload fully drains at each barrier, leaving no alternative tasks to mitigate this inefficiency. 好的例子可参考: [nvpro-samples/vk_timeline_semaphore: Vulkan timeline semaphore + async compute performance sample](https://github.com/nvpro-samples/vk_timeline_semaphore).

[Synchronization Examples · KhronosGroup/Vulkan-Docs Wiki](https://github.com/KhronosGroup/Vulkan-Docs/wiki/Synchronization-Examples)

## Chap6 Physically Based Rendering Using the glTF 2.0 Shading Model

### An introduction to glTF 2.0 physically based shading model

这里我主要靠[LearnOpenGL - Theory](https://learnopengl.com/PBR/Theory) + GPT先理解了一轮，感觉自己大概明白了。

Roughly speaking, rendering a physically-based image is nothing more than running a fancy pixel shader with a set of textures. 说的真好，醍醐灌顶。

梳理基础概念，关于**Light-object interactions**：

* **specular reflection**: occurring on smooth surfaces, creates a mirror-like effect called 
* Some light penetrates the surface, where it can either be absorbed, converted into heat, or scattered in various directions. The scattered light that exits the surface again is known as **diffuse light** & **subsurface scattering**. Scatter involves photons being redirected in various directions, while diffusion involves photons spreading out evenly.
* The way materials absorb and scatter diffuse light varies for different wavelengths of light, giving objects their distinct colors. **albedo**, which represents the color defined by a mix of the fractions of various light wavelengths that scatter back out of a surface. The term diffuse color is often used interchangeably.
* For thin objects, the light can even scatter out of their back side, making them **translucent**.

**Energy conservation**: We simply **subtract reflected light before computing the diffuse shading**.

Think of a **BSDF** (Bidirectional Scattering Distribution Functions) as an equation that describes how light scatters upon encountering a surface:

* Bidirectional Reflectance Distribution Functions (BRDFs): These functions specifically describe how incident light is reflected from a surface.
* Bidirectional Transmittance Distribution Functions (BTDFs): These functions specifically describe how light is transmitted through a material.
* other types of BSDFs exist to account for more complex light interaction phenomena, such as subsurface scattering. 

**Fresnel equation**: know how much light is reflected or transmitted on the surface.

* **conductors (metals)**: Metals do not transmit light, they only reflect it entirely, or practically entirely. Unlike dielectrics, conductors do not transmit light; rather, they **absorb some of the incident light**, converting it into heat.
* **dielectrics (nonmetals)**: possess the property of **diffuse reflection** — light rays pass beneath the surface of the material and some of them are absorbed, while some are returned in the form of reflection. In the specular highlight of these materials, for dielectrics it appears white or, more accurately, retains the color of the incident light.

**Microfacets**:

* Blinn-Phong Model: computes the intensity of the reflected light based on the angle between the viewer’s direction and the halfway vector
* **Cook-Torrance Model**: This equation represents the amount of light reflected in a specific direction ωo given an incident light direction ωi and the surface properties. In microfacet theory, the NDF describes the statistical distribution of microfacet normals on a surface.

**What is a material**: Materials serve as high-level descriptions utilized to represent surfaces, defined by combinations of BRDFs and BTDFs. These BSDFs are articulated as parameters that govern the visual characteristics of the material.

The Khronos 3D Formats Working Group is continually striving to enhance PBR material capabilities by introducing new extension specifications: [glTF/extensions/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md)

参考除了PBR那本书，还有siggraph的课[neil3d/awesome-pbr](https://github.com/neil3d/awesome-pbr)，[Physically Based Rendering in Filament](https://google.github.io/filament/Filament.md.html#overview/physicallybasedrendering)

### Rendering unlit glTF 2.0 materials

[glTF/extensions/2.0/Khronos/KHR_materials_unlit at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit)

designed with the following motivation: Mobile, Photogrammetry, Stylized materials

这里代码都很简单，注意一下根据 glTF specification，如果顶点颜色没有就用默认白色替代，texture coords没有就用000替代。

### Precomputing BRDF look-up tables

How to precompute the Smith GGX BRDF look-up table (LUT). To render a PBR image, we have to evaluate the BRDF at each point on the surface being rendered, considering the surface properties and the viewing direction. The X-axis represents **the dot product between the surface normal vector and the viewing direction**, while the Y-axis represents the surface **roughness** values 0...1. Each texel holds three 16-bit floating point values. The first two values represent **the scale and bias to F0**, which is the specular reflectance at normal incidence. The third value is utilized for the sheen material extension.

讲了下为什么要与计算，**G和部分的F是只取决于v，h和Roughness的**，然后我们发现n和v永远是不会分开的，所以可以当成一个，用n*v

然后讲与计算的理论基于[Chapter 20. GPU-Based Importance Sampling | NVIDIA Developer](https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-20-gpu-based-importance-sampling)，推荐了https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf

cpp那边比较简单，就是起一个compute，算好贴图内容的buffer，wait等计算完毕，然后写回磁盘。

shader里面代码比较多：

* The R and G channels are used for GGX BRDF LUT, the third channel is used for Charlie BRDF LUT which is required for the Sheen material extension.
* `hammersley2d`基于[Points on a Hemisphere](https://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html)，关键词 van der Corput sequence
* `random`基于[Improvements to the canonical one-liner GLSL rand() for OpenGL ES 2.0 | Byte Blacksmith](https://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/)
* `importanceSample_GGX`基于Unreal的[2013SiggraphPresentationsNotes-26915738.pdf](https://cdn2-unrealengine-1251447533.file.myqcloud.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf)
* 算Sheen material的时候，`Ashikhmin`和`D_Charlie`基于filament的 https://github.com/google/filament/blob/f096c4d8de9f72e38f3ac1b0bbc176fb094994f7/shaders/src/surface_brdf.fs#L94
* `BRDF`就是根据那些helper函数算LUT的值

最后提到ue有个不用在mobile上采这个预计算的贴图的办法，来自 [Physically Based Shading on Mobile](https://www.unrealengine.com/en-US/blog/physically-based-shading-on-mobile)

```glsl
half3 EnvBRDFApprox( half3 SpecularColor, half Roughness, half NoV )
{
	const half4 c0 = { -1, -0.0275, -0.572, 0.022 };
	const half4 c1 = { 1, 0.0425, 1.04, -0.04 };
	half4 r = Roughness * c0 + c1;
	half a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	half2 AB = half2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}
```

### Precomputing irradiance maps and diffuse convolution

The second part of the split sum approximation necessary to calculate the glTF 2.0 physically-based shading model comes from the irradiance cube map which is precalculated by convolving the input environment cube map with the GGX distribution of our shading model. 这里说的有点不够清楚，应该是pre-filtered environment map，叫irradiance cube map也行但不够有指向性，irradiance map是给diffuse部分用的。

实现基于 [glTF-Sample-Renderer/source/shaders/ibl_filtering.frag at 3dc1bd9bae75f67c1414bbdaf1bdfddb89aa39d6 · KhronosGroup/glTF-Sample-Renderer](https://github.com/KhronosGroup/glTF-Sample-Renderer/blob/3dc1bd9bae75f67c1414bbdaf1bdfddb89aa39d6/source/shaders/ibl_filtering.frag)

先讲cpp这边，`prefilterCubemap`画一个全屏三角形，让fragment shader干活儿，然后保存。

shader那边：

* `uvToXYZ` converts a cubemap face index and vec2 coordinates into vec3 cubemap sampling direction.
* `filterColor` does the actual Monte Carlo sampling，理论部分见 [Image Based Lighting with Multiple Scattering | Bruno Opsenica's Blog](https://bruop.github.io/ibl/)

The process of importance sampling can introduce visual artifacts. One way to improve visual quality without compromising performance is by utilizing hardware-accelerated mip-mapping for swift filtering and sampling. 见 [Final_sap_0073.pdf](https://cgg.mff.cuni.cz/~jaroslav/papers/2007-sketch-fis/Final_sap_0073.pdf) 和 [Chapter 20. GPU-Based Importance Sampling | NVIDIA Developer](https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-20-gpu-based-importance-sampling)

how to convert cube maps between different formats: [Converting to/from cubemaps](https://paulbourke.net/panorama/cubemaps/index.html)

### Implementing the glTF 2.0 metallic-roughness shading model

讲怎么实现一个最简单的metallic-roughness shading model了，简单的介绍见 [KhronosGroup/glTF-Sample-Viewer at glTF-WebGL-PBR](https://github.com/KhronosGroup/glTF-Sample-Viewer/tree/glTF-WebGL-PBR)

讲代码了，先介绍了下一些helper function：

* `GLTFGlobalSamplers`包含三个sampler，分别是clamp，wrap和mirror
* `EnvironmentMapTextures`负责存储所有的IBL environment map texture和BRDF的LUT
* `GLTFMaterialTextures`则包含了所有渲染要用到的贴图，`loadMaterialTextures`负责加载这些贴图
* `MetallicRoughnessDataGPU`包含了一些材质信息，metallicRoughnessNormalOcclusion四合一，一是为了性能，而是对其方便；emissiveFactor和alphaCutoff也合成一个vec4了；其他的就是一些uint32_t的id，以及alphaMode，决定怎么去理解alpha值；`setupMetallicRoughnessData`负责填充这个结构体

然后开始`main`函数：

* `Vertex`格式定义在了UtilsGLTF.h里，注意不仅有uv0还有uv1，uv1一般是给lightmap或者reflection map用的；结尾还有2个float当padding有，一个Vertex正好64byte
* 然后加载贴图，加载IBL相关的资源，把material的数据塞进gpu buffer里，然后传buffer device address给shader；push constant一共传三个指针进去，第一个是PerDrawData的指针，里面包含mvp、material id等数据，第二个是刚提到的material数组，第三个是environments相关的数组

然后就到了大头的shader部分，这边说vertex shader uses programmable-vertex-pulling，看代码不是这样，还是走的传统的绑定。

fragment shader是干活儿的部分：

* `Inputs.frag`里面一堆helper函数和一些input声明，都比较简单
* `main`里面就是上来采样一堆贴图，然后处理是normal：normal除了pixel自己带一个世界空间的，normal map还会采样出来一个切线空间的，`perturbNormal`里面会算下TBN矩阵（根据uv和原始的normal）然后把normal map采样出来的值变换回世界空间（见 [Followup: Normal Mapping Without Precomputed Tangents](http://www.thetenthplanet.de/archives/1180)）；里面调用了`cotangentFrame`，creates tangent space based on the vertex position p, the per-vertex normal vector N, and uv texture coordinates，这里也提了This is not the best way to get the tangent basis, as it suffers from uv mapping discontinuities, but it’s acceptable to use it in cases where per-vertex precalculated tangent basis is not provided
* 调用`calculatePBRInputsMetallicRoughness`来填充`PBRInfo`；然后就是算IBL贡献的specular和diffuse color的值，`getIBLRadianceContributionGGX` 和 `getIBLRadianceLambertian`；最后加上一个光源的贡献`calculatePBRLightContribution`
* 然后把AO的贡献也算上去，加上自发光项，做一下gamma校正，结束

然后是一些细节部分，基于[KhronosGroup/glTF-Sample-Viewer at glTF-WebGL-PBR](https://github.com/KhronosGroup/glTF-Sample-Viewer/tree/glTF-WebGL-PBR)：

* `PBRInfo`里面存了当前pixel的一些几何性质，比如NdotL，NdotV之类，以及材质的性质
* Calculation of the lighting contribution from an Image-Based Light source is split into two
  parts – diffuse irradiance and specular radiance. 
  * `getIBLRadianceLambertian`基于[Image Based Lighting with Multiple Scattering](https://bruop.github.io/ibl/#single_scattering_results)，注意这不止是去采样环境的Irradiance map，还考虑了镜面反射修正和Fresnel 能量损失补偿
  * `getIBLRadianceContributionGGX`使用 prefiltered mipmap 做 roughness 层级选择，查BRDF LUT进行计算等，注意这里还有一个传进来的`specularWeight`
* `diffuseBurley`来自[s2012_pbs_disney_brdf_notes_v3.pdf](https://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v3.pdf)，相比仅仅是Lambert Diffuse，还考虑了 roughness 对边缘变暗的影响
* 用`specularReflection`算F（注意这里用的是F90-F0，没有直接化简为F90=1），`geometricOcclusion`算G，`microfacetDistribution`算D
* `calculatePBRInputsMetallicRoughness`：
  * 里面会把roughness最小值clamp到0.04，假设认为就算是dielectrics也会至少有4%的高光反射，然后平方一下，说会让roughness的分布更线性 [Physically Based Shading At Disney](https://disneyanimation.com/publications/physically-based-shading-at-disney/)
  * For a typical incident reflectance range between 4% to 100%, we should set the grazing reflectance to 100% for the typical Fresnel effect. For a very low reflectance range on highly diffuse objects, below 4%, incrementally reduce grazing reflectance to 0%  默认我们希望 F90 = 1.0 来符合 Fresnel 行为，但对一些反射极低（F₀ < 0.04）的材质人为降低 F90，避免它们在大角度时出现不合逻辑的高光。
* `calculatePBRLightContribution`计算The lighting contribution from a single light source，color = NdotL * lightColor * (diffuseContrib + specContrib)

最后推荐去看Unreal的shader代码：[UnrealEngine/Engine/Shaders/Private at release · EpicGames/UnrealEngine](https://github.com/EpicGames/UnrealEngine/tree/release/Engine/Shaders/Private)

### Implementing the glTF 2.0 specular-glossiness shading model

The specular-glossiness extension is a **deprecated** and archived in the official Khronos repository.  原因 [Converting glTF PBR materials from spec/gloss to metal/rough](https://www.donmccurdy.com/2022/11/28/converting-gltf-pbr-materials-from-specgloss-to-metalrough)

后面会讲这个，A new glTF specular extension, **KHR_materials_specular**, that replaces this older specular-glossiness shading model and show how to convert from the old model to the new extension.

特意提了给material struct加字段要注意对齐，We need it to **keep the binary representation of this structure aligned with GLSL shader inputs**. The GLSL st430 layout and alignment rules are not complex but might not be correctly implemented by different hardware vendors, especially on mobile devices. In this case, manual padding is just an easy and good enough way to fix compatibility between all GPUs. 对齐见[Vulkan-Guide/chapters/shader_memory_layout.adoc at main · KhronosGroup/Vulkan-Guide](https://github.com/KhronosGroup/Vulkan-Guide/blob/main/chapters/shader_memory_layout.adoc)

shader里按照这个改改就行 [KHR_materials_pbrSpecularGlossiness | glTF](https://kcoley.github.io/glTF/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness/)

## Chap 7Advanced PBR Extensions

Our GLSL shaders code is based on the official Khronos Sample Viewer and serves as an example implementation of these extensions.

### Introduction to glTF PBR extensions

the glTF 2.0 list of ratified extensions specification: [glTF/extensions/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md)  说layer机制和adobe的有点像 [Autodesk/standard-surface: White paper describing the Autodesk Standard Surface shader.](https://github.com/Autodesk/standard-surface)

Layering mimics real-world material structures by **stacking multiple layers, each with its own light-in-teracting properties**. To maintain physical accuracy, the first layer, called the base layer, should be either fully opaque (like metallic surfaces) or completely transparent (like glass or skin).  You can think of it as **a statistically weighted blend of two different materials**, where you combine a certain percentage of material A with a certain percentage of material B.

这一章的main.cpp都很简单，只是简单加载模型，调用下gltf相关的函数，实现都在`GLTFContext`里。

`renderglTF`有个rebuildRenderList参数，用来signal that model-to-world transformations of glTF nodes should be rebuilt

* 先调用`buildTransformsList`负责build node transformations and collect other nodes data，把相关的数据（主要是各种id）塞到gltf.transforms里，然后transparentNodes、transmissionNodes和opaqueNodes里记录当前mesh在gltf.transforms里的index，gltf.transforms直接做个host visible的buffer
* 然后调用`sortTransparentNodes`，负责对不透明物体排序保证渲染正确
* 准备per frame的uniform和push constant，push constant里都是buffer address
* 开始opaque pass（中间跳过了一些代码），没用vertex pulling而是走的传统的那套，这里有个小技巧是把`transformId`当成`vkCmdDrawIndexed`的`firstInstance`传进去了，会在shader里变为`gl_BaseInstance`，用这个值来索引到该mesh的transfrom，好处是不用每个drawcall都更新一遍push constant，性能好
* 先画opaque，然后开始transmission：首先screen copy，Some transparent nodes may require a screen copy to render various effects, such as volume or index-of-refraction，再一个for循环开始画transmission；最后transparent，然后round robin更新下screen copy要用的texture

### Implementing the KHR_materials_clearcoat extension

[glTF/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)

The KHR_materials_clearcoat extension adds a clear, reflective layer on top of another material or surface. This layer reflects light both from itself and the layers underneath.

The specular BRDF for the clearcoat layer uses the specular term from the glTF 2.0 Metallic-Roughness material. The microfacet Fresnel term is calculated **using the NdotV term instead of the VdotH term**, effectively ignoring the microscopic surface orientation within the clearcoat layer. 算F的时候，不用半角向量了，而是直接N dot V

讲实现的部分，首先是`GLTFMaterialDataGPU`加上对应的字段，然后加载的时候加载对应的贴图即可。

大头在shader部分， The clearcoat factor and roughness are packed into a texture as r and g channels respectively

frag里面会判断是不是clearcoat的材质（通过按位与判断），F0是走的IOR计算的，后文会提到，F90直接是1。

用`getIBLRadianceGGX`算好clearcoat的环境光的镜面高光（与算主材质的对应项的`getIBLRadianceContributionGGX`几乎一样），复用`F_Schlick`算clearcoat的Fresnel项，然后再最后才叠加上clearcoat的材质效果（晚于emissive）：

```cpp
vec3 color = specularColor + diffuseColor + emissiveColor + sheenColor;
color = color * (1.0 - pbrInputs.clearcoatFactor * clearcoatFresnel) + clearCoatContrib
// 应该等价文档里的：
// coated_material = mix(base_layer, clearcoat_layer, clearcoatFactor * clearcoatFresnel);
```

### Implementing the KHR_materials_sheen extension

[glTF/extensions/2.0/Khronos/KHR_materials_sheen/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_sheen/README.md#reference)

代码上倒都是差不多，读帖图，读配置，shader里面一堆helper函数。注意如果读不到贴图，就给个1x1的白色贴图，这样可以简化shader代码，性能也没有很受影响，1x1的贴图也可能能在cache里。

The Sheen extension needs a different BRDF function，主要实现在`getIBLRadianceCharlie`里，用 Charlie BRDF + IBL 来计算 glTF 的 sheen 层贡献，舍弃了 Fresnel 和几何项（注意BRDF LUT采样的是b，第三项，给sheen用的）。生成BRDF LUT时候的处理前文提过。

关于计算，The Sheen extension provides its own roughness value, so no perceptual adjustments are needed. 直接用roughness即可. All we have to do here is to multiply sheenRoughnessFactor by the total number of mip-levels mipCount to determine the correct mip-level, sample the precalculated environment map, and then multiply it by the BRDF and sheenColor.  最终计算，还算上了AO occlusion：

`sheenColor = lights_sheen + mix(sheenColor, sheenColor * occlusion, occlusionStrength);`

### Implementing the KHR_materials_transmission extension

[glTF/extensions/2.0/Khronos/KHR_materials_transmission/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_transmission/README.md#reference)

The `KHR_materials_transmission` enables the creation of transparent materials that absorb, reflect and transmit light depending on the incident angle and the wavelength of light. **Infinitely thin materials without refraction, scattering, or dispersion.** A specular **BTDF** (Bidirectional Transmission Distribution Function) : Uses the same Trowbridge-Reitz distribution as the specular BRDF (Bidirectional Reflectance Distribution Function) but samples along the view vector instead of the reflection direction.

cpp代码部分，读取部分没啥可说，主要是更详细说了下篇章开始介绍的`renderGLTF`函数的改动，渲染transmission节点需要渲染opaque节点之后的渲染结果，所以需要create a copy of the rendered surface and use it as input for the transmission nodes. 那就需要先把swapchain的texture copy一份，然后也生成一下mipmap，记得把这个texture作为下一个renderpass的dependency

**TODO：弄清楚这里image barrier的用法**

注意，画transmission的时候没有用alpha blending，仍然走的opaque的pipeline；最后是从后到前画transparent node

shader部分的改动，纯就看transmission的话，would be similar to GGX/Lambertian, but instead of using the reflection vector, we use the dot product NdotV. 这边没详说，和KHR_materials_volume一起看比较好。

### Implementing the KHR_materials_volume extension

[glTF/extensions/2.0/Khronos/KHR_materials_volume/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md#overview)

Volumetric effects are different from surface-based materials. While surface-based materials focus on how light interacts with a surface, volumetric materials describe how light moves through a medium. Scattering is not subject of this extension.

文档里说的很清楚，`thickness map` 是基于法线方向烘焙的静态估计，Computing volumetric effects with a thickness map is **a lossy process**.

```cpp
vec3 getVolumeTransmissionRay(vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix) {
  // direction of refracted light
  vec3 refractionVector = refract(-v, n, 1.0 / ior);

  // compute rotation-independent scaling of the model matrix
  // modelMatrix 的前三列就是局部坐标系的 X、Y、Z 轴在世界空间下的位置变换，因为旋转不影响向量长度
  // 这里提取了局部坐标轴缩放长度 
  vec3 modelScale = vec3(length(modelMatrix[0].xyz),
                         length(modelMatrix[1].xyz),
                         length(modelMatrix[2].xyz));

  // the thickness is specified in local space
  return normalize(refractionVector) * thickness * modelScale.xyz;
}
```

`getIBLVolumeRefraction`和之前的getIBL系列函数一样的作用，首先调用`getVolumeTransmissionRay`拿到最终折射的vector；然后把这个vector转到NDC空间，然后去采样framebuffer上对应的背景色；然后正常计算GGX BRDF，对没被反射的光apply一下volume attenuation：`return (1.0 - specularColor) * attenuatedColor * baseColor`。`applyVolumeAttenuation`函数基于[Beer–Lambert law - Wikipedia](https://en.wikipedia.org/wiki/Beer–Lambert_law)。

### Implementing the KHR_materials_ior extension

A higher IOR means more refraction. For instance, the IOR of air is nearly 1, water has an IOR of about 1.33, and glass has an IOR of around 1.5. This value is used in conjunction with the KHR_materials_transmission extension to calculate the refraction direction of light rays when passing through the material.

[glTF/extensions/2.0/Khronos/KHR_materials_ior/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_ior/README.md#interaction-with-other-extensions)

 `dielectric_f0 = ((ior - 1)/(ior + 1))^2`

之前已经带到IOR的概念了，这边就简单讲了讲。

### Implementing the KHR_materials_specular extension & KHR_materials_emissive_strength

Addresses compatibility issues and offers the functionality of `KHR_materials_pbrSpecularGlossiness` without compromising the physical accuracy of the Metallic-Roughness PBR model.

[glTF/extensions/2.0/Khronos/KHR_materials_specular/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_specular/README.md)

The `specularColor` parameter introduces color variations into the specular reflection. It is integrated into the Fresnel term, influencing the specular reflectance at different viewing angles. At normal incidence, the specular color directly scales the base
reflectance (F0), while at grazing angles, the reflectance approaches 1.0 regardless of the specular color. To maintain energy conservation, the maximum component of the specular color is used to calculate the scaling factor for the Fresnel term, preventing excessive energy in the specular reflection.

看着就是多俩参数，也没有很复杂的计算，算f0的时候额外考虑`getSpecularColorFactor`，用PBRInfo里多了一个`specularWeight`来调节。

Before the introduction of the KHR_materials_emissive_strength extension, it was difficult to control the intensity of a material’s light emission. [glTF/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md)

### Extend analytical lights support with KHR_lights_punctual

其实就是给shader加上正经的光源支持，和之前一样，`LightDataGPU`的gpu address走push constant送进shader里。很暴力地遍历光源，一个个算，实现参考了 [glTF™ 2.0 Specification Appendix B: BRDF Implementation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation)。PBR那边的俩函数是对直接光照计算的最基础的BRDF 表达，`getBRDFLambertian`漫反射，`getBRDFSpecularGGX`算镜面反射，F * Vis * D，Vis 已经合并了 G 项和 1/(4 N·L N·V)

渲染有点问题，提了issue：[Rendering bug in Ch07_Sample08_Analytical · Issue #37 · PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/37)  其实之前看着有些demo关了transmission也会有问题，不知道是不是同样的原因。

## Graphics Rendering Pipeline

### Scene graph
