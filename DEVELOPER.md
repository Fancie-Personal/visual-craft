# 开发者上手

目标：把 Skill 接到 Agent 上，并跑通质检。不改模型权重。

## 1. 装 Skill

```bash
mkdir -p ~/.agents/skills/visual-craft ~/.dsh/skills/visual-craft
cp skills/visual-craft/SKILL.md ~/.agents/skills/visual-craft/SKILL.md
cp skills/visual-craft/SKILL.md ~/.dsh/skills/visual-craft/SKILL.md
```

**新开一轮对话**（旧会话不一定刷新技能目录），说：

> 用 visual-craft 做一页磨砂质感的校园活动海报网页

验收：回复里声明材料是 frost；不要紫渐变三列卡。Cursor 等兼容 `SKILL.md` 的环境，把同一份文件放进对应 skills 目录即可。

## 2. 跑质检（不需要调用大模型）

```bash
node --test test/lint.test.mjs
```

对照样本（期望：对照组多条已知红线，规范样本 0 条）：

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs'
import { lintVisualText, formatLintReport } from './lib.js'
for (const f of ['examples/bad_case_generic.html', 'examples/good_case_frost.html']) {
  console.log('===', f, '===')
  console.log(formatLintReport(lintVisualText(readFileSync(f, 'utf8'), f)))
}
"
```

需要 Agent 在对话里调用检查工具时，再注入 DSH 插件：

```bash
npx @deepseek-ai/dsh plugin --profile desktop add /path/to/visual-craft
```

不要拿 `SKILL.md` 当扫描对象（正文会点名禁区，会误伤）。

## 3. 自己适配

换场景，不换机制。新 Skill：`name` 用 kebab-case，`description` 写成**一行**并写清何时加载，正文写正向步骤和负向红线。

若改 `lib.js` 加红线：先改规则，再补 `test/lint.test.mjs`，最后扫 `examples/`。不要为了多打一条去改 `bad_case` 的标题诱饵。过检不等于好看。
