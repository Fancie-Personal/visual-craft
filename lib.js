export const BANNED = [
  { id: 'purple-hex', re: /#(?:6366f1|7c3aed|8b5cf6|a78bfa|7c6af7)/i, hint: '紫靛配色，像默认 AI 模板' },
  { id: 'purple-name', re: /purple\s+gradient|indigo\s+gradient|from-indigo|from-purple/i, hint: '紫渐变英雄区' },
  { id: 'inter-only', re: /font-family:\s*['"]?(?:Inter|Roboto|Arial)['"]?(?:\s*,\s*(?:system-ui|sans-serif))?/i, hint: '只用西文网字体，缺少中文回退' },
  { id: 'unlock', re: /unlock the power|revolutionize|next-generation|赋能未来/i, hint: '空话标题' },
  { id: 'lorem', re: /lorem ipsum/i, hint: '占位拉丁文' },
  { id: 'glow-everywhere', re: /box-shadow:[^;]{0,80}0\s+0\s+\d+px\s+(?:#|rgba\([^)]*255)/i, hint: '霓虹 glow' },
  { id: 'clip-text', re: /background-clip:\s*text|-webkit-background-clip:\s*text/i, hint: '渐变裁剪文字，像默认 AI 标题' },
  { id: 'page-blur', re: /(?<!backdrop-)filter:\s*blur/i, hint: '整页或文字被 filter:blur，磨砂只允许做在面板上' },
  { id: 'slide-hairline', re: /\.slide\s*\{[^}]*border:\s*1px/i, hint: '幻灯片画布不要加浅色描边，投影和 PDF 会露出白边' },
]
const THREE_CARDS = /class=["'][^"']*card[^"']*["'][\s\S]{0,1200}class=["'][^"']*card[^"']*["'][\s\S]{0,1200}class=["'][^"']*card[^"']*["']/i
const THREE_COL = /grid-template-columns:\s*(?:repeat\(\s*3|1fr\s+1fr\s+1fr)/i
const FLEX_CARDS = /\.cards\s*\{[^}]*display:\s*flex/i

export function lintVisualText(text, filename = 'draft') {
  const findings = []
  for (const rule of BANNED) {
    if (rule.re.test(text)) {
      findings.push({ file: filename, id: rule.id, hint: rule.hint })
    }
  }
  if (THREE_CARDS.test(text) && (THREE_COL.test(text) || FLEX_CARDS.test(text) || /display:\s*flex[\s\S]{0,400}\.card/i.test(text))) {
    findings.push({ file: filename, id: 'three-cards', hint: '首页三列卡片套路' })
  }
  const stripped = text.replace(/<pre[\s\S]*?<\/pre>/gi, '').replace(/<code[\s\S]*?<\/code>/gi, '')
  const frostHits = stripped.match(/backdrop-filter:\s*blur/gi) || []
  if (frostHits.length > 3) {
    findings.push({ file: filename, id: 'too-many-frost', hint: '同一稿里磨砂层太多，材料不收敛' })
  }
  const frost = frostHits.length > 0
  const hasRealBg = /background-image\s*:/i.test(text) || /url\(/i.test(text) || /radial-gradient\s*\(/i.test(text)
  if (frost && !hasRealBg) {
    findings.push({ file: filename, id: 'frost-on-empty', hint: '有磨砂但看不出衬底，白底玻璃会发脏' })
  }
  const paper = /\.paper\s*\{/i.test(text) || /visual-craft:\s*paper/i.test(text)
  if (paper && frost) {
    findings.push({ file: filename, id: 'mix-material', hint: 'paper 稿里出现 backdrop-filter，材料混搭' })
  }
  return findings
}

export function formatLintReport(findings) {
  if (!findings.length) {
    return '视觉检查通过：没有打到常见 AI 套模板特征。仍须人工看一眼层级和对比度。'
  }
  const lines = findings.map((item) => `- [${item.id}] ${item.file}：${item.hint}`)
  return `视觉检查未通过（${findings.length}）：\n${lines.join('\n')}\n先改这些再交给用户。`
}

export function parseSkillFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { name: 'visual-craft', description: '', content: raw }
  const fm = match[1]
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || 'visual-craft'
  const folded = fm.match(/^description:\s*>-?\s*\n((?:[ \t].*\n?)*)/m)
  const description = folded
    ? folded[1].split('\n').map((line) => line.trim()).filter(Boolean).join(' ')
    : ((fm.match(/^description:\s*(.+)$/m) || [])[1] || '').trim()
  return { name, description, content: match[2].trim() }
}
