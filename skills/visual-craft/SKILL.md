---
name: visual-craft
description: Make slides, PPT, landing pages, dashboards, and UI that do not look like default AI chrome. Use when the user asks for PPT, 幻灯片, 网页, 落地页, 海报, 介绍页, dashboard, 磨砂, 玻璃拟态, 套模板, frosted glass, glassmorphism, or when a draft looks generic (purple gradient, Inter, three feature cards).
---

# Visual Craft

先选定 **一种材料**，再写页面或幻灯片。禁止把「好看」理解成堆特效。

质检 `check_visual_draft` 是源码正则扫描，不是 AST，也不是看图。过检不等于好看。

## 开工前必须做的 4 步

1. 用一句话写下使用场景（谁、在哪看、亮还是暗）。
2. 从下面选 **恰好一种** 材料，写进 HTML 注释或设计说明，整份作品不许换材料。
3. 定 1 个主色 + 1 个墨色 + 1 个表面色。禁止第四个装饰色，除非它是数据图例。
4. 定字号阶梯（例如 14 / 18 / 28 / 48），标题和正文不得抢同一级。

推荐注释格式：

```html
<!-- visual-craft: frost · 暗场投影 · 主#38bdf8 墨#0b0f19 面#f8fafc · 14/18/28/48 -->
```

做完后调用 `check_visual_draft`（若已安装）或按「禁区」自查，再交给用户。

**质检边界**（过检 ≠ 好看）：

- **扫得到**：紫靛色值与 Tailwind 紫类、裸西文栈（Inter / Geist / Poppins 等且无中文回退）、空话、三列 `.card`（含 `grid-cols-3`）、拉丁占位、霓虹 glow、无衬底磨砂、渐变裁剪字、材料混搭（paper / ink 混磨砂、studio 混 blur）、`.slide` 画布描边。`-webkit-backdrop-filter` 不另计一层磨砂。
- **扫不到**：空盒子、16:9 黑边、PPT 编辑区浅线、python-pptx 母版白缝、同页字体/强调色过多——见下文「踩过的坑」，须人工自查

## 材料（只选一个）

| 材料 | 适用 | 做法 |
|---|---|---|
| **frost 磨砂玻璃** | 暗色英雄区、叠在照片/视频上的卡片、PPT 封面 | 半透明填充 + 背景模糊 + 1px 浅描边。文字本身不模糊。 |
| **paper 纸** | 长文、报告页、打印友好 | 暖白底、细线分隔、几乎无阴影。 |
| **ink 墨** | 极简品牌、标题页 | 大面积留白或大面积黑，只有一种强调色。 |
| **studio 灯** | 产品说明、仪表盘 | 实色块 + 硬阴影或无阴影，不使用 blur。 |

用户若只说「磨砂 / 玻璃拟态」，选 **frost**。用户没说材料时，根据场景自选并在回复里声明。

投影 PPT、暗场海报默认 **frost**。要打印/长文默认 **paper**。不要因为「高级」就全场磨砂。

## frost 配方（可直接抄）

数值可微调，逻辑不能改：半透明面板压在 **真实衬底** 上，字用实色。

```css
.frost {
  background: rgba(16, 18, 24, 0.48);
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.92);
}
```

硬性限制：

- 衬底必须是图、视频、或大色块 / `radial-gradient` 光斑。空白底上做玻璃等于没做。
- `blur` 只加在面板上。禁止 `filter: blur()` 整页，禁止给文字加 blur。
- 同一屏磨砂面板不超过 3 块。
- 标题用实色，禁止渐变字（`-webkit-background-clip: text`）。
- 不要霓虹描边。

PPT / 不支持 `backdrop-filter` 时：半透明色块 + 轻噪点，仍然是「一块玻璃压在衬底上」，不要改成紫渐变卡片。

## paper / ink / studio 配方（可直接抄）

```css
.paper {
  background: #f4efe6;
  color: #1c1917;
  border: none;
  box-shadow: none;
}
.paper hr { border: 0; border-top: 1px solid #d6d3d1; }

.ink {
  background: #fafafa;
  color: #111111;
}
.ink .mark { color: #c2410c; } /* 全场只许这一种强调色 */

.studio {
  background: #111827;
  color: #f8fafc;
  box-shadow: 8px 8px 0 #22c55e; /* 硬边，不要 blur */
}
```

选 paper / ink 时不要出现 `backdrop-filter`。选 studio 时不要出现 `filter: blur`。

## 网页

- 先排信息：标题、一句解释、一个主按钮。不要先做三列 feature。
- 间距用 8 的倍数。
- 动效只允许一处（悬停或入场），时长 ≤ 240ms。
- 移动宽度先按 390px 想一遍。

## 幻灯片 / PPT

- 16:9。一页一个论点。投影正文约 22–28px，标题 36–48px（按 1920×1080 计）。
- 封面：大标题 + 一句副标题 + 材料签名（例如「frost · 暗场」）。
- 正文页：最多 5 行要点，或一张图 + 一句标注。不要把终端日志、CSS 原文、`node --test` 输出贴进幻灯片当「样本」。
- 禁止剪贴画、禁止每页换主题色、禁止页脚写满英文口号。
- 禁止用 emoji 当章节符号。
- 自己的介绍 PPT 必须能过 `check_visual_draft`：不要三列 `.card`，不要渐变标题字。禁区页不要复写被禁色值与空话原句。

## 做 PPT 时踩过的坑（必须自查）

这些正则扫不到，但会让暗场幻灯片看起来像没做完。

- **画布不要白边**：`html/body` 必须与墨色相同；`.slide` 禁止描边。页眉页脚也不要用贯通全宽的浅色 `border`，投影上看起来像画布白框。Chrome 打印分页常在四周露出白缝，交付用 **16:9 像素截屏** 再装订，不要只靠 print-to-pdf。
- **python-pptx 默认是 4:3**：只改宽高不够，`p:sldSz` 仍可能是 `type="screen4x3"`。必须写成 `type="screen16x9"`，`cx="12192000"` `cy="6858000"`。不要写不存在的 `type="widescreen"`，Office 会提示修复。
- **母版默认是白底**：python-pptx 的 slideMaster 用 `bg1`（主题里的 window 白）。幻灯片背景填墨色也不够，1 像素缝会漏出白边。必须把母版背景和主题 `lt1` 都改成墨色，并设 `showMasterSp="0"`，避免页脚占位露出来。
- **不要在画布上再描一圈墨框**：那会变成「黑卡套在灰底上」，编辑区本来就会给幻灯片描 1px 浅线，两层叠在一起更像白边。图片 `spPr` 里加 `<a:ln w="0"><a:noFill/></a:ln>`，禁止 Office 给图加默认描边。
- **PowerPoint 编辑区四周的浅线去不掉**：那是软件给幻灯片画的舞台描边，截图像素里没有这条线。要确认请按 **幻灯片放映**（全黑到边），不要看编辑窗口。
- **图片不要伸出画布**：`add_picture` 的 x/y 不要用负数「出血」。越界图片同样会触发修复对话框。铺满就用 `(0,0)` + 与幻灯片相同的宽高；幻灯片背景填墨色即可。
- **预览会骗人**：HTML 预览若有 `body padding`，屏幕上看是卡片墙；导出铺满后又是另一回事。交稿前打开 PDF / PPTX 看四角像素。
- **空盒子即失败**：`flex:1` 把面板撑满、里面只有一行小字，算排版失败。要么把字号和第二行说明填满，要么不要把盒子拉高。
- **不要把 16:9 截图丢进更高的竖盒里用 contain**：上下会空出两条黑边。截图保持 16:9，剩余高度用标签/要点填满。`object-fit: cover` 会裁掉标题，对照样本禁用。
- **frost 页不要整卡换材料**：要展示 paper/ink/studio，用色条或小样片，不要把整块面板刷成暖白或纯白，否则暗场被炸开。材料页优先「本套选用的那种」做现场一块，其余三种作对照条。
- **一屏磨砂不超过 3 块**：材料对照不要四块各自 `backdrop-filter`。
- **样本页写清口径**：构造的可复现 HTML，不是线上 A/B 统计。过检 ≠ 好看。

## 导出（HTML 幻灯片 → PDF / PPTX）

1. 用 Chrome headless 按页截屏：`--window-size=1920,1080 --force-device-scale-factor=1`，URL 带 `?shot=N` 只显示第 N 页。`--default-background-color` 设成墨色十进制，避免截到白底。
2. 多页 PNG 用 PIL 存 PDF。
3. PPTX：空白版式 + 墨色背景 + 每页一张铺满的 PNG；`sldSz` 用上一节的 `screen16x9`。
4. 打开前在本机用 PowerPoint 试一次。若弹出「发现内容问题」，先查 `sldSz/@type` 和图片是否越界，不要让用户点「修复」当交付。

## 禁区（出现即视为失败，必须改）

- 紫/靛渐变底 + 白字（含 `#6366f1` `#7c3aed` `#4f46e5` `#8b5cf6` 以及 `bg-indigo-` / `bg-violet-` / `from-violet` / “purple gradient hero”）
- `font-family` 只用 Inter / Roboto / Arial / Geist / Poppins 等西文网字体撑场面，且**同一条声明里**没有 PingFang / 微软雅黑 / 思源等中文回退
- 默认三列图标卡片当首页（`display:flex/grid` + 三个 `.card`）
- “Unlock the power / Revolutionize / Next-generation / 赋能未来 / 一站式 / 开启全新” 空话标题
- `lorem ipsum`
- 每个按钮都加 glow
- 渐变裁剪文字（`background-clip: text`）
- 整页 `filter: blur()`（studio 材料尤其禁止）
- paper / ink 稿里出现 `backdrop-filter`；studio 稿里出现 `backdrop-filter` 或 `filter: blur`
- 同页超过 3 种字体、超过 4 种强调色（**正则扫不到**，须人工自查）

## 交付

- 网页：可打开的 HTML/CSS，或组件文件 + 一段「材料 / 三色 / 字号」说明。
- PPT：页清单（每页一句话目的）+ 能打开的 HTML slides 或 pptx；关键页必须带材料签名。导出前按「踩过的坑」看四角像素和放映，不要等用户截编辑区白边再改。
- 改本 Skill 或 `check_visual_draft` 时：先让 SKILL.md 与 `lib.js` 对齐，再改会断言 Skill 正文的测试；然后扫对照样本 / 规范样本 / 介绍页，确认条数后再改报告或幻灯片上的 n/n。不要先写「扫得到」之类断言再补说明书。
- 回复里用中文说明选了哪种材料；用户要英文界面再把界面文案写成英文。
