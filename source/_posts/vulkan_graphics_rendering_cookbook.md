---
title: Vulkan 3D Graphics Rendering Cookbook 读书笔记
tags:
  - GameDev
date: 2025-05-30
---

是时候重新学习 vulkan 了！这篇文章是关于 [Vulkan 3D Graphics Rendering Cookbook](https://www.packtpub.com/en-us/product/vulkan-3d-graphics-rendering-cookbook-9781803236612) 的读书笔记，这本书我看过第一版（[3D Graphics Rendering Cookbook](https://www.amazon.com/Graphics-Rendering-Cookbook-comprehensive-algorithms/dp/1838986197)），但是当时太囫囵吞枣了。代码在 [PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition)，我把仓库给了 deepwiki [3D-Graphics-Rendering-Cookbook-Second-Edition | DeepWiki](https://deepwiki.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition)

## Chap 1 Establishing a Build Environment

配环境的一些东西，依赖管理用的是 [bootstrapping](https://github.com/corporateshark/bootstrapping)，除了一些依赖的仓库以外，还有很多二进制的资产依赖。CMake 那边则是靠一个`SETUP_APP`宏让每一章都有单独的 cmake project，方便学习。

* 多线程的库用的是[Taskflow](https://taskflow.github.io/taskflow/index.html)
* 依赖 [glslang](https://github.com/KhronosGroup/glslang) 来做 runtime 的 SPIRV 生成
* 依赖 [stb](https://github.com/nothings/stb) 读取图片文件，[KTX-Software](https://github.com/KhronosGroup/KTX-Software) 来压缩图像到 BC7（[BC7 Format](https://learn.microsoft.com/en-us/windows/win32/direct3d11/bc7-format)），并把 BC7 保存到`.ktx`格式。为了和 PicoPixel 这个软件保持兼容，选择了 KTX1.0 格式。注意这里先走的`ktxTexture2_CompressBasis`，然后走`ktxTexture2_TranscodeBasis`压缩到 BC7，然后走`memcpy`直接到 ktx1.0 格式。最后提了一句最新的可以直接考虑 [basis_universal](https://github.com/BinomialLLC/basis_universal)

CI 那边就是每次 push 会自动 build 一轮。

## Chap 2 Getting Started with Vulkan

和 Vulkan 的 API 的交互部分都依赖于[lightweightvk](https://github.com/corporateshark/lightweightvk), 在这个库的基础上，init swapchain 的代码还是很简洁的：

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

vulkan 那些基础概念可以看[Understanding Vulkan® Objects](https://gpuopen.com/learn/understanding-vulkan-objects/)

开始讲 lightweightvk 的一些实现，大部分代码都在 VulkanClass.cpp 里，非常高内聚，简洁清晰，阅读体验很好。

### Initializing Vulkan instance and graphical device

* 教了下怎么手动关闭一些 validation layer：[vulkan.lunarg.com/doc/view/latest/windows/layer_configuration.html](https://vulkan.lunarg.com/doc/view/latest/windows/layer_configuration.html)，宏定义很有意思，用了 `#if defined(VK_EXT_layer_settings) && VK_EXT_layer_settings` , 见 [Check if `VK_EXT_layer_settings` is defined · corporateshark/lightweightvk@12bbe18](https://github.com/corporateshark/lightweightvk/commit/12bbe18d68ac288c02cb871dfae92facb3dc711f)

* 用伟大的 volk 来动态去加载 vulkan 那些 entry point

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

* 提了一嘴比较重要的 vulkan feature，descriptor indexing 和 dynamic rendering（终于不用搞 renderpass 了）；这边做了很多 check，保证想要的 device extension 都是 available 的，保证强制开的那些 feature 都是支持的，使用了宏和 lambda 来简化代码

### Initializing Vulkan swapchain

* A swapchain is an object that holds a collection of available offscreen images, or more specifically, **a queue of rendered images waiting to be presented to the screen**. OpenGL 里 present 的过程都是走平台函数，比如 eglSwapBuffers，vulkan 给了我们更多的控制

* `chooseSwapSurfaceFormat`的顺序很有趣，先优先选择驱动给的列表里第一个出现的 BGR 或者 RGB，然后根据颜色空间找完全 match 的，没有的话有有 fallback 机制
* `chooseUsageFlags`有 bug，提了[Issue #24](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/24)；要确定 surface 本身支持`VK_IMAGE_USAGE_STORAGE_BIT`, format 支持 Optimal tiling（swapchain 的 image 必须支持这个），才能给 swapchain 加上`VK_IMAGE_USAGE_STORAGE_BIT`
* 注意 debug callback 的声明还带了 calling convention：`VKAPI_ATTR VkBool32 VKAPI_CALL vulkanDebugCallback`，On Windows, Vulkan commands use the stdcall convention；这边没展示`VK_EXT_debug_utils`，可以给 vulkan 的 object 加名字或者 tag

### Using Vulkan command buffers

* **Vulkan command buffers are used to record Vulkan commands which can be then submitted to a device queue for execution**. Command buffers are allocated from pools which allow the Vulkan implementation to amortize the cost of resource creation across multiple command buffers. Command pools are be externally synchronized which means one command pool should not be used between multiple threads.

* 提了一嘴第一版的书在每帧结束会调用一个`vkDeviceWaitIdle`，所以比较粗暴，这一版更新了。

* 对于 command buffer 相关的聚合：

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

* `acquire`用来获取下一个可用的 command buffer，kMaxCommandBuffers = 64，用完了就要等空闲的 command buffer；`acquire`最后会直接调用`vkBeginCommandBuffer`开始录制。

* `purge`用来回收 command buffer，传个 0 给`vkWaitForFences`看下 fence 当前的状态决定要不要 reset command buffer

* `VulkanImmediateCommands::submit`上来直接结束录制 command buffer，然后开始处理 semaphore 的逻辑：`waitSemaphore`里的 semaphore 可以来自一个 swapchain 里的 acquire semaphore 或者任何用户传过来的，加上一个`lastSubmitSemaphore_`，用来保证所有的 command buffer 都是一个个处理的；`signalSemaphores`有两个，第一个是跟着 command buffer 一起的用来保证执行顺序的，第二个是在帧结束和 swapchain 的 presentation 同步用的。注意`waitSemaphore_`和`signalSemaphore_`是一次性的，被用完需要清空；`submitCounter_`用来当作 id 记录，有 wrap 行为，需要跳过 0

* `isReady`有点像更高层意义上的 timeout 为 0 的`vkWaitForFences`，看到这里理解了`SubmitHandle`的作用，同时记录了 buffer 的 index 和 submit 的 index，可以用来判断这个 command buffer 是不是已经执行完了，最后才走`vkWaitForFences`。

* The three methods provide GPU-GPU and GPU-CPU synchronization mechanisms. 

  * The `waitSemaphore()` method ensures the current command buffer waits on a given semaphore before execution. A common use case is using an “acquire semaphore” from our VulkanSwapchain object, which signals a semaphore when acquiring a swapchain image, ensuring the command buffer waits for it before starting to render into the swapchain image. 
  * The `signalSemaphore()` method signals a corresponding Vulkan timeline semaphore when the current command buffer finishes execution. 
  * The `acquireLastSubmitSemaphore()` method retrieves the semaphore signaled when the last submitted command buffer completes. This semaphore can be used by the swapchain before presentation to ensure that rendering into the image is complete.

* `VulkanContext::submit`还有 present swapchain 的功能，这里要去操作 timeline semaphore：There is a uint64_t frame counter VulkanSwapchain::currentFrameIndex_, which increments monotonically with each presented frame. We have a specific number of frames in the swapchain—let’s say 3 for example. Then, we can calculate different timeline signal values for each swapchain image so that we wait on these values every 3 frames. We wait for these corresponding timeline values when we want to acquire the same swapchain image the next time, before calling vkAcquireNextImageKHR(). For example, we render frame 0, and the next time we want to acquire it, we wait until the signal semaphore value reaches at least 3. 在`submit`的最后，去`acquireLastSubmitSemaphore`拿到 semaphore 让 swapchain 去等。present 正好还处理 defer 的 task，竟然是个`std::packaged_task`，跟`SubmitHandle`一起的，处理一些 vulkan 资源

* `VulkanSwapchain::getCurrentTexture`，先 wait on the timeline semaphore using the specific signal value for the current swapchain image；the pattern here is that for rendering frame N, we wait for the signal value N. After submitting GPU work, we signal the value N+numSwapchainImages.

* 主要难点在于 semaphore 的同步。最后推荐了去看《Vulkan Cookbook》来了解细节，这边都是讲的上层如何抽象了（这种东西看一回忘一回

### Initializing Vulkan shader modules

这一小节讲如何 load shader：

```c++
// 把 std::unique_ptr 当 const std::unique_ptr& 传总感觉怪怪的
lvk::Holder<lvk::ShaderModuleHandle> vert = loadShaderModule(ctx, "Chapter02/02_HelloTriangle/src/main.vert");
// ...
```

* `ShaderModuleDesc`设计上兼容传入 string 或者 SPRIV 的 blob，如果`dataSize`为 0 则`data`是 null terminated string，不为 0 则是一个 SPRIV 的 binary；`VkShaderModule`会被存在一个 pool 里
* SPIRV-Reflect 被用来从 SPIRV 里面获得 push constants 的大小；`createShaderModuleFromGLSL`最后就是调用读取 SPIRV 的代码，在之前会给 glsl 插入一些开启 extension 和给 bindless 的帮助函数。

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
* **LightweightVK uses opaque handles to work with resources**, so `lvk::RenderPipelineHandle` is an opaque handle that manages a collection of VkPipeline objects, and `lvk::Holder` is a RAII wrapper that automatically disposes of handles when they go out of scope. **详见 Chap3 Storing Vulkan Objects**
  * `Handle`这个类型很有意思，模板参数只是用来让 Handle 变成强类型防止不同资源种类的 Handle 互相赋值的，注释说了`specialized with dummy structs for type safety`
  * 整个 idea 来自：[Modern Mobile Rendering @ HypeHype](https://enginearchitecture.realtimerendering.com/downloads/reac2023_modern_mobile_rendering_at_hypehype.pdf)，Handle 里面有实际的 index 和 generation counter，实际的数据在 Pool 里
* `RenderPipelineDesc`用来描述 rendering pipeline，主要包括各个阶段的 shader 以及 enrey point 等等，还有 Specialization constants，以及其他各种各样的 rendering state
* 除了一些 cache 的 vertex input bindings and attributes 数据以外，每个`RenderPipelineState`有一个`VkPipelineLayout`和`VkPipeline`，specialization constants 的内存也在这里管理，会自动处理好 descriptor set layouts；`createRenderPipeline`里会把`RenderPipelineState`拷贝到`RenderPipelineState`里面，然后再特意把 specialization constants 的数据也 memcpy 出来，这样 caller 那边就可以传一个`RenderPipelineState`过来然后不用管生命周期了，大部分都是值类型的没关系，只有 specialization constants 因为用了指针所以需要特殊处理下
* `getVkPipeline`超长函数：
  * 先检查缓存下来的 descriptor set layout 是不是变了，会变是因为用了 Vulkan descriptor indexing 来管理所有的贴图，可能贴图多了会导致新创建 descriptor set layout，`deferredTask`前文提过，用来清理资源
  * 后面在只给 active 的 color attachments 准备 color blend attachments => 拿 shader => 准备 vertex input state => 准备`VkSpecializationInfo` => 创建`VkPipelineLayout`，准备 push consants => 走`VulkanPipelineBuilder`创建`VkPipeline`
  * Here one descriptor set layout `vkDSL_` is duplicated multiple times to create a pipeline layout. This is necessary to **ensure compatibility with MoltenVK which does not allow aliasing of different descriptor types**.
  * `VulkanPipelineBuilder`是 Builder pattern，帮忙设置好了一大堆默认值，传入 shader 等各种参数，最后调用`build`即可；`build`里面先会处理好 dynamic state 相关，然后填填东西，终于创建出来了`vkCreateGraphicsPipelines`
* 其他：
  * `cmdBeginRendering`是 vulkan1.3 的 dynamic rendering 的封装，这里只是简单提了下需要传入`lvk::RenderPass`和`lvk::Framebuffer`。
  * `cmdPushDebugGroupLabel`增强 debug 能力，renderdoc 里可以看到：[How do I annotate a capture? — RenderDoc documentation](https://renderdoc.org/docs/how/how_annotate_capture.html)
  * 这里用的 shader 很简单，直接硬写的值，所以不需要传入啥
* 最后简单说了下 GLM 那个 demo，演示了下 push constant 的用法，同样的 shader 既画 cube 又画 wireframe
* 最后提了下怎么兼容旧的 vulkan，在`RenderPipelineDynamicState`里面加个 id，可以去索引到存在`VulkanContext`里的对应的 render pass；代码可以看[igl/src/igl/vulkan/RenderPipelineState.h at main · facebook/igl](https://github.com/facebook/igl/blob/main/src/igl/vulkan/RenderPipelineState.h)。

## Chap3 Working with Vulkan Objects

第二章看的太累了，第三章要开始有趣起来了。

### Dealing with buffers in Vulkan

More specifically, a Vulkan buffer refers to a `VkBuffer` object that is associated with memory regions allocated through `VkDeviceMemory`. 这小节主要是讲用 assimp 导入模型和 VMA。

导入相关的代码就很平铺直叙，没啥可说的；后面绘制模型的部分也是，mvp 矩阵是靠 push constants 机制直接传值，vulkan1.3 保证至少有 128byte 的 push constant 大小（我自己的 3060Ti 上是 256bytes）；另外画 wireframe 的时候设置了下 depth bias 防止明显的 flickering。

* buffer 三种 storage 类型： `StorageType_Device`对应 GPU 的 local memory, `StorageType_HostVisible`对应 CPU 可以读写并且 coherent 的 memory, `StorageType_Memoryless`对应不用来当 storage 的 memory

* 创建 buffer 的时候要考虑是不是使用 staging buffer 去把数据拷贝到 device-local buffer 上；为了用 vulkan1.2 的 buffer device address 需要开启`VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT`（**这里代码上有的地方用了这个有的用了_KHR 后缀的**）

* `VulkanBuffer`又是一个聚合，所有 host visible 的 buffer 都自动 map 过，直接用 cpp 的指针更新其内容即可；如果不是 coherent 的要记得调用`flushMappedMemory`让 GPU 可以看到 CPU 更新过的内存，`invalidateMappedMemory`则是反过来的，让 GPU 写的内存可以被 CPU 看到，对 mobile 尤其重要

* 创建 buffer 的时候也有根据是否使用了 VMA 的分支代码，不用 VMA 就是直接使用 vulkan；创建的最后会根据 flag 来判断是否要调用`vmaMapMemory`或者`vkMapMemory`来 map 地址

* `VulkanContext::destroy(BufferHandle handle)`则要注意生命周期，不能在 GPU 还在使用 buffer 的时候就释放 buffer，所以把相关过程丢到`deferredTask`里去了，等所有提交过的 command buffer 都执行完再释放

### Implementing staging buffers

* `VulkanContext::upload`方法，如果`buffer.isMapped()`那就走非 staging 的流程，不然就调用`stagingDevice_->bufferSubData`

* `VulkanStagingDevice`提供了处理 device-local 的 buffer 和 image 相关的函数，`MemoryRegionDesc`用来表示会用到的 staging buffer 的一块，除了 size 和 offset 以外还包括了用来上传的 SubmitHandle；默认的`minBufferSize_`可以放下一个 RGBA 2k 贴图

* `getAlignedSize`实现如此优雅：

  ```cpp
  uint32_t getAlignedSize(uint32_t value, uint32_t alignment) {
    return (value + alignment - 1) & ~(alignment - 1);
  }
  ```

* `getNextFreeOffset`会先去找之前分配的有没有能复用的，找到的话就用上，把原来服用的那个从 deque 去掉，把新的空闲块加进 deque；如果找不到够大的，只能先用 cache 到的最大的，然后分块上传 buffer 了；如果还是不行，只能调用`waitAndReset`等待整个 staging buffer 空闲

* `bufferSubData`主要就是处理当前 buffer 太大需要多次上传的情况；拿到可以用 staging buffer 块就把数据拷贝进去，然后走`VulkanImmediateCommands`拿到 command buffer 来把数据再拷贝到实际要用的 buffer 那儿；这里还要记得设置 pipeline barrier

* buffer 讲完讲了下`imageData2D`，可以一次性上传一个 image 的多层 layer，包括多个 mipmap 层级，计算方法好像有点问题，提了[Issue #26](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/26)；这里和 buffer 不一样，如果拿到的 staging 不够大就等，而不是和 buffer 一样可以 while 循环慢慢拷贝；后面又是 Memory barrier，image layout 转到`TRANSFER_DST_OPTIMAL`，拷贝完再转到`SHADER_READ_ONLY_OPTIMAL`; 这个库出于简单，只跟踪整个 VkImage 的 layout 信息，其实可以更细化一些，但是也没必要。

* The Vulkan image layout is a property of each image subresource that defines how the data in memory is organized in a manner that is opaque to the user and specific to the Vulkan drivers. Correctly specifying the layout for various use cases is crucial; failing to do so can lead to undefined behavior, such as distorted images.

* 这里大量使用了[ldrutils/lutils/ScopeExit.h at master · corporateshark/ldrutils](https://github.com/corporateshark/ldrutils/blob/master/lutils/ScopeExit.h)来延迟一些行为，像是 go 的`defer`

* 最后提了一句 ReBar，推荐了[Vulkan Memory Types on PC and How to Use Them](https://asawicki.info/news_1740_vulkan_memory_types_on_pc_and_how_to_use_them)

### Using texture data in Vulkan

A Vulkan image is a type of object backed by memory, designed to store 1D, 2D, or 3D images, or arrays of these images.

Demo 展示了下基于 bindless 的渲染，Bindless rendering is a technique that enables more efficient GPU resource management by eliminating the need to explicitly bind resources like textures, buffers, or samplers. 提了一嘴`kTextures2D[]`和`kSamplers[]`的 0 号元素都是 dummy, prevent sparse arrays in GLSL shaders and ensure that all shaders can safely sample non-existing textures.

* `TextureDesc`的介绍，`createTexture`的 debugName 可以覆盖`TextureDesc`自己的 debugName，`dataNumMipLevels`指定了想要 upload 的 mimap 的数量，`generateMipmaps`则代表需要强制生成 mipmap

* `createTexture`上来先把 LightweightVK 的图片格式转到 vulkan 的图片格式，depth format 那边找最近的，color format 则 11 对应；冗长的错误处理之后，开始加 flag，`VK_IMAGE_USAGE_TRANSFER_DST_BIT`之类，为了方便给除了 Memoryless 的 image 都加上了从 GPU 回读的 flag：`VK_IMAGE_USAGE_TRANSFER_SRC_BIT`；设置一些友好的 debugName；提了一嘴 MSAA 的支持，chap10 会讲

* 然后创建`VulkanImage`，解释了下`getOrCreateVkImageViewForFramebuffer`，Image views used as framebuffer attachments should have only 1 mip-level and 1 layer, this function precaches such image views inside the array `imageViewForFramebuffer_[][]`，it supports a maximum of 6 layers, which is just enough for rendering to the faces of a cube map

* 然后开始填`VkImageCreateInfo`，这里也有代码处理 multiplanar image；另外 sharing mode 都是 EXCLUSIVE，因为 lightweight vk 本身不考虑跨多个 vulkan queue；接着就是根据是否使用 VMA 的分支，使用 VMA 并且图片 numPlanes 为 1 就很简单，不然有点复杂，memory can only be bound to a VkImage once. Therefore, the code handles binding disjoint memory locations in a single call to vkBindMemory2() by chaining everything together using pNext pointers. 后面再研究（估计也不需要研究）

* 开始创建`VkImageView`，Vulkan images can have multiple aspects simultaneously, such as combined depth-stencil images, where depth and stencil bits are handled separately. Additionally, Vulkan supports image view component swizzling. An image view can control which mip-levels and layers are included. Here, we create an image view that includes all levels and layers of the image. 后续需要给 framebuffer attachments 创建单独的 image views，只有一层 layer 和一个 mipmap；Storage images 因为不支持 swizzling，所以也单独有自己的 image view.

* 创建完毕设置`awaitingCreation_`为 true，指示后续去更新 bindless descriptor set；`createImageView`那边没啥神秘的

* `VulkanContext::destroy(lvk::TextureHandle handle)`提了下，主要是销毁顺序和时机，也是大量使用`SCOPE_EXIT`和`deferredTask`；也考虑到了`isOwningVkImage_`相关的逻辑，如果为 false 则不去销毁` VkImage`和`VkDeviceMemory`，false 的主要用途是，allows us to create as many non-owning copies of a VulkanImage object as we need, which is very useful when we want to create multiple custom image views of the same VkImage

### Storing Vulkan objects

详细讲之前隐约提到过的 handle 系统了，值类型的 handle 确实好，作为 64 位的整数可以随便到处传，也不用付出 shared_ptr 那样 atomic 的开销。idea 来自：[AaltonenHypeHypeAdvances2023.pdf](https://advances.realtimerendering.com/s2023/AaltonenHypeHypeAdvances2023.pdf) 

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

* handle 只能被 friend class pool 去构造，Pool 的声明中的类型不定义没关系，这里只是声明一下是友元
* `indexAsVoid`是把数据传给第三方库用的，比如 imgui
* 还补了一个 assert 来保证是 8byte，猜测是防止意外塞入虚函数或者奇怪的对齐规则
* 前文提过 Handle<> template 还被加了 tag，防止不同类型的 handle 可以互相赋值

Handles do not own objects they point to. Only the Holder<> class does. 我个人理解，**Handle 就是个 POD 类型，Holder 是基于之上的 RAII 类型**，有点像是 std::unique_ptr，只能 move

```c++
~Holder() {
  lvk::destroy(ctx_, handle_);
}
Holder& operator=(std::nullptr_t) { reset(); return *this; }
```

现在还看不到 IContext 的声明，所以先前向声明`lvk::destory`将就用

**Pool: stores a collection of objects of type ImplObjectType inside std::vector and can manage handles to these objects.** The LightweightVK implementation in VulkanContext uses them to store all implementation-specific objects that are accessible by handles from the interface side.

vector 里存了 PoolEntry，带着 generation 信息，以及 freelist 要用的字段。Note 里提了可以做冷热分离啥的，为了简单起见略过了。这里 create 和 PoolEntry 都只接受 R-value reference. 

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

`VulkanContext`里就有 descriptor set 相关的字段，同时`lastSubmitHandle_`其实就是最近用这个 descriptor set 的提交。

* `growDescriptorPool`，先检查`maxTextures`和`maxSamplers`是不是超过了硬件支持的大小，然后 destory 旧的 descriptor set，再创建新的 descriptor set layout 给所有 pipeline 共用，记加上`CREATE_UPDATE_AFTER_BIND_BIT`，最后创建`vkDSet_`
* `checkAndUpdateDescriptorSets`用来更新 descriptor set，先检查`awaitingCreation_`，然后开始填`VkDescriptorImageInfo`，提了一嘴 Multisampled images can only be accessed from shaders using texelFetch(), which is not supported by LightweightVK. 最后因为要更新整个 descriptor set，要注意等一下上次的 submithandle，保证 vulkan 没有在用。

shader 里面插入的 bindless descriptor set 大概这样：

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

虽然 set 的 id 看着不同，但是其实是同一个，为了兼容 MoltenVK 才写成这样。

nonuniformEXT 见：[GLSL/extensions/ext/GL_EXT_nonuniform_qualifier.txt at main · KhronosGroup/GLSL](https://github.com/KhronosGroup/GLSL/blob/main/extensions/ext/GL_EXT_nonuniform_qualifier.txt)  不加会有问题，这是 non-uniform acess

最后提了两个优化点：1，可以 use a couple of round-robin descriptor sets and switch between them, eliminating the need for the heavy wait() function call before writing descriptor sets；2，perform incremental updates of descriptor sets，可以看下`VK_DESCRIPTOR_BINDING_UPDATE_UNUSED_WHILE_PENDING_BIT`

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

简单讲了下`ImGuiRenderer`这个类，就是一些 imgui 渲染需要的东西，有个 3 个`DrawableData`，To ensure stall-free operation, LightweightVK uses multiple buffers to pass ImGui vertex and index data into Vulkan.

 imgui 用的 shader 是写在 HelpersImGui.cpp 里的：

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

The buffer_reference GLSL layout qualifier declares a type and not an instance of a buffer, 这里依赖`GL_EXT_buffer_reference`，把 gpu buffer address 用 push constant 传进来，LTRB 指的是 2d viewport orthographic projection 的一些参数，用来在 vertex shader 拼 projection 矩阵，颜色用`unpackUnorm4x8`解回 vec4

* `createNewPipelineState`比较简单，注意一下 sRBG 的模式作为 specialization constant 传给 shader；`updateFont`则是处理字体贴图相关的逻辑；构造函数里就是正常的初始化，加了`ImGuiBackendFlags_RendererHasVtxOffset`来提升性能
* `beginFrame`里创建 vulkan pipeline；`endFrame`逻辑比较多，实际录制需要的 command；按需创建新的 vb 和 ib，注意 vb 因为 shader 里用了 programmable vertex pulling 所以类型是`BufferUsageBits_Storage`，buffer 上传的时候因为 buffer 都是 host visibie，所以直接 memcpy，而且因为是 vertex pulling 所以也不需要给 render pipeline 传 vertexInput；后续还有 viewport clip，scissor test 等等，use both the index offset and vertex offset parameters to access the correct data in our large per-frame vertex and index buffers

### Integrating Tracy & Using Tracy GPU profiling

讲讲 tracy 的集成，一些 cmake 和宏定义，`LVK_PROFILER_FRAME`会在`lvk::VulkanSwapchain::present()`被调用，标志一帧的结束。demo 跑起来有点问题，提了[Issue #29](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/29)

GPU profiling 更有趣一些，初始化那边比较全面，考虑了各种 fallback，checks the available Vulkan time domains and enables different Tracy GPU profiling features based on their availability.

cpp 小 trick，这里用 lambda 的好处是可以让`hasHostQuery`变成 const:

```cpp
const bool hasHostQuery = vkFeatures12_.hostQueryReset && [&timeDomains]() -> bool {
   for (VkTimeDomainEXT domain : timeDomains)
   if (domain == VK_TIME_DOMAIN_CLOCK_MONOTONIC_RAW_EXT || domain == VK_TIME_DOMAIN_QUERY_PERFORMANCE_COUNTER_EXT)
      return true;
   return false;
}();
```

如果设备支持 host querying，就只初始化`tracyVkCtx_`即可，不需要额外的 command buffer，不然就也要自己创建，然后根据设备是不是支持 calibrated timestamp（`VK_EXT_calibrated_timestamps`）分别初始化。代码就按宏`LVK_WITH_TRACY_GPU`看就行了，比较直接。

FPS 那节太无聊了略过。

### Using cube map textures in Vulkan

A useful property of cube maps is that they can be sampled using a direction vector. We can store the diffuse part of the physically based lighting equation in an **irradiance cube map**.

Cube maps are often stored as **equirectangular projections**. The equirectangular projection is such a projection that maps longitude and latitude (vertical and horizontal lines) to straight, even lines, making it a very easy and popular way to store light probe images.

先介绍了`Bitmap`类，可以用来封装 8bit 或者 float 类型的 bitmap。`comp_`代表 number of components per pixel，用了函数指针来抽象不同数据类型的 bitmap 的操作。

讲了下从 equirectangular 到 cube map 的转换，正确的方法是按 cube map 的像素去采样 equirectangular 图（bilinear interpolation），而不是反过来，反过来会有摩尔纹。

`faceCoordsToXYZ`用来把 cube map 上表面像素坐标转化为方向向量（立方体表面上的一点）

`convertEquirectangularMapToVerticalCross`把一个 equirectangular 转换为一个 vertical cross 格式的 cube map，`kFaceOffsets`代表每个面在数据中的偏移位置，后面把从`faceCoordsToXYZ`拿到的方向向量转到[球面坐标](https://en.wikipedia.org/wiki/Spherical_coordinate_system)，然后再映射到 equirectangular 内的坐标，做双线性插值得到颜色。

`convertVerticalCrossToCubeMapFaces`则最后转成 tightly packed rectangular cube map faces, the resulting cube map contains an array of six 2D images. 这俩函数不合成一个我猜是因为可以把 vertical cross 的保存下来 debug 用。

最后讲 demo 的代码，读取 hdr 文件用的是`stbi_loadf`，就是正常上传，`cerateTexture`内部处理好了相关逻辑。

skybox 的 shader 我看了下，就是构造了一个单位立方体，vertex 里算的时候：`gl_Position = pc.proj * mat4(mat3(pc.view)) * vec4(1.0 * pos[idx], 1.0)`把 view 矩阵的平移部分去掉了，因为 skybox 本来也不会移动，后面算了下 direction 传给 frag，frag 就是采样一下。

渲染小黄鸭的 shader 也不复杂，注意 vertexshader 里变换法线：`mat3 normalMatrix = transpose( inverse(mat3(pc.model)) )`，其他都没啥，正常的 shader。

### Working with a 3D camera & Adding camera animations and motion

`CameraPositioner_FirstPerson`讲了下怎么实现第一人称相机，主要是鼠标、键盘交互以及四元数旋转的一些操作，比如从鼠标的屏幕空间移动算出相机本身应该旋转多少，从 view 矩阵（四元数）得到 forward、right、up，怎么得到 view 等。demo 的代码和 cube map 那一章一样，只是 view 和 cameraPos 从写死的变成了外面传入的。

`CameraPositioner_MoveTo`则是一个可以被 imgui 控制坐标和朝向的相机，基本原理也差不多，这次不用四元数了直接存欧拉角（imgui 控件上调整的是欧拉角）。注意移动到目标位置还带上 damping 效果，欧拉角要记得 clip 一下，防止旋转时候不走最短路径，以及防止角度无限增长。

### Implementing an immediate-mode 3D drawing canvas & Rendering on-screen graphs

讲`LineCanvas3D`的一节，The LineCanvas3D class has its internal 3D line representation as a pair of vertices for each and every line, whereas each vertex consists of a vec4 position and a color. 除了线还有 plane、box、视锥 frustum 这样的 primitives. 

* plane 是 n * n 的那种网格，box 需要传入 model matrix。视锥更复杂一些，先定义好 8 个 corner 点（NDC 空间下），然后用提供的 view-projection 矩阵的逆矩阵转换一下，转到视锥的形状，然后划线。
* `render`函数就是很正常的感觉，也是 programmable vertex pulling，用 push constant 把 mvp 矩阵和 gpu buffer 地址传进去

后一节讲了下`LineCanvas2D`，就简单很多，`render`函数纯粹依赖于 imgui 的基础设施，先画个 full-screen ImGui window with all decorations removed and user input disabled，然后直接往 drawlist 里塞 line

`LinearGraph`则是基于 ImPlot 画图用的，可以用来画 FPS 图。`renderGraph`里面要先确定极值，这样可以 normalize 一下图表，然后 imgui 画个 window，在里面 ImPlot 画图。

### Putting it all together into a Vulkan application

主要是 VulkanApp 的抽象，VulkanApp.h header provides a wrapper for LightweightVK context creation and GLFW window lifetime management. 还自带了个 first-person camera, context 可以从 VulkanApp 要。

Run the main loop using a lambda provided by the `VulkanApp::run()` method.

## Chap5 Working with Geometry Data

要开始进入复杂一些的话题了。

### Generating level-of-detail meshes using MeshOptimizer & Implementing programmable vertex pulling

MeshOptimizer provides algorithms to help optimize meshes for modern GPU vertex and index processing pipelines. It can reindex an existing index buffer or generate an entirely new set of indices from an unindexed vertex buffer. 按顺序：

* 用`meshopt_generateVertexRemap`生成 remap table
* `meshopt_remapIndexBuffer`和`meshopt_remapVertexBuffer`一套组合拳
* 用`meshopt_optimizeVertexCache`来优化（讨论见[Shaded vertex reuse on modern GPUs – Interplay of Light](https://interplayoflight.wordpress.com/2021/11/14/shaded-vertex-reuse-on-modern-gpus/)）文档上说是 Reorders indices to reduce the number of GPU vertex shader invocations，应该是最大化 GPU 的 Post-Transform Vertex Cache 命中率
* 用`meshopt_optimizeOverdraw`来优化 overdraw（理论上需要 view-dependent 的算法，没看过具体实现原理），Reorders indices to reduce the number of GPU vertex shader invocations and the pixel overdraw
* 用`meshopt_optimizeVertexFetch`来优化 vertex fetch 的效率，Reorders vertices and changes indices to reduce the amount of GPU memory fetches during vertex processing，主要是优化 vertex buffer 的局部性
* 最后用`meshopt_simplify`生成不同 lod 的顶点数据，generate a new index buffer that uses existing vertices from the vertex buffer with a reduced number of triangles.

demo 的渲染很简单，就是生成俩 index buffer，一个给 mesh，然后画

**programmable vertex pulling (PVP)**: By combining multiple meshes into a single buffer and rendering them with a single draw call, developers could avoid rebinding vertex arrays or buffer objects, significantly improving draw call batching. This technique enables merge-instancing, where multiple small meshes are combined into a larger one to be processed as part of the same batch. 具体性能考虑可以参考 [nlguillemot/ProgrammablePulling: Programmable pulling experiments (based on OpenGL Insights "Programmable Vertex Pulling" article by Daniel Rakos)](https://github.com/nlguillemot/ProgrammablePulling)

PVP 的 demo 也很简单，之前已经大概提过这个了，主要是 vertex buffer 的 usage flag 要设成`BufferUsageBits_Storage`而不是`BufferUsageBits_Vertex`，然后 push constants 把 buffer 地址传进去。

注意这一章 wireframe 换了个画法，从原来走 push constant，换成了用 geometry shader 算下每个像素的 barycoords，根据这个来显示三角形边缘。

### Rendering instanced geometry & with compute shaders

用`gl_InstanceIndex` ，can be used to fetch material properties, transformations, and other data directly  from buffers.

Demo 是渲染 100 万个旋转方块，每个都有自己的位置、旋转角度。CPU 这边初始化了 100 万个方块的 vec3 positions and float initial rotation angles，也就是 100 万个 vec4 进 immutable storage buffer。其他就是`cmdDraw`除了传顶点数量，再传个 instance 数量。

vertex shader 里定义了 index 数组和 vertex 数组，还因为要在 shader 里自己做矩阵运算，定义了 translate 和 rotate，对应到 glm::的相关函数。注意这里用 uvec2 来代表 uint64 的数据类型：

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

文档见：[Buffer device address :: Vulkan Documentation Project](https://docs.vulkan.org/samples/latest/samples/extensions/buffer_device_address/README.html)  之前 imgui 的 demo 是直接把 VertexBuffer 放进 push constant。

vertex shader 其他部分就是继续拼 cube，算出 frag shader 要用的东西。

后一个 demo 是把矩阵计算给 compute shader 去做，矩阵的 buffer 有两个，在奇数偶数帧会轮换着使用，避免不必要的同步。注意 push constant 因为是 per VkPipelineLayout，所以 compute 和 graphics 都要 push 一次（这里是共享一样的结构，所以推的同一份数据）。

`cmdDispatchThreadGroups`来 dispatch compute shader，每个 local workgroup 设置为处理 32 个 mesh。`cmdBeginRendering`里传了 compute shader 的 buffer 作为 dependency，会自动去设置 barrier。

### Implementing an infinite grid GLSL shader & tessellationpipeline

灵感来源于：[Borderland between Rendering and Editor - Part 1 · Our Machinery](https://ruby0x1.github.io/machinery_blog_archive/post/borderland-between-rendering-and-editor-part-1/index.html)，最后也推荐了 [The Best Darn Grid Shader (Yet)](https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8)

讲了讲实现，主要是 shader 部分。Our grid implementation will adjust the number of rendered lines based on the grid LOD. We will switch the LOD when the number of pixels between two adjacent grid cell lines drops below a certain threshold, which is calculated in the fragment shader. 

vertex shader 里比较简单，就是变换一下坐标，the -1 to +1 points are scaled by the desired grid size. The resulting vertex position is then translated by the 2D camera position in the horizontal plane and, finally, by the 3D origin position.

fragment shader 更为复杂，calculates a programmatic texture that resembles a grid. The grid lines are rendered based on how quickly the UV coordinates change in screen space to avoid the Moiré pattern.

不继续研究了，就记一下有这个东西。



讲 tessellation 的，Hardware tessellation consists of two new shader stages in the graphics pipeline. The first stage is called the **tessellation control shader** (TCS), and the second is the **tessellation evaluation shader** (TES). Note 里说了 they may not be
as efficient as using mesh shaders on modern GPUs，哈哈...

不继续研究了，记一下推荐的 [OpenGL 4 Tessellation With Displacement Mapping | Geeks3D](https://www.geeks3d.com/20100804/test-opengl-4-tessellation-with-displacement-mapping/) 以及 GPU gems2 的 Chapter 7. Adaptive Tessellation of Subdivision Surfaces with Displacement Mapping

### Organizing mesh data storage

这章认真看！Let’s define a **LOD** as an index buffer of reduced size that uses existing vertices and hence can be used directly for rendering with the original vertex buffer. We define a **mesh** as a collection of all vertex data streams and a collection of all index buffers, one for each LOD. 

目前为了简单，都用 32bit 的 offset 和 index；所有数据都塞到一个 blob 里，就可以直接一个 fread 或者 mmap 把所有数据加载进来。这一节主要是专注于几何数据的处理。Mesh 的结构基于 offset 来做：

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

每个 lod 的 index buffer 不会单独存，都是从 offset 算出来的，`lodOffset`多存一个方便算最后一个 LOD 的 size，见`getLODIndicesCount`。MeshData 就很直接：

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

`VertexInput`就是 vertex stream 的格式，里面记录了`VkVertexInputAttributeDescription`和`VkVertexInputBindingDescription`要用的数据。注意这里其实没区分 vertex 数据要不要 interleave，代码上是都支持的，实际上需要 profile 了再看哪个好。

读取代码就很直截了当，有个练习是可以把 index buffer 和 vertex buffer 也合成一个。最后提了下这个适合存 static mesh，如果有比如 reload、异步加载等等的需求，最好还是分开存放。也提了一些后续篇章会处理的问题，是不是要把 material 也存进去，更进一步，texture 是不是也要存进去等等。

### Implementing automatic geometry conversion & Indirect rendering in Vulkan

吐槽了下第一版的书把 mesh 转换工具做成单独的，结果很多读者直接跑 demo 没跑转换工具，发现有问题，这一版做成了和 demo 一起，按需转 mesh。

Demo 里有个`convertAIMesh`的函数，把 assimp 的 mesh 转化为上一节介绍的格式。position 存储格式是 vec3，uv 是 half 的 vec2（感觉 16 bit unorm UVs 更好）用`packHalf2x16`打包，normal 用`packSnorm3x10_1x2`打包成 2_10_10_10_REV。用`put`函数往 vector 里写：

```cpp
template <typename T> inline void put(std::vector<uint8_t>& v, const T& value)
{
  const size_t pos = v.size();
  v.resize(v.size() + sizeof(value));
  memcpy(v.data() + pos, &value, sizeof(value));
}
```

`loadMeshFile`比较简单，给`aiImportFile`加了一大堆 flag 之后加载 mesh，然后初始化 meshData，调用`convertAIMesh`，最后算下 AABB。`saveMeshData`就更直接了。



Indirect rendering is the process of issuing drawing commands to the graphics API, where most of the parameters to those commands come from GPU buffers. We create a GPU buffer and fill it with an array of `VkDrawIndirectCommand` structures, then fill these structures with appropriate offsets into our index and vertex data buffers, and finally emit a single `vkCmdDrawIndirect()` call.

讲了一下`VkMesh`这个类，构造函数是大头，正常地准备一些 mesh 用的 index 和 vertex buffer 之后，开始准备 indirect buffer，注意这里的 std::launder 怪怪的，感觉似乎没必要：

```cpp
std::vector<uint8_t> drawCommands;
drawCommands.resize(sizeof(DrawIndexedIndirectCommand) * numCommands + sizeof(uint32_t));
// store the number of draw commands in the very beginning of the buffer
memcpy(drawCommands.data(), &numCommands, sizeof(numCommands));
DrawIndexedIndirectCommand* cmd = std::launder(reinterpret_cast<DrawIndexedIndirectCommand*>(drawCommands.data() + sizeof(uint32_t)));
```

indirect buffer 最开始存 draw command 的数量，虽然这个 demo 里用不到（给以后用的，可以让 GPU 来算 draw command 的数量然后存到 buffer 里）。`DrawIndexedIndirectCommand`和`VkDrawIndexedIndirectCommand`基本一模一样，结构是这样：

```cpp
struct DrawIndexedIndirectCommand {
  uint32_t count;
  uint32_t instanceCount;
  uint32_t firstIndex;
  int32_t baseVertex;
  uint32_t baseInstance;
};
```

shader 都相对简单，没用 pvp，和之前一样的 shader。

### Generating textures in Vulkan using compute shaders & Implementing computed meshes

迁移这个[Industrial Complex](https://www.shadertoy.com/view/MtdSWS)到 vulkan demo 里，当然首先要自己加一些输入输出：

```glsl
layout(local_size_x = 16, local_size_y = 16) in;
layout(set = 0, binding = 2, rgba8) uniform writeonly image2D kTextures2DOut[];
```

`image2D`代表了`kTextures2DOut`里面存的都是 texture 的 pixel，给 compute shader 写出图像用的，image 的 id 和当前时间就从 push constant 里拿。用`gl_GlobalInvocationID.xy / dim`拿到 uv 开始算，然后`imageStore`写回。算法上就是把`mainImage`的参数改了改，然后自己在`main`里写了个 5x5 的 antialiasing。

C++ 那边，texture 创建的时候要给`TextureUsageBits_Storage`，这样 compute shader 才能访问到；然后这个 texture 作为依赖传给了`cmdBeginRendering`，保证在 shader 里采样这个贴图之前 compute shader 已经跑完了，具体的函数在`transitionToShaderReadOnly`里，加 pipeline barrier 来转 image layout。

vertex 和 frag shader 则是基于这个[Rendering a fullscreen quad without buffers](https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/) 的一个全屏 shader:

```glsl
void main() {
  uv = vec2((gl_VertexIndex << 1) & 2, gl_VertexIndex & 2);
  gl_Position = vec4(uv * 2.0 + -1.0, 0.0, 1.0);
}
```

很聪明，只需要三个顶点，也不需要设置 vbo 啥的。



用 compute 写个这个[Torus knot - Wikipedia](https://en.wikipedia.org/wiki/Torus_knot)，我不去研究具体的算法，而是看 compute shader 怎么去生成这样的 mesh，A compute shader generates vertex data, including positions, texture coordinates, and normal vectors. This data is stored in a buffer and later utilized as a vertex buffer to render a mesh in a graphics pipeline.

index buffer 是 cpu 端生成的，不可变；vertex buffer 按一个顶点 12 个 float 来算（vec4 positions, vec4 texture coordinates, and vec4 normal vectors），这样不用考虑 padding 问题，注意 buffer 的 flag，既是 Vertex 也是 Storage；shader 那边也是用 specialization constant 来让 color 和 texture shader 共用代码。

这里很有趣的是，在最开始 compute 来写 vertex buffer 的时候，把 vertex buffer 也加到自己的依赖里，用 memory barrier 保证上一帧已经渲染完了，生成 texture 的 compute 同理，想做什么我理解，但是底层运作机制我还要想想。

**TODO：回头重新研究下 lightweightvk 的那套同步**

Since only one queue is being used, the device workload fully drains at each barrier, leaving no alternative tasks to mitigate this inefficiency. 好的例子可参考：[nvpro-samples/vk_timeline_semaphore: Vulkan timeline semaphore + async compute performance sample](https://github.com/nvpro-samples/vk_timeline_semaphore).

[Synchronization Examples · KhronosGroup/Vulkan-Docs Wiki](https://github.com/KhronosGroup/Vulkan-Docs/wiki/Synchronization-Examples)

## Chap6 Physically Based Rendering Using the glTF 2.0 Shading Model

### An introduction to glTF 2.0 physically based shading model

这里我主要靠[LearnOpenGL - Theory](https://learnopengl.com/PBR/Theory) + GPT 先理解了一轮，感觉自己大概明白了。

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

参考除了 PBR 那本书，还有 siggraph 的课[neil3d/awesome-pbr](https://github.com/neil3d/awesome-pbr)，[Physically Based Rendering in Filament](https://google.github.io/filament/Filament.md.html#overview/physicallybasedrendering)

### Rendering unlit glTF 2.0 materials

[glTF/extensions/2.0/Khronos/KHR_materials_unlit at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit)

designed with the following motivation: Mobile, Photogrammetry, Stylized materials

这里代码都很简单，注意一下根据 glTF specification，如果顶点颜色没有就用默认白色替代，texture coords 没有就用 000 替代。

### Precomputing BRDF look-up tables

How to precompute the Smith GGX BRDF look-up table (LUT). To render a PBR image, we have to evaluate the BRDF at each point on the surface being rendered, considering the surface properties and the viewing direction. The X-axis represents **the dot product between the surface normal vector and the viewing direction**, while the Y-axis represents the surface **roughness** values 0...1. Each texel holds three 16-bit floating point values. The first two values represent **the scale and bias to F0**, which is the specular reflectance at normal incidence. The third value is utilized for the sheen material extension.

讲了下为什么要与计算，**G 和部分的 F 是只取决于 v，h 和 Roughness 的**，然后我们发现 n 和 v 永远是不会分开的，所以可以当成一个，用 n*v

然后讲与计算的理论基于[Chapter 20. GPU-Based Importance Sampling | NVIDIA Developer](https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-20-gpu-based-importance-sampling)，推荐了 https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf

cpp 那边比较简单，就是起一个 compute，算好贴图内容的 buffer，wait 等计算完毕，然后写回磁盘。

shader 里面代码比较多：

* The R and G channels are used for GGX BRDF LUT, the third channel is used for Charlie BRDF LUT which is required for the Sheen material extension.
* `hammersley2d`基于[Points on a Hemisphere](https://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html)，关键词 van der Corput sequence
* `random`基于[Improvements to the canonical one-liner GLSL rand() for OpenGL ES 2.0 | Byte Blacksmith](https://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/)
* `importanceSample_GGX`基于 Unreal 的[2013SiggraphPresentationsNotes-26915738.pdf](https://cdn2-unrealengine-1251447533.file.myqcloud.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf)
* 算 Sheen material 的时候，`Ashikhmin`和`D_Charlie`基于 filament 的 https://github.com/google/filament/blob/f096c4d8de9f72e38f3ac1b0bbc176fb094994f7/shaders/src/surface_brdf.fs#L94
* `BRDF`就是根据那些 helper 函数算 LUT 的值

最后提到 ue 有个不用在 mobile 上采这个预计算的贴图的办法，来自 [Physically Based Shading on Mobile](https://www.unrealengine.com/en-US/blog/physically-based-shading-on-mobile)

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

The second part of the split sum approximation necessary to calculate the glTF 2.0 physically-based shading model comes from the irradiance cube map which is precalculated by convolving the input environment cube map with the GGX distribution of our shading model. 这里说的有点不够清楚，应该是 pre-filtered environment map，叫 irradiance cube map 也行但不够有指向性，irradiance map 是给 diffuse 部分用的。

实现基于 [glTF-Sample-Renderer/source/shaders/ibl_filtering.frag at 3dc1bd9bae75f67c1414bbdaf1bdfddb89aa39d6 · KhronosGroup/glTF-Sample-Renderer](https://github.com/KhronosGroup/glTF-Sample-Renderer/blob/3dc1bd9bae75f67c1414bbdaf1bdfddb89aa39d6/source/shaders/ibl_filtering.frag)

先讲 cpp 这边，`prefilterCubemap`画一个全屏三角形，让 fragment shader 干活儿，然后保存。

shader 那边：

* `uvToXYZ` converts a cubemap face index and vec2 coordinates into vec3 cubemap sampling direction.
* `filterColor` does the actual Monte Carlo sampling，理论部分见 [Image Based Lighting with Multiple Scattering | Bruno Opsenica's Blog](https://bruop.github.io/ibl/)

The process of importance sampling can introduce visual artifacts. One way to improve visual quality without compromising performance is by utilizing hardware-accelerated mip-mapping for swift filtering and sampling. 见 [Final_sap_0073.pdf](https://cgg.mff.cuni.cz/~jaroslav/papers/2007-sketch-fis/Final_sap_0073.pdf) 和 [Chapter 20. GPU-Based Importance Sampling | NVIDIA Developer](https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-20-gpu-based-importance-sampling)

how to convert cube maps between different formats: [Converting to/from cubemaps](https://paulbourke.net/panorama/cubemaps/index.html)

### Implementing the glTF 2.0 metallic-roughness shading model

讲怎么实现一个最简单的 metallic-roughness shading model 了，简单的介绍见 [KhronosGroup/glTF-Sample-Viewer at glTF-WebGL-PBR](https://github.com/KhronosGroup/glTF-Sample-Viewer/tree/glTF-WebGL-PBR)

讲代码了，先介绍了下一些 helper function：

* `GLTFGlobalSamplers`包含三个 sampler，分别是 clamp，wrap 和 mirror
* `EnvironmentMapTextures`负责存储所有的 IBL environment map texture 和 BRDF 的 LUT
* `GLTFMaterialTextures`则包含了所有渲染要用到的贴图，`loadMaterialTextures`负责加载这些贴图
* `MetallicRoughnessDataGPU`包含了一些材质信息，metallicRoughnessNormalOcclusion 四合一，一是为了性能，而是对其方便；emissiveFactor 和 alphaCutoff 也合成一个 vec4 了；其他的就是一些 uint32_t 的 id，以及 alphaMode，决定怎么去理解 alpha 值；`setupMetallicRoughnessData`负责填充这个结构体

然后开始`main`函数：

* `Vertex`格式定义在了 UtilsGLTF.h 里，注意不仅有 uv0 还有 uv1，uv1 一般是给 lightmap 或者 reflection map 用的；结尾还有 2 个 float 当 padding 有，一个 Vertex 正好 64byte
* 然后加载贴图，加载 IBL 相关的资源，把 material 的数据塞进 gpu buffer 里，然后传 buffer device address 给 shader；push constant 一共传三个指针进去，第一个是 PerDrawData 的指针，里面包含 mvp、material id 等数据，第二个是刚提到的 material 数组，第三个是 environments 相关的数组

然后就到了大头的 shader 部分，这边说 vertex shader uses programmable-vertex-pulling，看代码不是这样，还是走的传统的绑定。

fragment shader 是干活儿的部分：

* `Inputs.frag`里面一堆 helper 函数和一些 input 声明，都比较简单
* `main`里面就是上来采样一堆贴图，然后处理是 normal：normal 除了 pixel 自己带一个世界空间的，normal map 还会采样出来一个切线空间的，`perturbNormal`里面会算下 TBN 矩阵（根据 uv 和原始的 normal）然后把 normal map 采样出来的值变换回世界空间（见 [Followup: Normal Mapping Without Precomputed Tangents](http://www.thetenthplanet.de/archives/1180)）；里面调用了`cotangentFrame`，creates tangent space based on the vertex position p, the per-vertex normal vector N, and uv texture coordinates，这里也提了 This is not the best way to get the tangent basis, as it suffers from uv mapping discontinuities, but it’s acceptable to use it in cases where per-vertex precalculated tangent basis is not provided
* 调用`calculatePBRInputsMetallicRoughness`来填充`PBRInfo`；然后就是算 IBL 贡献的 specular 和 diffuse color 的值，`getIBLRadianceContributionGGX` 和 `getIBLRadianceLambertian`；最后加上一个光源的贡献`calculatePBRLightContribution`
* 然后把 AO 的贡献也算上去，加上自发光项，做一下 gamma 校正，结束

然后是一些细节部分，基于[KhronosGroup/glTF-Sample-Viewer at glTF-WebGL-PBR](https://github.com/KhronosGroup/glTF-Sample-Viewer/tree/glTF-WebGL-PBR)：

* `PBRInfo`里面存了当前 pixel 的一些几何性质，比如 NdotL，NdotV 之类，以及材质的性质
* Calculation of the lighting contribution from an Image-Based Light source is split into two
  parts – diffuse irradiance and specular radiance. 
  * `getIBLRadianceLambertian`基于[Image Based Lighting with Multiple Scattering](https://bruop.github.io/ibl/#single_scattering_results)，注意这不止是去采样环境的 Irradiance map，还考虑了镜面反射修正和 Fresnel 能量损失补偿
  * `getIBLRadianceContributionGGX`使用 prefiltered mipmap 做 roughness 层级选择，查 BRDF LUT 进行计算等，注意这里还有一个传进来的`specularWeight`
* `diffuseBurley`来自[s2012_pbs_disney_brdf_notes_v3.pdf](https://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v3.pdf)，相比仅仅是 Lambert Diffuse，还考虑了 roughness 对边缘变暗的影响
* 用`specularReflection`算 F（注意这里用的是 F90-F0，没有直接化简为 F90=1），`geometricOcclusion`算 G，`microfacetDistribution`算 D
* `calculatePBRInputsMetallicRoughness`：
  * 里面会把 roughness 最小值 clamp 到 0.04，假设认为就算是 dielectrics 也会至少有 4% 的高光反射，然后平方一下，说会让 roughness 的分布更线性 [Physically Based Shading At Disney](https://disneyanimation.com/publications/physically-based-shading-at-disney/)
  * For a typical incident reflectance range between 4% to 100%, we should set the grazing reflectance to 100% for the typical Fresnel effect. For a very low reflectance range on highly diffuse objects, below 4%, incrementally reduce grazing reflectance to 0%  默认我们希望 F90 = 1.0 来符合 Fresnel 行为，但对一些反射极低（F₀ < 0.04）的材质人为降低 F90，避免它们在大角度时出现不合逻辑的高光。
* `calculatePBRLightContribution`计算 The lighting contribution from a single light source，color = NdotL * lightColor * (diffuseContrib + specContrib)

最后推荐去看 Unreal 的 shader 代码：[UnrealEngine/Engine/Shaders/Private at release · EpicGames/UnrealEngine](https://github.com/EpicGames/UnrealEngine/tree/release/Engine/Shaders/Private)

### Implementing the glTF 2.0 specular-glossiness shading model

The specular-glossiness extension is a **deprecated** and archived in the official Khronos repository.  原因 [Converting glTF PBR materials from spec/gloss to metal/rough](https://www.donmccurdy.com/2022/11/28/converting-gltf-pbr-materials-from-specgloss-to-metalrough)

后面会讲这个，A new glTF specular extension, **KHR_materials_specular**, that replaces this older specular-glossiness shading model and show how to convert from the old model to the new extension.

特意提了给 material struct 加字段要注意对齐，We need it to **keep the binary representation of this structure aligned with GLSL shader inputs**. The GLSL st430 layout and alignment rules are not complex but might not be correctly implemented by different hardware vendors, especially on mobile devices. In this case, manual padding is just an easy and good enough way to fix compatibility between all GPUs. 对齐见[Vulkan-Guide/chapters/shader_memory_layout.adoc at main · KhronosGroup/Vulkan-Guide](https://github.com/KhronosGroup/Vulkan-Guide/blob/main/chapters/shader_memory_layout.adoc)

shader 里按照这个改改就行 [KHR_materials_pbrSpecularGlossiness | glTF](https://kcoley.github.io/glTF/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness/)

## Chap 7Advanced PBR Extensions

Our GLSL shaders code is based on the official Khronos Sample Viewer and serves as an example implementation of these extensions.

### Introduction to glTF PBR extensions

the glTF 2.0 list of ratified extensions specification: [glTF/extensions/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md)  说 layer 机制和 adobe 的有点像 [Autodesk/standard-surface: White paper describing the Autodesk Standard Surface shader.](https://github.com/Autodesk/standard-surface)

Layering mimics real-world material structures by **stacking multiple layers, each with its own light-in-teracting properties**. To maintain physical accuracy, the first layer, called the base layer, should be either fully opaque (like metallic surfaces) or completely transparent (like glass or skin).  You can think of it as **a statistically weighted blend of two different materials**, where you combine a certain percentage of material A with a certain percentage of material B.

这一章的 main.cpp 都很简单，只是简单加载模型，调用下 gltf 相关的函数，实现都在`GLTFContext`里。

`renderglTF`有个 rebuildRenderList 参数，用来 signal that model-to-world transformations of glTF nodes should be rebuilt

* 先调用`buildTransformsList`负责 build node transformations and collect other nodes data，把相关的数据（主要是各种 id）塞到 gltf.transforms 里，然后 transparentNodes、transmissionNodes 和 opaqueNodes 里记录当前 mesh 在 gltf.transforms 里的 index，gltf.transforms 直接做个 host visible 的 buffer
* 然后调用`sortTransparentNodes`，负责对不透明物体排序保证渲染正确
* 准备 per frame 的 uniform 和 push constant，push constant 里都是 buffer address
* 开始 opaque pass（中间跳过了一些代码），没用 vertex pulling 而是走的传统的那套，这里有个小技巧是把`transformId`当成`vkCmdDrawIndexed`的`firstInstance`传进去了，会在 shader 里变为`gl_BaseInstance`，用这个值来索引到该 mesh 的 transfrom，好处是不用每个 drawcall 都更新一遍 push constant，性能好
* 先画 opaque，然后开始 transmission：首先 screen copy，Some transparent nodes may require a screen copy to render various effects, such as volume or index-of-refraction，再一个 for 循环开始画 transmission；最后 transparent，然后 round robin 更新下 screen copy 要用的 texture

### Implementing the KHR_materials_clearcoat extension

[glTF/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)

The KHR_materials_clearcoat extension adds a clear, reflective layer on top of another material or surface. This layer reflects light both from itself and the layers underneath.

The specular BRDF for the clearcoat layer uses the specular term from the glTF 2.0 Metallic-Roughness material. The microfacet Fresnel term is calculated **using the NdotV term instead of the VdotH term**, effectively ignoring the microscopic surface orientation within the clearcoat layer. 算 F 的时候，不用半角向量了，而是直接 N dot V

讲实现的部分，首先是`GLTFMaterialDataGPU`加上对应的字段，然后加载的时候加载对应的贴图即可。

大头在 shader 部分，The clearcoat factor and roughness are packed into a texture as r and g channels respectively

frag 里面会判断是不是 clearcoat 的材质（通过按位与判断），F0 是走的 IOR 计算的，后文会提到，F90 直接是 1。

用`getIBLRadianceGGX`算好 clearcoat 的环境光的镜面高光（与算主材质的对应项的`getIBLRadianceContributionGGX`几乎一样），复用`F_Schlick`算 clearcoat 的 Fresnel 项，然后再最后才叠加上 clearcoat 的材质效果（晚于 emissive）：

```cpp
vec3 color = specularColor + diffuseColor + emissiveColor + sheenColor;
color = color * (1.0 - pbrInputs.clearcoatFactor * clearcoatFresnel) + clearCoatContrib
// 应该等价文档里的：
// coated_material = mix(base_layer, clearcoat_layer, clearcoatFactor * clearcoatFresnel);
```

### Implementing the KHR_materials_sheen extension

[glTF/extensions/2.0/Khronos/KHR_materials_sheen/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_sheen/README.md#reference)

代码上倒都是差不多，读帖图，读配置，shader 里面一堆 helper 函数。注意如果读不到贴图，就给个 1x1 的白色贴图，这样可以简化 shader 代码，性能也没有很受影响，1x1 的贴图也可能能在 cache 里。

The Sheen extension needs a different BRDF function，主要实现在`getIBLRadianceCharlie`里，用 Charlie BRDF + IBL 来计算 glTF 的 sheen 层贡献，舍弃了 Fresnel 和几何项（注意 BRDF LUT 采样的是 b，第三项，给 sheen 用的）。生成 BRDF LUT 时候的处理前文提过。

关于计算，The Sheen extension provides its own roughness value, so no perceptual adjustments are needed. 直接用 roughness 即可。All we have to do here is to multiply sheenRoughnessFactor by the total number of mip-levels mipCount to determine the correct mip-level, sample the precalculated environment map, and then multiply it by the BRDF and sheenColor.  最终计算，还算上了 AO occlusion：

`sheenColor = lights_sheen + mix(sheenColor, sheenColor * occlusion, occlusionStrength);`

### Implementing the KHR_materials_transmission extension

[glTF/extensions/2.0/Khronos/KHR_materials_transmission/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_transmission/README.md#reference)

The `KHR_materials_transmission` enables the creation of transparent materials that absorb, reflect and transmit light depending on the incident angle and the wavelength of light. **Infinitely thin materials without refraction, scattering, or dispersion.** A specular **BTDF** (Bidirectional Transmission Distribution Function) : Uses the same Trowbridge-Reitz distribution as the specular BRDF (Bidirectional Reflectance Distribution Function) but samples along the view vector instead of the reflection direction.

cpp 代码部分，读取部分没啥可说，主要是更详细说了下篇章开始介绍的`renderGLTF`函数的改动，渲染 transmission 节点需要渲染 opaque 节点之后的渲染结果，所以需要 create a copy of the rendered surface and use it as input for the transmission nodes. 那就需要先把 swapchain 的 texture copy 一份，然后也生成一下 mipmap，记得把这个 texture 作为下一个 renderpass 的 dependency

**TODO：弄清楚这里 image barrier 的用法**

注意，画 transmission 的时候没有用 alpha blending，仍然走的 opaque 的 pipeline；最后是从后到前画 transparent node

shader 部分的改动，纯就看 transmission 的话，would be similar to GGX/Lambertian, but instead of using the reflection vector, we use the dot product NdotV. 这边没详说，和 KHR_materials_volume 一起看比较好。

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

`getIBLVolumeRefraction`和之前的 getIBL 系列函数一样的作用，首先调用`getVolumeTransmissionRay`拿到最终折射的 vector；然后把这个 vector 转到 NDC 空间，然后去采样 framebuffer 上对应的背景色；然后正常计算 GGX BRDF，对没被反射的光 apply 一下 volume attenuation：`return (1.0 - specularColor) * attenuatedColor * baseColor`。`applyVolumeAttenuation`函数基于[Beer–Lambert law - Wikipedia](https://en.wikipedia.org/wiki/Beer–Lambert_law)。

### Implementing the KHR_materials_ior extension

A higher IOR means more refraction. For instance, the IOR of air is nearly 1, water has an IOR of about 1.33, and glass has an IOR of around 1.5. This value is used in conjunction with the KHR_materials_transmission extension to calculate the refraction direction of light rays when passing through the material.

[glTF/extensions/2.0/Khronos/KHR_materials_ior/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_ior/README.md#interaction-with-other-extensions)

 `dielectric_f0 = ((ior - 1)/(ior + 1))^2`

之前已经带到 IOR 的概念了，这边就简单讲了讲。

### Implementing the KHR_materials_specular extension & KHR_materials_emissive_strength

Addresses compatibility issues and offers the functionality of `KHR_materials_pbrSpecularGlossiness` without compromising the physical accuracy of the Metallic-Roughness PBR model.

[glTF/extensions/2.0/Khronos/KHR_materials_specular/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_specular/README.md)

The `specularColor` parameter introduces color variations into the specular reflection. It is integrated into the Fresnel term, influencing the specular reflectance at different viewing angles. At normal incidence, the specular color directly scales the base
reflectance (F0), while at grazing angles, the reflectance approaches 1.0 regardless of the specular color. To maintain energy conservation, the maximum component of the specular color is used to calculate the scaling factor for the Fresnel term, preventing excessive energy in the specular reflection.

看着就是多俩参数，也没有很复杂的计算，算 f0 的时候额外考虑`getSpecularColorFactor`，用 PBRInfo 里多了一个`specularWeight`来调节。

Before the introduction of the KHR_materials_emissive_strength extension, it was difficult to control the intensity of a material’s light emission. [glTF/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md at main · KhronosGroup/glTF](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md)

### Extend analytical lights support with KHR_lights_punctual

其实就是给 shader 加上正经的光源支持，和之前一样，`LightDataGPU`的 gpu address 走 push constant 送进 shader 里。很暴力地遍历光源，一个个算，实现参考了 [glTF™ 2.0 Specification Appendix B: BRDF Implementation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#appendix-b-brdf-implementation)。PBR 那边的俩函数是对直接光照计算的最基础的 BRDF 表达，`getBRDFLambertian`漫反射，`getBRDFSpecularGGX`算镜面反射，F * Vis * D，Vis 已经合并了 G 项和 1/(4 N·L N·V)

渲染有点问题，提了 issue：[Rendering bug in Ch07_Sample08_Analytical · Issue #37 · PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/37)  其实之前看着有些 demo 关了 transmission 也会有问题，不知道是不是同样的原因。

## Chap8 Graphics Rendering Pipeline

### Scene graph & Loading and saving a scene graph & Implementing transformation trees

大肆批判了用 OOP 来表达 Scene Graph，基本上还是基于 index 和数组，数组可以直接丢进 GPU

结构上基于这个 [Left-child right-sibling binary tree - Wikipedia](https://en.wikipedia.org/wiki/Left-child_right-sibling_binary_tree)，plain old data

```cpp
struct Hierarchy {
  // parent for this node (or -1 for root)
  int parent = -1;
  // first child for a node (or -1)
  int firstChild = -1;
  // next sibling for a node (or -1)
  int nextSibling = -1;
  // last added node (or -1), speed up the process of adding new child nodes to a parent
  int lastSibling = -1;
  // cached node level, depth of the node from the root of the scene graph
  int level = 0;
};
```

Mesh 和 Material 和 Node 的对应关系是用哈希表存的，Additionally, the Mesh and Material objects for each node can be stored in separate arrays. However, if not all nodes have a mesh or material, we can utilize a sparse representation, such as a hash table, to map nodes to their corresponding meshes and materials. 提了下如果基本所有 node 都有 mesh 和 material，还是选数组这种 dense 的数据结构比较好。scene 里面的 mesh id 是去很久以前提到的 meshData 里拿，其实是分开的结构。

`traverse`函数用来从 assimp 生成自己的 scene 格式，注意 Each of the meshes is assigned to the newly created subnode. Since we use subnodes only for attaching meshes, we set local and global transformations to identity. 这里 node 既可以代表 node 附带的 mesh（一个 node 一个 mesh），也可以代表 Hierarchy 上的子 node。

`addNode`复杂一些，要处理好 parent、child、sibling 这些的赋值：If we have a parent node, we update its first child reference and, potentially, the next sibling reference of another node. If the parent node has no children, we simply set its firstChild field. Otherwise, we need to traverse the siblings of this child to find the appropriate place to add the next sibling. 

load 系列函数都很直观，这也是 pod 的好处，loadMap 因为都是 uint 所以也很简单。

It is always better to **separate operations like rendering, scene traversal, and transform calculation, and to store related data close together in memory**. Additionally, processing similar tasks in large batches helps. This separation becomes even more critical as the number of nodes grows.

为了减少无用的计算，Scene 里有个`vector<int> changedAtThisFrame[MAX_NODE_LEVEL]`，专门来标记需要重新计算 transform 的 node。更进一步的优化可以去掉 mark 过程中的递归，见 [Sergey Kosarevsky on X: "@iHR4K 1/24 https://t.co/yVWHRFbx3J" / X](https://x.com/CorporateShark/status/1840797491140444290)

`recalculateGlobalTransforms`先处理 root 情况，root 没有 parent，这样后续处理就可以少个 if 来判断有没有 parent。更进阶一些可以用 compute 在 GPU 上做，反正是大数组，见 Handling Massive Transform Updates in a SceneGraph by Markus Tavenrath.

demo 牛逼一些，还可以点选 node 来换材质上的贴图。

### Implementing a material system & Implementing automatic material conversion

We need data structures to represent our materials in both CPU memory, for quick loading and saving to a file, and in a GPU buffer. GPU 上还是用之前的`GLTFMaterialDataGPU`结构。Material 本身的结构比较简单，就是 texture 其实是指向 MehsData::textureFiles array 中的 index，可以用来做 texture 去重，注意 cpu 上的 texture index 可以为 -1 表示不存在 texture，gpu 上就用的 unsigned，但是有 dummy texture 可以凑数。里面还有个 flag，可以做点不同 object 的区分。正式介绍了 MeshData 中的 materials 和 textureFiles 数组。

讲了下`convertAIMaterial`，然后提示说这是只给第八章用的 this function was manually tweaked to load Bistro materials from .obj - use UtilsGLTF.h for anything else. Opacity map 会单独处理，We pack the opacity maps into the alpha channel of our albedo textures.  `addUnique`先找有没有重复的，有就返回，没有就加到最后。

`convertAndDownscaleAllTextures`负责处理贴图，`convertTexture`里还是之前做的那套，enforce that the loaded image is in RGBA format, even if there is no opacity information，一通操作存成 ktx 文件，注意这里会把 opacity mask 值写到 alpha channel。这里 mipmap 还是自己生成的，用的`stbir_resize_uint8_linear`函数，rescale an image without significant loss of quality. 

### Using descriptor indexing and arrays of textures in Vulkan

Descriptor indexing allows for **the creation of unbounded descriptor sets** and **the use of non-uniform dynamic indexing to access textures within them**. This enables materials to be stored in shader storage buffers, with each one referencing the necessary textures using integer IDs. These IDs can be retrieved from buffers and used directly to index into the appropriate descriptor set containing all the textures needed by the application. 

有一个还不错的爆炸 demo，可以用 timeline 控制爆炸渲染帧。渲染是按 quad 渲染的，texture index 用 push constant 推进去。

### Implementing indirect rendering with Vulkan & Putting it all together into a scene editing application

The key idea is to **organize all scene data into arrays that shaders can access using integer IDs, eliminating the need for any API state changes during rendering**. The indirect buffer generated by the application contains an array of fixed-size structs, with each struct holding the parameters for a single draw command.

讲了下`convertToGPUMaterial`，`using TextureCache = std::vector<Holder<TextureHandle>>`是一个 id => handle 的映射，id 是 cpu material system 里面的 texture id，handle 则是 lvk 里的 handle，给 gpu 用。

大头在 VkMesh 这个类，which handles all aspects of scene rendering. It is responsible for storing GPU buffers for geometry, transformations, materials, and other auxiliary data. 

```cpp
struct DrawIndexedIndirectCommand {
  uint32_t count;
  uint32_t instanceCount;
  uint32_t firstIndex;
  int32_t baseVertex;
  uint32_t baseInstance;
};

struct DrawData {
  uint32_t transformId;
  uint32_t materialId;
};
```

VKMesh 的构造函数负责初始化那些 buffer，drawCommands 和 drawData，Note that the baseInstance parameter holds the index of a DrawData instance, and the corresponding DrawData instance contains the transform ID and material ID for that mesh.

Draw 里面 uses a single push constant value for the entire scene.  We can render an entire scene with thousands of meshes, each using a distinct material, all with just one indirect draw call. 

最后整体过了下 Scene graph 那个 demo，主要讲 imgui 的一些 UI 上的，包括用了[CedricGuillemet/ImGuizmo: Immediate mode 3D gizmo for scene editing and other controls based on Dear Imgui](https://github.com/CedricGuillemet/ImGuizmo)。

### Deleting nodes and merging scene graphs

主要是介绍`deleteSceneNodes`和`mergeNodesWithMaterial`这两个函数。  

从 scene graph 删除 node 用了很聪明的做法：use the std::stable_partition() algorithm to move all nodes marked for deletion to the end of the array. Once the nodes to be deleted are relocated, we can simply resize the container to remove them from the active scene. This method ensures that we maintain the relative order of the nodes that are not deleted, while efficiently cleaning up those that are.

`eraseSelected`来自[How to remove non contiguous elements from a vector in c++](https://stackoverflow.com/questions/64149967/how-to-remove-non-contiguous-elements-from-a-vector-in-c/64152990#64152990)，从一个 std::vector 中删除指定索引位置的一系列元素。When deleting a node, all of its children must also be marked for deletion. We achieve this by using a recursive routine that iterates over all the child nodes, adding each node’s index to the deletion array.  `addUniqueIdx`因为要保持内部顺序，所以还是用了 binary search. 这里麻烦的就是原来是个紧凑的数组，删完还要是个紧凑的数组，而且 index 会变，所以`deleteSceneNodes`里还做了个 a linear mapping table that maps the old node indices to the new ones. 

The deleteSceneNodes() routine helps us compress and optimize the scene graph, while also merging multiple meshes with the same material.如果合并了 mesh，那就要去改变 scene nodes，删除对应的索引到旧的 mesh 的节点。

`mergeNodesWithMaterial`因为 scene 本身的性质，只 merge 最高的 lod 级别，而且假设了所有 merge 起来的 mesh 都有一样的 transformation。具体实现直接略过，需要再看。整体上感觉确实是不错的设计，runtime 做这些还算有点重了，但是在资源处理阶段就做完还算挺好。

### Rendering large scenes

之前介绍合 scene 就是因为 Bistro 场景会有两个 mesh，exterior.obj 和 interior.obj. exterior.obj contains a tree with over 10K individual leaves, each represented as a separate object, so we merge them into larger submeshes for improved performance. 反正处理的这边就是一通 merge，mergeScenes，mergeMeshData，mergeMaterialLists. 本章最后详细讲了这些函数。

这边 skybox 渲染的时候，给的`mvp = proj * mat4(mat3(view))`，去掉了 view 矩阵的 translation 部分构造的。

整个 Bistro 场景就个 indirect draw 搞定了，shader 那边有一些镜像 cpu 这边的数据结构，然后是 vertex shader，前面提过 firstInstance 其实是 draw data id:

```glsl
void main() {
  mat4 model = pc.transforms.model[pc.drawData.dd[gl_BaseInstance].transformId];
  gl_Position = pc.viewProj * model * vec4(in_pos, 1.0);
  uv = vec2(in_tc.x, 1.0-in_tc.y);
  normal = transpose( inverse(mat3(model)) ) * in_normal;
  vec4 posClip = model * vec4(in_pos, 1.0);
  worldPos = posClip.xyz/posClip.w;
  materialId = pc.drawData.dd[gl_BaseInstance].materialId;
}
```

fragment shader 更为复杂一些。

先从 alpha test 开始讲，这边用 dithering 去模拟的 alpha transparency：[Alex Charlton — Dithering on the GPU](https://alex-charlton.com/posts/Dithering_on_the_GPU/).  这里有个小 trick，scale the alpha-cutoff value using fwidth() to achieve better anti-aliasing for alpha-tested geometry：[Anti-aliased Alpha Test: The Esoteric Alpha To Coverage | by Ben Golus | Medium](https://bgolus.medium.com/anti-aliased-alpha-test-the-esoteric-alpha-to-coverage-8b177335ae4f) 

A more accurate method for transforming normal vectors: [Transforming Normals - Eric Lengyel](https://terathon.com/blog/transforming-normals.html). shader 光照计算比较简单，还没有即成 Chap6-7 介绍的 PBR shader。

## Chap 9 glTF Animations

我其实一直对 animation（尤其是 skeletal animations）一窍不通，也就简单看过 [Hands-On C++ Game Animation Programming (豆瓣)](https://book.douban.com/subject/35616903/) 还忘光了。推荐了 gltf 的文档：[glTF™ 2.0 Specification animation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#animations)

我个人理解，输入是模型空间坐标系下的顶点坐标（T-Pose 下的静态位置），输出也是模型空间中。
$$
M_{skin_i} = M_{animation_i} \times M_{bind\_pose\_inverse_i}
$$

* Inverse Bind Matrix：将一个在模型空间的点，变换到某个特定骨骼的骨骼空间中去。每个骨骼都有自己唯一的一个矩阵，这个矩阵在整个动画过程中是不变的。It's called a "bind matrix" because it's directly related to the "bind pose" of the character. The "bind pose" is the default, neutral stance (like a T-pose or A-pose) where the 3D model's skin is formally attached, or "bound," to the skeleton. [Maya Help | Bind pose | Autodesk](https://help.autodesk.com/view/MAYAUL/2025/ENU/?guid=GUID-36808BCC-ACF9-4A9E-B0D8-B8F509FEC0D5)
* 当前帧动画矩阵 (Current Animation Pose Matrix)。这个矩阵代表在动画的某一帧，某个骨骼的最终朝向和位置。这个矩阵是将一个点从该骨骼的局部空间变换回模型空间。重要的是，这个矩阵已经包含了所有父骨骼的变换（一路遍历骨骼树算出来的）。代表了它在当前动画帧下，在整个模型空间中的最终姿态。这个矩阵是每一帧都在变化的。
* M_skin 代表了一个完整的“位移”变换：从绑定姿势到当前动画姿势的净变化。先算出顶点相对于骨骼的“固定”的相对坐标，然后让运动后的骨骼带着这个“相对坐标”去到它在世界中的新位置。

$$
V_{final} = \sum_{i=1}^{n} (w_i \times (M_{skin_i} \times V_{bind}))
$$

书里讲的是 the final global transform for a glTF bone is constructed as follows：`globalTransform(bone) = globalTransform(animation(root)) * ... * globalTransform(animation(parent)) * localTransform(animation(bone)) * invBind(bone)` 感觉怪怪的，其实逻辑差不多，不过 glTF 里储存的动画数据，是每一根骨骼相对于其父骨骼的局部变换，所以一路乘（最后代码里也是一次）。 

### Implementing the glTF animation player & Doing skeletal animations in compute shaders

Skeletal animations imply moving vertices based on the weighted influence of multiple matrices, which represent a skeleton of bones. Each bone is represented as a matrix that influences nearby vertices based on its weight. In essence, skinning requires bones, a hierarchy of matrices, and weights.

用 compute 做 skinning：we specify all mutable buffers as dependencies in the dispatch command. This ensures that LightweightVK places all necessary Vulkan buffer memory barriers before and after buffers are used, based on their usage flags and previous use.  We need to use barriers in this case to ensure the buffer for the previous frame is fully processed before we start preparing the next one. The size of our vertex buffer is always padded to 16 vertices, so we don’t have to worry about alignment.

讲了下 animation.comp，正常算 morph 和 skinning，注意 normal 的算法：[Transforming Normals - Eric Lengyel](https://terathon.com/blog/transforming-normals.html)

### Introduction to morph targets & Loading glTF morph targets data & Adding morph targets support & Animation blending

A morph target is a deformed version of a mesh. In glTF, morph targets are used to create mesh deformations by blending different sets of vertex positions, or other attributes, like normal vectors, according to specified weights. 

代码快速略过... In fact, skinning and morphing animations often complement each other, allowing for more dynamic and expressive character movements. 

Animation blending 主要是 updateAnimationBlending 函数，里面会更新`glTF.matrices`，根据位移、旋转、缩放分别插值。

## Chap10 Image-Based Techniques

后处理，好好学！The idea is to render the scene to an offscreen image and then apply these effects, which is why they are referred to as“image-based”techniques.

### Implementing offscreen rendering in Vulkan & Implementing full-screen triangle rendering

How to render directly into specific mip levels of an image and access each mip level individually. Demo 展现了一个多面体（[Regular icosahedron - Wikipedia](https://en.wikipedia.org/wiki/Regular_icosahedron)），每个 mipmap 层级都是不同颜色的，可以展示 gpu 对 mipmap 的选择和过度（imgui 那边的代码要改改才能看到全部的 mipmap，默认的 imgui 窗口是固定位置的，而且不给拖动）。

创建完 texture 之后，用`createTextureView`给每一个 mip level 都单独创建一个 textual view，然后用 off screen rendering 往每个 mip level 写颜色。提了一嘴 We don’t need any additional Vulkan image layout transitions or memory barriers here because our command buffer submissions are strictly ordered. Moreover, the render-to-texture code in cmdEndRendering has already transitioned the texture to
`VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL` after rendering.

讲`createTextureView`，creates a copy of the VulkanImage wrapper object from the existing texture and marks it as non-owning. 注意生命周期，the texture view remains valid only as long as the original texture is still in place. 提了下 HDR 的时候会用到 One useful feature of Vulkan image views is the ability to swizzle the components of a texture before returning the samples to the shader. 最后要注意`getOrCreateVkImageViewForFramebuffer`函数，there’s another set of VkImageView objects maintained inside VulkanImage, are lazily created from the member function cmdBeginRendering().

后面讲了下 Chap5 提过的一个 how to render a full-screen quad by generating geometry directly in a vertex shader. https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers

n alternative to the full-screen quad rendering approach, Chap5 的 compute 生成 texture 那节演示过，perform a full image compute pass.

### Implementing shadow maps

This requires rendering the scene into an offscreen depth framebuffer.

PerFrameData：

```cpp
struct PerFrameData {
    mat4 view;
    mat4 proj;
    // the product of the light’s view and projection matrices
    // multiplied by the scale-bias matrix
    // light’s clip-space xy coordinates are in -1…+1, while the texture coordinates are sampled in 0…1
    mat4 light; 
    vec4 lightAngles; // the cosines of our spotlight’s inner and outer angles
    vec4 lightPos; // the light’s position in world space
    uint32_t shadowTexture;
    uint32_t shadowSampler;
};
```

shadowmap texture 是 16bit 的 (VK_FORMAT_D16_UNORM)，sampler 打开了 depthCompareEnabled. Shadowmap 展示为红色是因为 depth 图被作为只有 R 通道的图展示了。

其实 shadow pass 也不需要 fragment：The fragment shader for shadow map rendering is just empty because we do not output any color information, only the depth values.

`vtx.shadowCoords = pc.perFrame.light * pc.model * vec4(pos, 1.0);` 在 vertex shader 里，vertex position is first transformed into the light’s coordinate system, then into normalized device coordinates, and finally, into texture coordinates. `light`见上文注释，直接一步变换到光源空间的纹理坐标。

fragment shader 里做了 3 * 3 的 PCF: Note that we average not the results of depth map sampling at adjacent locations but the results of multiple comparisons between the depth value of the current fragment (in the light space) and the sampled depth values obtained from the shadow map. 

`shadow`里面先做透视除法（硬件只会对一个特殊的、预定义的输出变量 `gl_Position` 自动执行完整的裁剪、透视除法和视口变换流程），注意这里有趣的是，这边先做了从 light clip space 转到 texture coordinates 的操作，矩阵在`light`里，然后才手动透视除法，此时 z 可以理解为深度，然后喂给`texture`函数。

当然本章的演示都是基于 spot light 的，The technique described in this recipe for calculating the light’s view and projection matrices is suitable only for spot lights and, to some extent, omni lights.

### Implementing MSAA in Vulkan

Multisampling is a specialized form of supersampling where the fragment shader runs only once per pixel, with only the depth (and stencil) values being supersampled within a pixel. More precisely, with multisampling, the fragment shader only needs to be evaluated once per pixel for each triangle that covers at least one sample point.

在 vulkan 里开启 MSAA 会麻烦一些：Multisample rendering in Vulkan works differently. Here, we need to create an offscreen render target capable of storing multiple samples per pixel and render our scene into that target. Before this multisampled image can be displayed or used in post-processing effects, it must first be resolved into a standard non-multisampled render target.

给了两种方法：

* `vkCmdResolveImage` 坏处是 this approach requires the multisampled image to be completely rendered and stored in memory before the resolve operation can begin
* `vkCmdBeginRendering` requires a list of framebuffer attachments, each of which can include a resolve attachment, referred to as `VkRenderingAttachmentInfo::resolveImageView` in Vulkan. 这样不需要写内存：the Vulkan driver can resolve multisampled images into non-multisampled images without storing intermediate multisampled data in memory.

开始讲代码，注意 depth 和 color 都需要设置采样数；这里因为 vulkan 需要在创建 pipeline 的时候就制定好采样数，创建了俩 VKMesh，一个带 MSAA 一个不带；后面根据 enableMSAA 这个 flag 设置不同的 texture、resolveTexture 等等，depth texture 不需要 resolve；ImGui 还是单独的，不走 MSAA

提了一嘴标准 MSAA 的问题：Color sampling occurs once per pixel, which can lead to“shader aliasing”or Moiré patterns on high-frequency textures.有个`minSampleShading`参数可以缓解这个问题，A value of 1.0 ensures that every sample is shaded independently.  [VkPipelineMultisampleStateCreateInfo(3)](https://registry.khronos.org/vulkan/specs/latest/man/html/VkPipelineMultisampleStateCreateInfo.html)

When we allocate our offscreen textures, msaaColor and msaaDepth, they occupy valuable GPU memory, even though they are never used for actual rendering on tiled GPUs. 可以指定 VK_MEMORY_PROPERTY_LAZILY_ALLOCATED_BIT 和 VK_IMAGE_USAGE_TRANSIENT_ATTACHMENT_BIT, tells the Vulkan driver not to allocate memory for the image unless it is actually needed.

### Implementing screen space ambient occlusion

Ambient occlusion, at its core, provides a simplified representation of global illumination. It can be thought of as the amount of open “sky” visible from a point on a surface, unobstructed by nearby geometry. 

评估 occlusion factor O(dZ) 用的公式，dZ 是 the projected depth value and the current fragment’s depth:

`O(dZ) = (dZ > 0) ? 1/(1+dZ*dZ) : 0`

Cpp 那边的代码就是起两个 compute，一个给 SSAO，一个给 Blur，blur 用 specialization constant 区分是横向还是纵向的 blur。还有一个 combine 的 shader，用 full screen quad 给 Color 和 SSAO 做混合的（好处应该是可以很方便地独立开关和控制 SSAO）。后续加载了一个所谓的 special rotation texture，4x4 pixels and contains 16 random vec3 vectors. 渲染那边要记得 resolve depth attachements，因为这次 SSAO 是要用的了。Blur 那边就是 ping pong 使用 buffer，作为 in out。

SSAO 的 shader：

```glsl
// 书上说：normalizes the depth buffer value into the 0…1 range 有问题
// 应该是把透视除法再变换之后的非线性z拉回view space
// https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/38
float scaleZ(float smpl) {
  return (pc.zFar * pc.zNear) / (smpl * (pc.zFar-pc.zNear) - pc.zFar);
}

void main() {
  const vec2 size = textureBindlessSize2D(pc.texDepth).xy;
  const vec2 xy   = gl_GlobalInvocationID.xy;  // texel position
  // the corresponding uv coordinates, shifted to texel centers by 0.5 pixels
  const vec2 uv   = (gl_GlobalInvocationID.xy + vec2(0.5)) / size; 
  // ...
  const float Z     = scaleZ( textureBindless2D(pc.texDepth, uv).x );
  // tile it across the entire framebuffer, and sample a vec3 value from it corresponding to the current fragment. serves as a normal vector to a random plane
  const vec3  plane = textureBindless2D(pc.texRotation, xy / 4.0).xyz - vec3(1.0);
  float att = 0.0;
  
  for ( int i = 0; i < 8; i++ )
  {
    // reflect each of vec3 offsets from this plane, producing a new sampling point, rSample
    vec3  rSample = reflect( offsets[i], plane );
    // The depth value zSample for this point is sampled from the depth texture and immediately converted to eye space
    float zSample = scaleZ( textureBindless2D( pc.texDepth, uv + pc.radius*rSample.xy / Z ).x );
    float dist    = max(zSample - Z, 0.0) / pc.distScale;
    // The distance difference occl is scaled by an arbitrarily selected weight.
    // dist * (2.0 - dist)在dist=1 的地方最强，然后又慢慢减弱
    float occl    = 15.0 * max( dist * (2.0 - dist), 0.0 );
    att += 1.0 / (1.0 + occl*occl);
  }
    
  att = clamp(att * att / 64.0 + 0.45, 0.0, 1.0) * pc.attScale;
  imageStore(kTextures2DOut[pc.texOut], ivec2(xy), vec4( vec3(att), 1.0 ) );
}
```

高斯那边就没啥，权重可以从[DrDesten's Gaussian Kernel Calculator](https://drdesten.github.io/web/tools/gaussian_kernel/)拿，这里有趣的还有一个 bilateral blur calculation，根据深度差值来算个权重加到最后混合系数里。

最后安利了下 HBAO 和 GTAO 这俩 AO 算法，然后提了下 demo 里的透明因为实现原因会导致 SSAO 的效果不太对。

### Implementing HDR rendering and tone mapping

用 1byte 表现颜色确实不够，用 VK_FORMAT_R16G16B16A16_SFLOAT，其他的 A2B10G10R10_SNORM_PACK32 或者 B10G11R11_
UFLOAT_PACK32, are more memory-efficient and can be used in many scenarios.

`BrightPass.comp`:  identifies the bright areas in the rendered scene and converts the entire HDR scene to 16-bit luminance

`Bloom.comp`: Two passes are used to generate the horizontal and vertical components of the bloom, utilizing ping-pong buffers.

The bright pass and bloom textures are smaller, with a resolution of 512x512. They are supposed to capture only low-frequency image details and don’t need to be high-resolution. A texture to store the average scene luminance. The goal is to convert the rendered scene into a single-channel 16-bit image format representing luminance and then downscale it to a 1x1 texture using the mipmapping pyramid. The single pixel in the 1x1 mip level represents the average luminance. Component swizzling is applied to render the single-channel R image as a grayscale image.

开始渲染，先走 brightPass 把 bright region 提取出来存到 texBrightPass，场景的 luminance 存到 texLumViews[0]；texLumViews[0]好了之后 generate the entire mip pyramid down to 1x1，就是场景的平均 luminance；然后针对 texBrightPass，模糊一下开始做 bloom；最后 tone mapping，需要传入 resolved HDR scene image, the average luminance value, and the blurred bloom texture. The tone mapping shader uses only the last 1x1 level of the mip pyramid, However, LightweightVK implements image memory barriers at the Vulkan resource level VkImage, not at the subresource level of individual texture mip levels. This requires us to transition the entire mip pyramid to VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL.

开始讲 shader 了，`BrightPass.comp`比较简单，提取过亮的部分和 luminace 到分别的贴图，The bright areas texture is a downscaled 512x512 texture. We use a 3x3 box filter to soften the results。也可以换其他的 [Jorge Jimenez – Next Generation Post Processing in Call of Duty: Advanced Warfare](https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/)

`Bloom.comp`和之前的高斯模糊的很像，uses the same Gaussian coefficients but does not require the bilateral blur technique. 

`ToneMap.frag`相对复杂一些，有三种算法：

* reinhard2，来自[Tone Mapping | δelta](https://64.github.io/tonemapping/)
* Uchimura，来自[HDR Theory and practicce (JP) | PDF](https://www.slideshare.net/nikuque/hdr-theory-and-practicce-jp)和[Practical HDR and WCG in GTSPORT](http://cdn2.gran-turismo.com/data/www/pdi_publications/PracticalHDRandWCGinGTS_20181222.pdf)
* Khronos PBR Neutral Tone Mapper，来自[ToneMapping/PBR_Neutral/README.md at main · KhronosGroup/ToneMapping](https://github.com/KhronosGroup/ToneMapping/blob/main/PBR_Neutral/README.md#pbr-neutral-specification)

最后提了下这个算法的问题是转化太快了，人眼没那么快适应过来，这也是下一章要解决的问题。另一个问题：Strictly speaking, applying a tone mapping operator directly to the RGB channel values is a crude approach. A more accurate model would involve tone mapping the luminance value and then applying it back to the RGB values. 

有的显示器直接支持 HDR，看下 VK_AMD_display_native_hdr 和 VK_EXT_hdr_metadata。Bloom 的更多资料：[Bloom Disasters - The Quixotic Engineer](https://gangles.ca/2008/07/18/bloom-disasters/)  [Jorge Jimenez – Next Generation Post Processing in Call of Duty: Advanced Warfare](https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/)  [LearnOpenGL - Phys. Based Bloom](https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom)

### Implementing HDR light adaptation

Rather than using the current average scene luminance value to tone map the scene immediately, we blend it with a previously computed luminance value. The blending is done gradually in every frame through interpolation in a compute shader, creating a smooth transition between the old and new luminance values.

也是 ping-pong: By alternating the roles of the previous and new adapted luminance textures, we can iterate this process in each frame using a ping-pong technique. 两个的初始值都是很亮的 50，模拟那种一开始就很亮然后慢慢适应的感觉。

Cpp 代码里要注意 Image layout 的改变。shader 的代码：

```glsl
// we are processing just a single texel
layout (local_size_x = 1, local_size_y = 1) in;
void main() {
  // current rendered scene luminance 
  float lumCurr = imageLoad(kTextures2DIn[pc.texCurrSceneLuminance  ], ivec2(0, 0)).x;
  // previous adapted luminance
  float lumPrev = imageLoad(kTextures2DIn[pc.texPrevAdaptedLuminance], ivec2(0, 0)).x;
  // https://google.github.io/filament/Filament.md.html#mjx-eqn-adaptation
  float factor        = 1.0 - exp(-pc.adaptationSpeed);
  float newAdaptation = lumPrev + (lumCurr - lumPrev) * factor;
  // output adapted luminance
  imageStore(kTextures2DOut[pc.texAdaptedOut], ivec2(0, 0), vec4(newAdaptation));
}
```

最后给了几个深入的：[GDC Vault - Uncharted 2: HDR Lighting](https://www.gdcvault.com/play/1012351/Uncharted-2-HDR)  [Advances in Real-Time Rendering in 3D Graphics and Games - SIGGRAPH 2014](https://advances.realtimerendering.com/s2014/index.html#_NEXT_GENERATION_POST)



## Chap11 Advanced Rendering Techniques and Optimizations

最后一章！

### Refactoring indirect rendering

VKMesh 的好处，provided a straightforward way to encapsulate scene geometry, GPU buffers, and rendering pipelines. 坏处也是 couples scene data, rendering pipelines, and buffers. This strong coupling poses challenges when attempting to render the same scene data with different pipelines or when selectively rendering parts of a scene. 

`VKIndirectBuffer11`用来管理一堆 indirect command buffer，`VKPipeline11`用来管理创建 graphics pipeline，感觉整体就是拆了下 VKMesh，有两个 draw 函数，第一个是 takes a mandatory VKPipeline11 object and uses default push constants to pass data into GLSL shaders；第二个 take custom push constants and depth state

### Doing frustum culling on the CPU & Doing frustum culling on the GPU with compute shaders

[Inigo Quilez :: computer graphics, mathematics, shaders, fractals, demoscene and more](https://iquilezles.org/articles/frustumcorrect/)

一般的：如果 AABB 完全位于视锥任意一个平面的“外侧”，那么就认为它在视锥外，可以剔除；优化版：如果视锥的所有 8 个角点都位于 AABB 某一个平面的“外侧”，那就意味着视锥和 AABB 没有相交，这个 AABB 就可以被安全地剔除。

`getFrustumPlanes`从矩阵拿视锥面，`getFrustumCorners`拿到角，定义一个 unit cube 然后变换为视锥，有了这俩，剔除的代码就很直观了，simply check whether the bounding box is entirely outside any of the 6 frustum planes，然后再 invert the test and check whether the frustum is entirely inside the bounding box.

cpp 代码那边，要给 VKMesh11 传 StorageType_HostVisible，后续会在 cpu 端跑 culling 然后直接该 indirect buffer 里的 instance 数量。

One might argue that this type of culling is inefficient because modern GPUs can render small meshes much faster than we can cull them on the CPU, and this is mostly true. It doesn’t make sense to cull very small objects such as bottles or individual leaves this way. However, the CPU culling pipeline is still extremely useful when culling large objects or even clusters of objects. 这边毕竟没上加速数据结构之类，都是给单个 mesh culling.

On platforms where bandwidth consumption increases power usage and heat—such as mobile phones and handheld consoles—performing culling on the CPU may prevent the costly transfer of uncompressed vertex data from RAM to tile memory, only for it to be discarded.



GPU 上就是把 culling 代码 port 到 GLSL，然后把 cpu 端的 for 循环 port 到 compute shader。compute shader 里就是 mirror 了各种数据结构，然后代码几乎一样。后续优化可以考虑下 patch 对齐来去掉 shader 里的 if，然后 atomicAdd 可以考虑换成 subgroupBallot 或者 subgroupBallotBitCount，[Vulkan Subgroup Tutorial - Khronos Blog - The Khronos Group Inc](https://www.khronos.org/blog/vulkan-subgroup-tutorial)

因为 visible mesh 数量需要回读，所以选择了回读前一帧的数据，也是类似一个 round robin；而且还有同步问题，要等待上一帧渲染结束再回读，用了之前讲过的 submit handle，In other words, we check the Vulkan fence corresponding to a command buffer submitted one frame ago. 这里也有不高效的地方，理论上等上一帧的 compute shader 结束就行了，没必要等整个 command buffer 走完。

性能上简单看了下，GPU 的比 CPU 还蛮，因为 isAABBinFrustum 写得不好，太多分支了，performance can be significantly improved by either rewriting the code in a SIMD-friendly way or replacing AABB culling with simpler bounding sphere culling,

最后提了下，CPU 那边也可以用多线程 [GDC Vault - Culling the Battlefield: Data Oriented Design in Practice](https://gdcvault.com/play/1014491/Culling-the-Battlefield-Data-Oriented)，GPU 那边可以考虑 compact 一下 indirect command，[GPU-Driven Rendering Pipelines](https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf)



### Implementing shadows for directional lights

这里的问题在于，如果光源理论上在无限远，那么如何构造一个正好渲染整个场景的正交投影矩阵

To construct a projection matrix for a directional light, we calculate the axis-aligned bounding box of the entire scene, transform it into light-space using the light’s view matrix, and then use the bounds of the transformed box to construct an orthographic frustum that fully encloses this box.

构造 view 矩阵：we first create two rotation matrices based on the theta and phi angles. These matrices are used to rotate a top-down light direction vector, (0, -1, 0), into the desired orientation. Using the resulting light direction, we build the light’s view matrix using the glm::lookAt() helper function. Since the light source encompasses the entire scene, its origin can be conveniently set to (0, 0, 0).

构造 projection：Since Vulkan uses a clip coordinate space where the z axis ranges from 0 to 1, we use the glm::orthoLH_ZO() helper function to create the projection matrix. However, this function follows the DirectX clip coordinate convention, so we must flip the z axis to match Vulkan’s expectation.

这个因为是静态场景，所以 shadow map 可以按需更新，只在光源变化的时候更新阴影。一些牛逼的技术：Perspective Shadow Maps (PSMs)，[Light Space Perspective Shadow Maps | TU Wien – Research Unit of Computer Graphics](https://www.cg.tuwien.ac.at/research/vr/lispsm/)，Cascaded Shadow Maps (CSMs)，Parallel Split Shadow Maps (PSSMs) ，[www.realtimeshadows.com](https://www.realtimeshadows.com/)

有 validation error，提 issue 了[Vulkan Validation Error: Expected Image to have the same type as Result Type Image · Issue #39 · PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition](https://github.com/PacktPublishing/3D-Graphics-Rendering-Cookbook-Second-Edition/issues/39)

### Implementing order-independent transparency

现在的半透明渲染在 Chap8 讲过，this approach was limited in quality, it allowed transparent and opaque objects to be rendered together without any additional care or sorting, greatly simplifying the rendering pipeline.

渲染半透明的办法：

* [Depth Peeling Order Independent Transparency in Vulkan - Matthew Wellings](https://matthewwellings.com/blog/depth-peeling-order-independent-transparency-in-vulkan/)
* [Casual Effects: Weighted, Blended Order-Independent Transparency](https://casual-effects.blogspot.com/2014/03/weighted-blended-order-independent.html)
* Phenomenological Transparency: [Phenomenological Transparency | Research](https://research.nvidia.com/publication/2017-03_phenomenological-transparency)

In Vulkan, it is possible to implement order-independent transparency (OIT) using per-pixel linked lists via atomic counters and load-store-atomic read-modify-write operations on textures. The algorithm works by constructing a linked list of fragments for each screen pixel, with each node storing color and depth values. Once these per-pixel lists are constructed, they can be sorted and blended using a fullscreen fragment shader. Essentially, this is a two-pass algorithm. 本章方法基于  [Oit And Indirect Illumination Using Dx11 Linked Lists | PPSX | Graphics Software | Computer Software and Applications](https://www.slideshare.net/slideshow/oit-and-indirect-illumination-using-dx11-linked-lists/3443500)

First, we render opaque objects with standard shading. Next, we render transparent objects, adding shaded fragments to linked lists instead of rendering them directly to the framebuffer. Finally, we sort the linked lists and overlay the blended image onto the opaque framebuffer. 

`transparent.frag`负责渲染不透明物体然后生成 per pixel 的链表，shader 里用了[Early Fragment Test - OpenGL Wiki](https://www.khronos.org/opengl/wiki/Early_Fragment_Test)，The early_fragment_tests layout specifier ensures that the fragment shader is not executed unnecessarily if the fragment is discarded based on the depth test. This is crucial because any redundant invocation of this shader could result in corrupted transparency lists. 

shader 里面不追求完全的 pbr 准确，而是 keep it simple and shiny while focusing on transparency.

有个关键的优化和 MSAA 有关：Our transparent mesh rendering shader runs on an MSAA render target. Instead of storing all multisampled fragments in the transparency lists, which would increase memory consumption and bandwidth for our 8x MSAA, we store only those samples fully covered by this fragment shader invocation. To do this, we construct the current sample mask using the built-in GLSL gl_SampleID variable and compare it with the gl_SampleMaskIn[0] array element, which contains the computed sample coverage mask for the current fragment.

注意也有对`gl_HelperInvocation`的判断，A helper invocation is a fragment shader invocation created solely for evaluating derivatives. 

```glsl
float alpha = clamp(baseColor.a * mat.clearcoatTransmissionThickness.z, 0.0, 1.0);
bool isTransparent = (alpha > 0.01) && (alpha < 0.99);
uint mask = 1 << gl_SampleID;
if (isTransparent && !gl_HelperInvocation && ((gl_SampleMaskIn[0] & mask) == mask)) {
    uint index = atomicAdd(pc.oit.atomicCounter.numFragments, 1);
    if (index < pc.oit.maxOITFragments) {
      uint prevIndex = imageAtomicExchange(kTextures2DInOut[pc.oit.texHeadsOIT], ivec2(gl_FragCoord.xy), index);
      TransparentFragment frag;
      frag.color = f16vec4(color, alpha);
      frag.depth = gl_FragCoord.z;
      frag.next  = prevIndex;
      pc.oit.oitLists.frags[index] = frag;
    }
}
```

`oit.frag`就是真正去 sort 和 blend 的 shader，从链表构造一个 local array，插入排序，然后开始一个个 blend.

最后提了下内存消耗太大，可以考虑 Per-Fragment Layered Sorting (PLS) and Layered Depth Images (LDI).



### Loading texture assets asynchronously

引入了 VKMesh11Lazy，把加载贴图数据和创建 vulkan texture 拆成两步了，后一步只能在主线程做。因为默认 id 是 0，是一个 a white dummy texture. 注意就是 load 好了 Update 一下 GPU material 的贴图 id，但是每次都 go through all the materials and update them using the texture IDs from the cache. This is necessary because a single loaded texture can be referenced by multiple materials. Since we don’t track their relationships, the simplest approach is to update them all.

改进方向：

* A better approach might be to precreate empty textures and load images directly into these memory regions, especially since our data is already compressed into the BC7 format.
* Instead of polling the processLoadedTextures() method every frame, texture updates could be integrated into the events system of your rendering engine.

[lightweightvk/samples at master · corporateshark/lightweightvk](https://github.com/corporateshark/lightweightvk/tree/master/samples)

### Putting it all together into a Vulkan demo

有个很帅的 frame graph。culling 改了改，首先只对 opaque 的做视锥剔除了，因为半透的很少；理论上 shadow pass 和 culling 可以并行。

最后推荐了点：

* tile deferred shading or clustered shading:[clustered_shading_preprint.pdf](https://www.cse.chalmers.se/~uffe/clustered_shading_preprint.pdf)
* [Physically Based Rendering in Filament](https://google.github.io/filament/Filament.md.html)
* FrameGraph: Extensible Rendering Architecture in Frostbite 和《Mastering Graphics Programming with Vulkan》



## 感想

整体来说书还算挺好的，也确实这次认真学了学，也主要是靠 AI 帮忙。AI 真的很擅长帮我去补充这些知识的 context，我可以随便问，让它问我，来回测试自己的理解。之前虽然看过，但是太不认真了，让我的脑细胞恢复一下。渲染没讲太深，前半部分主要是 lightweight vk 相关，后面开始 PBR 和一些架构上的东西，中间穿插一些渲染算法等等。学这个也确实是面试的时候感觉还是要会渲染，去新地方可能也要做点渲染，底层的东西还是要会。本来稍微纠结了下学 UE 还是这个，UE 也是真的没时间学，做中学吧。（另外，文件大了 typora 的编辑体验确实一般）

还留了两个 TODO，其实是我比较关心的，1，vulkan 的同步问题是怎么处理的，书里讲的太细节了，反而很少从大局上整体讲讲，其实就是想看到一个同步关系图之类的；2，其实算是 1 的子集，就是 image barrier 那些的处理。这个还是要配合源码、AI 和 demo 再仔细看看。
