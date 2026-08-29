# visual-craft

给 Agent 的前端 / 幻灯片设计约束。先选一种材料，再写页面；用正则扫已知套模板红线。

不是微调模型。过检不等于好看。磨砂（frost）只是四种材料之一。不要拿 SKILL.md 当扫描对象。

## 装 Skill

把 `skills/visual-craft/SKILL.md` 拷到 Agent 能扫到的目录，例如：

```
~/.agents/skills/visual-craft/SKILL.md
~/.dsh/skills/visual-craft/SKILL.md
```

新开一轮对话后说：

- 用 visual-craft 做一页磨砂质感的活动海报网页
- 按 visual-craft 出项目介绍 PPT

Cursor 等兼容 [Agent Skill](https://docs.cursor.com) 的工具，放同一份 `SKILL.md` 即可。

## 质检（可选）

DeepSeek Harness 插件会注册 Skill，并提供 `check_visual_draft`（扫 HTML / CSS / MD 源码，不是看图）。

```sh
npx @deepseek-ai/dsh plugin --profile desktop add /path/to/visual-craft
```

装、验、自己加规则的步骤见 [DEVELOPER.md](DEVELOPER.md)。

## 自测

```sh
node --test test/lint.test.mjs
```

`examples/bad_case_generic.html` 应打出多条红线；`examples/good_case_frost.html` 应通过已知规则，仍须人看版式。

## 材料（四选一，不要混）

| 材料 | 适用 |
|---|---|
| frost | 暗场海报、投影、半透明面板压在真实衬底上 |
| paper | 长文、报告、打印 |
| ink | 标题页、品牌，全场一种强调色 |
| studio | 仪表盘、产品说明，硬阴影、不用 blur |

## 仓库里有什么

```
skills/visual-craft/SKILL.md   Skill 正文（拷这一份就能用）
lib.js                         质检规则
index.js                       DSH 插件入口
test/lint.test.mjs             单测
examples/                      正反例 HTML
```

## License

MIT
