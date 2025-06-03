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

最后提了两个优化点：1，可以use a couple of round-robin descriptor sets and switch between them, eliminating the need for the heavy wait() function call before writing descriptor sets；2，perform incremental updates of descriptor sets，可以看下`VK_DESCRIPTOR_BINDING_UPDATE_UNUSED_WHILE_PENDING_BIT`

## Adding User Interaction and Productivity Tools
