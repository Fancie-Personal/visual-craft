import { readFileSync, statSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { formatLintReport, lintVisualText, parseSkillFrontmatter } from './lib.js'

export const name = 'dsh-visual-craft'
export const inject = ['skills', 'tools']

const SKILL_FILE = fileURLToPath(new URL('./skills/visual-craft/SKILL.md', import.meta.url))

/**
 * Bundles the visual-craft Agent Skill and a draft linter.
 * Skill solves a real output problem: generic AI slides/pages.
 * Frosted glass is one material recipe inside the skill, not the whole product.
 */
export function apply(ctx) {
  const raw = readFileSync(SKILL_FILE, 'utf8')
  const skill = parseSkillFrontmatter(raw)

  ctx.skills.register({
    name: skill.name,
    description: skill.description,
    content: skill.content,
    path: SKILL_FILE,
    source: 'dsh-visual-craft',
    whenToUse: skill.description,
  })

  ctx.tools.register(defineTool({
    name: 'check_visual_draft',
    description:
      '扫描 HTML/CSS/Markdown 草稿里的套模板红线（紫渐变、裸西文字体、空话标题等）。交付 PPT 或网页前调用。不看图、不打美观分。不要拿 SKILL.md 当扫描对象。',
    parameters: {
      path: {
        type: 'string',
        required: true,
        description: 'File to scan (html, css, md, tsx, svg).',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const file = resolve(args.path)
      const st = statSync(file)
      if (!st.isFile()) {
        return '路径不是文件。请传入单个 html/css/md/tsx。'
      }
      if (/^skill\.md$/i.test(basename(file))) {
        return '不扫描 SKILL.md 说明书（正文会点名禁区色值和空话，用来扫会误伤）。请给页面或样式草稿。'
      }
      const ext = extname(file).toLowerCase()
      if (!['.html', '.css', '.md', '.tsx', '.jsx', '.svg', '.vue'].includes(ext)) {
        return `不扫描 ${ext}。请给页面或样式源文件。`
      }
      const text = readFileSync(file, 'utf8')
      return formatLintReport(lintVisualText(text, file))
    },
  }))
}
