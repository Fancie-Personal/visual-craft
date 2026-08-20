import { readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
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
      'Scan an HTML/CSS/Markdown visual draft for generic AI chrome (purple gradients, Inter-only type, empty slogans). Call before delivering PPT or web UI.',
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
      const ext = extname(file).toLowerCase()
      if (!['.html', '.css', '.md', '.tsx', '.jsx', '.svg', '.vue'].includes(ext)) {
        return `不扫描 ${ext}。请给页面或样式源文件。`
      }
      const text = readFileSync(file, 'utf8')
      return formatLintReport(lintVisualText(text, file))
    },
  }))
}
