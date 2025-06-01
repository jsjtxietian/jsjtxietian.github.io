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
* **LightweightVK uses opaque handles to work with resources**, so `lvk::RenderPipelineHandle` is an opaque handle that manages a collection of VkPipeline objects, and `lvk::Holder` is a RAII wrapper that automatically disposes of handles when they go out of scope.
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

## Working with Vulkan Objects

第二章看的太累了，第三章要开始有趣起来了。

### Dealing with buffers in Vulkan

More specifically, a Vulkan buffer refers to a `VkBuffer` object that is associated with memory regions allocated through `VkDeviceMemory`.