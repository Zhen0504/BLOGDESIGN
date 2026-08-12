# 01「个人简介」晶体 Three.js 浏览器样品实施计划

日期：2026-08-12

依据规范：[`2026-08-12-crystal-rendering-redesign.md`](../specs/2026-08-12-crystal-rendering-redesign.md)

实施边界：只完成一颗 01「个人简介」晶体的浏览器真实渲染样品；不制作另外三颗晶体，不接入 00–04 正式章节轮换，不部署网站。

## 1. 最终产物

本轮完成后应得到：

- 一个不出现在正式导航中的 `/#/__crystal-lab` 实验入口。
- 一颗由外部透明框、内侧透明环、深色中央面板和材质刻痕组成的四层晶体。
- 实际运行于 Three.js WebGLRenderer 的透射、折射、色散、边缘高光和 Bloom。
- 鼠标小幅旋转、位置跟随与层间视差。
- 正面、三分之四视角、移动端截图，一段交互录屏和一张参考图对照表。
- 几何报告、浏览器性能报告、控制台报告和资源体积报告。

用户验收前，实验结果不能替换正式页面的 `.scene-layer`，也不能扩展另外三颗晶体。

## 2. 版本、边界与安全规则

### 2.1 依赖锁定

新增依赖使用精确版本：

```powershell
npm install --save-exact three@0.185.1 @pmndrs/vanilla@1.25.0 postprocessing@6.39.4
```

保留现有 `ogl@1.0.11`，本轮不删除，以免影响已归档原型或扩大变更范围。Three.js 只在延迟加载的实验入口中进入浏览器，正常作品集入口不提前下载实验代码。

### 2.2 旧资产保护

以下文件视为失败对照，只读保留：

- `tools/blender/generate_about_crystal.py`
- `tools/blender/generate_about_crystal_v2.py`
- `assets/3d/prototypes/about-crystal-sample.blend`
- `assets/3d/prototypes/about-crystal-sample.blend1`
- `assets/3d/prototypes/about-crystal-sample.glb`
- `assets/3d/textures/about-user-sdf.png`
- `output/blender/about-crystal/`
- `output/blender/about-crystal-v2/`

新工作一律使用 v3 文件名。任何提交都明确列出路径，禁止使用 `git add .`，`.superpowers/` 和无关未跟踪文件不得暂存。

### 2.3 新文件布局

```text
public/experiments/crystal/
├── about-crystal-v3.glb
└── about-user-sdf-v3.png

src/experiments/crystal-lab/
├── CrystalLabView.vue
├── createCrystalLab.js
├── loadAboutCrystal.js
├── createInteractionController.js
├── createPostProcessing.js
├── createQualityProfile.js
├── crystalConstants.js
└── materials/
    ├── createGemTransmissionMaterial.js
    └── createEtchedPanelMaterial.js

tools/blender/
└── generate_about_crystal_v3.py

tests/unit/
└── crystal-lab-structure.test.mjs

output/crystal-lab/
├── geometry-report.json
├── pass-01-blockout.png
├── pass-02-structure.png
├── pass-03-material.png
├── pass-04-lighting.png
├── final-front.png
├── final-three-quarter.png
├── final-mobile.png
├── final-comparison.png
├── final-interaction.webm
└── metrics.json
```

`output/` 继续被 Git 忽略；验收图不进入生产包。通过验收后才从最终正面图生成正式降级海报。

## 3. 任务一：建立失败测试和隐藏实验入口

修改：

- `package.json`
- `package-lock.json`
- `src/router/index.js`
- `tests/unit/crystal-lab-structure.test.mjs`

新建：

- `src/experiments/crystal-lab/CrystalLabView.vue`

步骤：

1. 先创建结构测试，要求存在 `/#/__crystal-lab`、延迟导入实验视图、实验视图拥有唯一 Canvas 容器和可见降级提示。
2. 测试必须先因入口和组件不存在而失败。
3. 安装锁定依赖并更新 lockfile。
4. 在通配重定向之前增加隐藏路由：

   ```text
   /__crystal-lab → lazy import CrystalLabView.vue
   ```

5. 不把该路由加入顶部导航、章节指示器或站点地图。
6. `CrystalLabView` 只负责挂载容器、状态提示和生命周期；Three.js 细节全部委托给 `createCrystalLab()`。
7. 组件卸载时必须调用 `dispose()`，不得留下 RAF、事件监听器或 WebGL context。

验证：

```powershell
npm run test:structure
npm run build
```

提交：

```text
feat: add isolated crystal browser lab
```

## 4. 任务二：生成几何专用 v3 资产

新建：

- `tools/blender/generate_about_crystal_v3.py`
- `public/experiments/crystal/about-crystal-v3.glb`
- `public/experiments/crystal/about-user-sdf-v3.png`

### 4.1 外形和层次

脚本从零生成几何，不复制 v2 的球状网格。目标是一枚扁平、带倒角、非对称的三瓣徽章：

- 外框节点：`CRY_about_outer_frame_LOD0`
- 内环节点：`CRY_about_inner_ring_LOD0`
- 中央面板节点：`CRY_about_panel_LOD0`

外框必须是环形实体，不是一整块覆盖中央区域的封闭玻璃。内环与外框有真实间隙，中央面板相对内环后退，形成斜视可见的三层深度。

### 4.2 几何指标

- 总厚度与正面宽度之比：`0.10–0.16`。
- 外框、内环、面板之间的正面可见间隙：正面宽度的 `3%–7%`。
- 三个生产网格总三角面数：`8,000–18,000`，硬上限 `20,000`。
- 三个网格分别闭合、流形、无退化面、法线向外。
- 应用缩放与旋转，原点统一，节点名稳定。
- 中央面板提供不镜像、不跨侧面的正面 UV。

### 4.3 图标蒙版

重新生成 `512×512` 非彩色 SDF：圆形头部加单条肩部弧线。蒙版必须包含凹槽中心、平滑过渡边缘和未雕刻表面三个灰度区域；不把发光和颜色烘焙进图像。

### 4.4 导出和往返验证

脚本只导出三个生产节点，不导出相机、灯光和 Blender 材质。导出后清空场景并重新导入 GLB，检查节点名、尺寸、网格数、面数和边界。

执行：

```powershell
& 'D:\software\Blender\blender.exe' --background --factory-startup --python tools/blender/generate_about_crystal_v3.py
```

输出几何报告到 `output/crystal-lab/geometry-report.json`。任一硬指标失败时脚本以非零状态退出，并不得把结果描述为通过。

提交：

```text
feat: generate layered about crystal geometry
```

## 5. 任务三：建立 Three.js 生命周期与质量分级

新建：

- `src/experiments/crystal-lab/createCrystalLab.js`
- `src/experiments/crystal-lab/createQualityProfile.js`
- `src/experiments/crystal-lab/crystalConstants.js`

步骤：

1. 创建唯一的 `WebGLRenderer`、Scene、PerspectiveCamera 和时钟。
2. 使用 `SRGBColorSpace`、物理正确灯光和受控曝光；后期启用时 renderer 保持 `NoToneMapping`，色调映射放到合成末端。
3. 限制设备像素比：桌面不高于 `1.5`，移动端不高于 `1.25`。
4. `createQualityProfile()` 根据 WebGL2、浮点颜色缓冲、视口尺寸和移动设备能力返回 `high`、`medium` 或 `fallback`。
5. 生成程序化深海军蓝背景、少量星尘和用于折射观察的微弱银河弧；不使用截图背景。
6. 以 `RoomEnvironment` 和少量本地几何光卡产生环境反射，首轮不引入外部 HDR 文件。
7. 暴露只读调试接口 `window.__CRYSTAL_LAB__`：

   - `ready`
   - `instanceId`
   - `activeRaf`
   - `listenerCount`
   - `qualityTier`
   - `averageFps`
   - `setView('front' | 'three-quarter')`
   - `setPointer(x, y)`
   - `dispose()`

8. `dispose()` 释放 geometry、material、texture、render target、composer、监听器、RAF 和 WebGL context，并删除调试接口。

验证重点：路由反复进入和退出后仍只有一个 Canvas，旧 context 已释放，监听器计数回到零。

提交：

```text
feat: establish crystal lab renderer lifecycle
```

## 6. 任务四：加载分层资产并完成结构关卡

新建：

- `src/experiments/crystal-lab/loadAboutCrystal.js`

步骤：

1. 使用 `GLTFLoader` 加载 v3 GLB；模型 URL 通过 Vite base URL 构建，不能硬编码域名或绝对部署路径。
2. 按稳定节点名查找外框、内环和中央面板；缺失、重复或命名错误时显示明确错误并停止渲染样品。
3. 将三个节点放入同一个 `aboutCrystalRoot`，但保留独立局部变换以支持轻微层间视差。
4. 首轮绑定中性调试材质：外框透明白、内环浅紫、面板深蓝，先只检查结构，不调宝石质感。
5. 固定正面和三分之四相机，生成：

   - `pass-01-blockout.png`
   - `pass-02-structure.png`

结构关卡必须确认：轮廓不鼓胀、外框确实为空心、三层间隙清楚、侧面不过厚。未通过时只修改 v3 几何，不进入透射材质。

提交：

```text
feat: load layered about crystal asset
```

## 7. 任务五：实现外框与内环的实时透射

新建：

- `src/experiments/crystal-lab/materials/createGemTransmissionMaterial.js`

### 7.1 基线材质

先使用 `@pmndrs/vanilla` 的 `MeshTransmissionMaterial`，不要一开始编写完整自定义 Shader。外框使用高质量透射基线；内环先使用较便宜的 `MeshPhysicalMaterial`，只有视觉不足时才升级为共享同一场景缓冲的自定义透射材质：

- 外框接近无色，低粗糙度，IOR 从 `1.45–1.52` 范围调节。
- 内环允许极弱蓝紫吸收和稍高粗糙度，但不能单独触发一次完整高分辨率场景重绘。
- 色散保持克制，只在高光边缘看见细微 RGB 分离。
- 扰动只用于避免完全机械的折射，不允许形成水波或果冻感。

### 7.2 离屏通道

- 当前单颗样品只允许一套共享透射缓冲。
- 高质量档使用半分辨率至四分之三分辨率缓冲；中质量档使用四分之一至半分辨率。
- 禁止外框和内环各自完整重绘一次高分辨率场景。
- 宿主网格在捕获自身背景时必须临时隐藏，避免反馈采样。

### 7.3 自定义扩展条件

只有基线材料无法满足以下任一条件时，才扩展为项目自己的 `GemTransmissionMaterial`：

- 银河和星尘不能通过外框产生清晰受控折射。
- 外框与内环互相遮蔽，无法形成层间视差。
- 边缘需要基于厚度的折射增强，而标准参数无法提供。

扩展只增加场景颜色缓冲采样、厚度权重、轻微 RGB 偏移和受控 Fresnel，不移植 BVH 多次反弹钻石 Shader。

完成后生成 `pass-03-material.png`。图像必须首先证明背景能透过外框；如果仍像蓝色塑料，不得通过提高 Bloom 或自发光进入下一任务。

提交：

```text
feat: add realtime layered gem transmission
```

## 8. 任务六：实现中央面板与刻痕图标

新建：

- `src/experiments/crystal-lab/materials/createEtchedPanelMaterial.js`

步骤：

1. 中央面板使用深海军蓝紫色物理材质，保持有限透射和较短吸收距离；不能使用纯黑、不透明度叠加或整面自发光。
2. 加载 `about-user-sdf-v3.png`，设置为 `NoColorSpace`，禁用彩色解释。
3. SDF 同时控制浅凹法线、凹槽中心暗化、边缘粗糙度和视角相关散射。
4. 图标亮度主要来自刻痕边缘反射；只有斜视边缘允许超过 Bloom 阈值。
5. 图标必须随中央面板 UV 和局部变换运动，不能作为 DOM、Sprite 或独立悬浮平面。
6. 正面和三分之四视角检查图标方向、线宽、贴合与外框折射。

若 SDF 凹陷在小尺寸下仍像贴纸，可增加一个紧贴面板的透明法线承载层，但不得把图标改成发光线框或真实厚重挤出。

提交：

```text
feat: render etched icon on inner crystal panel
```

## 9. 任务七：完成灯光和后期合成

新建：

- `src/experiments/crystal-lab/createPostProcessing.js`

步骤：

1. 创建 `EffectComposer`。桌面高质量档使用 `HalfFloatType`；不支持时自动降为普通缓冲。
2. 使用 RenderPass、亮度阈值 Bloom、ToneMappingEffect 和克制暗角。
3. 只有 HDR 亮度的细窄边缘、极少暖金闪点和刻痕边缘进入 Bloom；玻璃主体不得整体发光。
4. 使用冷白主光卡、蓝紫辅光卡和不超过三处的暖金小光点。
5. 禁止大矩形反光覆盖正面；高光宽度和位置通过光卡几何控制。
6. 单颗样品不启用景深，因为没有背景晶体。景深仅在四颗晶体进入同一场景后启用，避免为了不存在的层次增加成本。
7. 完成后生成 `pass-04-lighting.png`。

调试顺序固定为：几何厚度 → 背景透射 → 内层吸收 → 光卡位置 → 色散 → Bloom。禁止反向用 Bloom 掩盖材质失败。

提交：

```text
feat: finish crystal lighting and postprocessing
```

## 10. 任务八：实现鼠标交互和运动降级

新建：

- `src/experiments/crystal-lab/createInteractionController.js`

步骤：

1. 将指针位置归一化为 `[-1, 1]`，使用阻尼追踪目标，不直接把鼠标坐标赋给旋转。
2. 根节点最大旋转：水平 `±8°`、垂直 `±6°`；最大平移不超过晶体正面宽度的 `2%`。
3. 外框、内环和面板使用不同但很小的响应比例，形成层间视差；层间相对位移不超过正面宽度的 `0.8%`。
4. 无输入时缓慢回到基准姿态；不持续自动大幅旋转。
5. `prefers-reduced-motion` 下关闭层间视差和空闲运动，只保留很小的整体倾斜或静态姿态。
6. 页面隐藏时暂停 RAF，恢复可见时重新校准时钟，避免后台累计跳帧。
7. 录制 `final-interaction.webm`，至少包含左、右、上、下移动和回正过程。

提交：

```text
feat: add restrained crystal pointer parallax
```

## 11. 任务九：自动浏览器验收和性能检查

修改：

- `tests/unit/crystal-lab-structure.test.mjs`
- `README.md`
- `.gitignore`，仅在现有 `output/` 规则不足时修改

浏览器验收使用 1680×945 和 390×844 两组视口，并完成：

1. 打开 `/#/__crystal-lab`，等待 `window.__CRYSTAL_LAB__.ready === true`。
2. 检查控制台 `0 errors`、`0 warnings`。
3. 检查页面只有一个 Canvas。
4. 固定正面姿态，保存 `final-front.png`。
5. 固定三分之四姿态，保存 `final-three-quarter.png`。
6. 移动端保存 `final-mobile.png`，确认无水平溢出。
7. 自动驱动指针四个方向并回正，检查变换值未超过上限。
8. 采集 10 秒稳定帧率：桌面平均不低于 `55 FPS`；移动端模拟环境不低于 `40 FPS`。
9. 离开路由后检查 `activeRaf=false`、`listenerCount=0`、Canvas 已移除、render target 已释放。
10. 再次进入路由，确认能够建立新实例且只有一个 Canvas。
11. 运行生产构建并记录实验异步 chunk、GLB、PNG 和总资源大小。

执行：

```powershell
npm run test:structure
npm run build
git diff --check
```

把浏览器数据写入 `output/crystal-lab/metrics.json`。任何失败必须保留真实错误，不得把无头浏览器启动失败或权限错误描述为测试通过。

提交：

```text
test: verify crystal lab visuals and lifecycle
```

## 12. 任务十：生成用户验收材料并强制停止

输出：

- `output/crystal-lab/final-comparison.png`
- `output/crystal-lab/final-interaction.webm`
- `output/crystal-lab/metrics.json`

步骤：

1. 将用户参考图、`final-front.png` 和 `final-three-quarter.png` 放到一张对照表中；不裁掉参考图的关键边缘结构。
2. 在对话中使用绝对路径直接展示 PNG，并同时提供可点击文件链接。
3. 视频同样以绝对路径直接交付；localhost 页面只是附加交互入口。
4. 明确报告九项视觉验收、桌面/移动端帧率、构建体积和降级结果。
5. 立即停止，不接入正式 `PortfolioView`，不制作另外三颗晶体，不提交部署。

用户只有在确认以下四项后才允许进入下一规范周期：

- 晶体第一眼具有通透宝石感。
- 四层结构和扁平轮廓正确。
- 图标确实像刻在内层表面。
- 鼠标交互没有破坏材质和层次。

本任务的最后一次提交只包含用户通过前所需的样品代码、v3 资产和测试，不包含正式页面集成。

## 13. 返工规则

出现问题时按责任层返工：

- 轮廓、厚度、间隙错误：只改 Blender v3 几何并重新导出。
- 发蓝、发黑、塑料感：只改透射、吸收、环境和光卡，不改整体页面。
- 图标像贴纸：只改 SDF、面板 UV 和刻痕 Shader。
- 高光过宽或霓虹感：只改光卡、HDR 阈值和 Bloom。
- 帧率不足：先降透射缓冲和像素比，再减少采样；不得先把主体改成不透明材质。
- PNG 无法显示：检查输出文件和交付路径，不能把图片加载失败当成渲染失败或视觉通过。

每轮只改变一个责任层并重新生成同名验收材料，保证前后结果可以直接比较。

## 14. 完成定义

本实施计划只有在以下条件全部满足时才算完成：

1. 三层生产网格和刻痕蒙版通过自动几何检查。
2. 实际浏览器渲染满足九项单颗晶体视觉规范。
3. 鼠标交互、降级、释放和重新初始化验证通过。
4. 桌面、移动端性能达到门槛，控制台无错误。
5. PNG、视频和对照表能够直接展示，不依赖临时验收网页。
6. 用户明确通过单颗样品。

用户通过前，任何“模型已生成”“构建成功”或“测试通过”都不等同于本计划完成。
