# 01「个人简介」晶体 Blender 样品实施计划

日期：2026-08-12

依据规范：[`2026-08-12-about-crystal-design.md`](../specs/2026-08-12-about-crystal-design.md)

实施边界：只制作一颗 Blender 样品，不修改网站代码，不制作另外三颗晶体

## 1. 实施结果

完成后应产生一颗可重复生成的「柔性三瓣盾形」个人简介晶体，以及用于用户视觉验收的多视角渲染。样品采用透明外层、深色内层和材质驱动的浅浮雕人形图标。

本轮的终点是用户验收单颗样品，不是把它接入网页。

## 2. 保留与新建策略

旧样品用于对照，不覆盖也不删除：

- `tools/blender/generate_about_crystal.py`
- `assets/3d/prototypes/about-crystal-sample.blend`
- `assets/3d/prototypes/about-crystal-sample.glb`
- `output/blender/about-crystal/`

新建以下 v2 资产：

- `tools/blender/generate_about_crystal_v2.py`
- `assets/3d/textures/about-user-sdf.png`
- `assets/3d/prototypes/about-crystal-etched-v2.blend`
- `assets/3d/prototypes/about-crystal-etched-v2.glb`
- `output/blender/about-crystal-v2/front.png`
- `output/blender/about-crystal-v2/three-quarter.png`
- `output/blender/about-crystal-v2/side.png`
- `output/blender/about-crystal-v2/etching-closeup.png`
- `output/blender/about-crystal-v2/wireframe.png`
- `output/blender/about-crystal-v2/contact-sheet.png`
- `output/blender/about-crystal-v2/report.json`
- `output/blender/about-crystal-v2/execution.log`

旧文件不被修改，新旧效果可以直接并排比较。

## 3. 任务一：建立 v2 生成器骨架

文件：`tools/blender/generate_about_crystal_v2.py`

1. 从旧生成器复用日志、场景清理、网格审计、GLB 导出、往返导入验证和联系表生成逻辑。
2. 将所有输出路径改为 v2 文件名和 `output/blender/about-crystal-v2/`。
3. 保持可重复生成，不依赖随机几何；记录 Blender 版本和全部视觉参数。
4. 明确区分生产对象和预览对象：只有外层与内层晶体进入 GLB，灯光、相机、背景和反光辅助物不导出。

生产对象名称保持稳定：

- `CRY_about_outer_LOD0`
- `CRY_about_inner_LOD0`

验证：脚本在空场景中可启动，能够建立输出目录，并且不会覆盖 v1 文件。

## 4. 任务二：重建柔性三瓣盾形几何

文件：`tools/blender/generate_about_crystal_v2.py`

### 4.1 外层

1. 继续使用均匀三角拓扑作为基础，避免经纬球极点引起折射星爆。
2. 使用新的三瓣径向函数塑造正面轮廓：三个圆润凸起大小不同，上部较宽，右下方轻微收束。
3. 将深度降至旧样品的大约一半，使总厚度与正面宽度之比落在 `0.18–0.28`。
4. 保持前后表面连续圆润，但不形成充气球体。

### 4.2 内层

1. 内层沿用同一视觉家族，但不是外层的简单等比复制；局部轮廓需要更平静、更紧凑。
2. 内层正面占外层正面面积约 `55%–65%`，四周保持可见且不完全均匀的间隙。
3. 内层厚度小于外层，并完整处于外层视觉边界内。
4. 为图标投影建立稳定的正面 UV；图标不得同时出现在背面和侧面。

### 4.3 几何验证

- 两个网格都必须闭合且流形。
- 法线统一朝外，无退化面。
- 两个网格总三角面数目标为 `8,000–12,000`，硬上限 `14,000`。
- 原点、缩放和旋转在导出前归一化。
- 报告记录正面宽高、总厚度、厚宽比、内外层间隙和三角面数。

## 5. 任务三：生成可复用的人形 SDF 蒙版

文件：

- `tools/blender/generate_about_crystal_v2.py`
- `assets/3d/textures/about-user-sdf.png`

1. 在 Blender Python 中以解析距离函数生成 `512×512` 灰度图，避免引入外部字体或不稳定图标依赖。
2. 图案只包含圆形头部和一条连续的头肩弧线，不加入身体细节、文字或装饰。
3. 蒙版保存为非彩色数据，边缘保留足够的平滑距离梯度，以供 Bump、粗糙度和边缘散射共同使用。
4. 蒙版线宽在常规页面尺寸下保持可辨，但不能粗到接近霓虹标志。
5. 将图片打包进 `.blend`，同时以独立 PNG 保存，供后续实时 Shader 重用。

验证：

- 图片尺寸严格为 `512×512`。
- 灰度范围包含凹槽中心、过渡边缘和未雕刻表面三个区间。
- 图案覆盖率保持克制，不接触内层面板边缘。
- UV 方向正确，图标不倒置、不镜像。

## 6. 任务四：建立分层玻璃与浅浮雕材质

文件：`tools/blender/generate_about_crystal_v2.py`

### 6.1 外层玻璃

- 使用接近无色的高透射 Principled 玻璃。
- IOR 初始范围为 `1.45–1.50`，粗糙度保持较低。
- 不使用或只使用极低密度的淡蓝紫体积吸收。
- 使用视角相关的轻微蓝紫边缘响应，不给主体填充饱和蓝色。

### 6.2 内层玻璃

- 使用深海军蓝紫色、低饱和、仍具透射性的玻璃。
- 内层比外层更暗、更粗糙，但不能变成不透明面板。
- 内层不使用强烈整体自发光。

### 6.3 浅浮雕图标

SDF 蒙版同时控制四个通道：

1. Bump 高度反向，形成非常浅的内凹法线。
2. 凹槽中心略微变暗。
3. 凹槽边缘提高少量粗糙度，形成蚀刻散射。
4. 仅在斜视和边缘位置加入很弱的冷白蓝紫发光响应。

图标材质必须依附内层正面材质区域。正面直视时以凹槽阴影和散射为主，不能依靠固定白光保证可见。

## 7. 任务五：重建灯光与背景

文件：`tools/blender/generate_about_crystal_v2.py`

1. 将旧样品的大矩形反光卡替换为窄条形或弧形反射源，产生细长的边缘高光。
2. 使用一组冷白主轮廓光、一组弱蓝紫侧光和一盏极弱暖金点光。
3. 暖金光只允许产生少量边缘闪点，不能形成连续金边。
4. 背景使用接近黑色的深海军蓝，加入极少量星尘以帮助判断透明度；不制作银河粒子带。
5. 使用 Cycles 和去噪验证真实反射、折射与刻痕，不以强 Bloom 掩盖材质问题。

调试顺序固定为：厚度 → 吸收 → 灯光形状 → 边缘发光。出现塑料感时不得只通过提高透明度或发光强度掩盖问题。

## 8. 任务六：渲染第一轮视觉验收图

文件：`output/blender/about-crystal-v2/`

输出五张独立图和一张联系表：

1. `front.png`：检查三瓣盾形、图标位置和整体透明度。
2. `three-quarter.png`：检查外壳厚度、内外间隙、折射和图标贴合。
3. `side.png`：检查是否过厚或鼓胀。
4. `etching-closeup.png`：检查凹槽阴影、边缘散射以及是否像贴纸。
5. `wireframe.png`：检查外层、内层和 UV 承载区域。
6. `contact-sheet.png`：将前五张图整理为一次性评审页。

首轮固定使用 `960×960`、Cycles `64` samples 和去噪；最终确认图固定使用 `960×960`、Cycles `128` samples 和去噪，不在方案未通过时浪费渲染时间。

### 强制视觉停点

生成联系表后立即停止，不修改网站、不制作另外三颗晶体、不推送或部署。向用户展示联系表并收集反馈。

如用户不满意，只调整以下一种或数种参数后重新渲染 v2：

- 三瓣轮廓及厚度。
- 外壳透明度与吸收。
- 内层颜色、尺寸和间隙。
- 刻痕深度、线宽、散射和发光强度。
- 窄条高光的位置与强度。

不得通过更换为另一种晶体设计绕过本次反馈。

## 9. 任务七：视觉通过后的导出与自动验证

只有用户通过第一轮视觉验收后才执行：

1. 保存 `about-crystal-etched-v2.blend`。
2. 仅选择外层和内层对象导出 `about-crystal-etched-v2.glb`。
3. 保留内层 UV 和图标蒙版资产；预览灯光、相机、背景和反光辅助物不进入 GLB。
4. 重新导入 GLB，验证节点名称、网格数量、三角面数、边界尺寸和焊接后的流形状态。
5. 写入 `report.json` 和 `execution.log`。

自动验证必须失败即停止，不能把失败报告描述为通过。

## 10. 验证命令

生成器使用 `--stage` 参数区分两个阶段。在仓库根目录执行第一轮预览：

```powershell
& 'D:\software\Blender\blender.exe' --background --factory-startup --python tools/blender/generate_about_crystal_v2.py -- --stage preview
```

`preview` 只生成 SDF 蒙版、五张预览图、联系表和预览日志，不保存 `.blend`，不导出 `.glb`，也不写通过状态的最终报告。

用户通过视觉验收后执行最终阶段：

```powershell
& 'D:\software\Blender\blender.exe' --background --factory-startup --python tools/blender/generate_about_crystal_v2.py -- --stage finalize
```

`finalize` 使用同一组已批准参数重新生成模型，以 128 samples 渲染最终图，保存 `.blend`、导出 `.glb`，完成往返验证并写入最终报告。

最终生成后检查：

```powershell
Get-Content output/blender/about-crystal-v2/report.json
git diff --check
```

未提供 `--stage`、参数值不是 `preview` 或 `finalize` 时，生成器必须报错退出，避免用户尚未批准时误把样品当成正式资产。

## 11. 用户验收清单

用户查看联系表时只需回答以下问题：

- 是否第一眼像透明宝石，而不是塑料或果冻？
- 三瓣盾形是否满意，侧面是否足够轻薄？
- 内外两层是否有清楚空间感？
- 图标是否确实像刻在内层表面，而不是贴上去或悬浮？
- 蓝紫边缘光和少量金色闪点是否足够克制？

全部通过后才进入 GLB 最终导出和网页实时材质选型。
