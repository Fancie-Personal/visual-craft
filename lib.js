export const BANNED = [
  { id: 'purple-hex', re: /#(?:6366f1|7c3aed|8b5cf6|a78bfa|7c6af7|4f46e5|818cf8)/i, hint: '紫靛配色，像默认 AI 模板' },
  { id: 'purple-name', re: /purple\s+gradient|indigo\s+gradient|from-indigo|from-purple|from-violet|bg-indigo-|bg-violet-|bg-purple-|text-indigo-|text-violet-/i, hint: '紫渐变英雄区' },
  { id: 'unlock', re: /unlock the power|revolutionize|next-generation|赋能未来|unleash (?:the )?(?:power|potential)|cutting-edge|seamlessly|一站式|开启全新/i, hint: '空话标题' },
  { id: 'lorem', re: /lorem ipsum/i, hint: '占位拉丁文' },
  { id: 'glow-everywhere', re: /box-shadow:[^;]{0,80}0\s+0\s+\d+px\s+(?:#|rgba\([^)]*255)/i, hint: '霓虹 glow' },
  { id: 'clip-text', re: /background-clip:\s*text|-webkit-background-clip:\s*text/i, hint: '渐变裁剪文字，像默认 AI 标题' },
  { id: 'page-blur', re: /(?<!backdrop-)filter:\s*blur/i, hint: '整页或文字被 filter:blur，磨砂只允许做在面板上' },
  { id: 'slide-hairline', re: /\.slide\s*\{[^}]*(?:border:\s*1px|border-width:\s*1px)/i, hint: '幻灯片画布不要加浅色描边，投影和 PDF 会露出白边' },
]
const THREE_CARDS = /class=["'][^"']*card[^"']*["'][\s\S]{0,1200}class=["'][^"']*card[^"']*["'][\s\S]{0,1200}class=["'][^"']*card[^"']*["']/i
const THREE_COL = /grid-template-columns:\s*(?:repeat\(\s*3|1fr\s+1fr\s+1fr)|grid-cols-3/i
const FLEX_CARDS = /\.cards\s*\{[^}]*display:\s*flex/i
const WESTERN_ONLY = /(?:^|[,\s"'(])(?:Inter|Roboto|Arial|Geist|Plus Jakarta Sans|Poppins|Montserrat)(?:\s*['"])?(?:\s*,|\s*$)/i
const CJK_FALLBACK = /PingFang|Hiragino|YaHei|Heiti|Noto Sans (?:SC|CJK)|Source Han|Microsoft YaHei|苹方|微软雅黑|思源/i
const NEAR_WHITE = /#(?:fff(?:fff)?|fafafa|f8fafc|f4f4f5|f9fafb)\b/i

function hasInterOnlyFontStacks(text) {
  const decls = text.match(/font-family\s*:\s*[^;}{]+/gi) || []
  for (const decl of decls) {
    if (!WESTERN_ONLY.test(decl)) continue
    if (!CJK_FALLBACK.test(decl)) return true
  }
  return false
}

function hasRealBackground(text) {
  if (/background-image\s*:/i.test(text) || /url\(/i.test(text) || /radial-gradient\s*\(/i.test(text)) {
    return true
  }
  const bgDecls = text.match(/background(?:-color)?\s*:\s*[^;}{]+/gi) || []
  for (const decl of bgDecls) {
    if (NEAR_WHITE.test(decl)) continue
    if (/#[0-9a-f]{3,8}\b/i.test(decl)) return true
    if (/rgba?\(\s*\d+/i.test(decl)) return true
    if (/hsla?\(/i.test(decl)) return true
    if (/\b(?:black|navy|slate|zinc|gray|grey|stone|neutral)\b/i.test(decl)) return true
  }
  return false
}

function checkMixMaterial(text, frost) {
  const paper = /\.paper\s*\{/i.test(text) || /visual-craft:\s*paper/i.test(text)
  const ink = /\.ink\s*\{/i.test(text) || /visual-craft:\s*ink/i.test(text)
  const studio = /\.studio\s*\{/i.test(text) || /visual-craft:\s*studio/i.test(text)
  if ((paper || ink) && frost) {
    const mat = paper ? 'paper' : 'ink'
    return { id: 'mix-material', hint: `${mat} 稿里出现 backdrop-filter，材料混搭` }
  }
  if (studio && frost) {
    return { id: 'mix-material', hint: 'studio 稿里出现 backdrop-filter，材料混搭' }
  }
  if (studio && /(?<!backdrop-)filter:\s*blur/i.test(text)) {
    return { id: 'mix-material', hint: 'studio 稿里出现 filter: blur，材料混搭' }
  }
  return null
}

export function lintVisualText(text, filename = 'draft') {
  const findings = []
  for (const rule of BANNED) {
    if (rule.re.test(text)) {
      findings.push({ file: filename, id: rule.id, hint: rule.hint })
    }
  }
  if (hasInterOnlyFontStacks(text)) {
    findings.push({ file: filename, id: 'inter-only', hint: '只用西文网字体，缺少中文回退' })
  }
  if (THREE_CARDS.test(text) && (THREE_COL.test(text) || FLEX_CARDS.test(text) || /display:\s*flex[\s\S]{0,400}\.card/i.test(text))) {
    findings.push({ file: filename, id: 'three-cards', hint: '首页三列卡片套路' })
  }
  const stripped = text.replace(/<pre[\s\S]*?<\/pre>/gi, '').replace(/<code[\s\S]*?<\/code>/gi, '')
  const frostHits = stripped.match(/(?<!-webkit-)backdrop-filter:\s*blur/gi) || []
  if (frostHits.length > 3) {
    findings.push({ file: filename, id: 'too-many-frost', hint: '同一稿里磨砂层太多，材料不收敛' })
  }
  const frost = frostHits.length > 0
  if (frost && !hasRealBackground(text)) {
    findings.push({ file: filename, id: 'frost-on-empty', hint: '有磨砂但看不出衬底，白底玻璃会发脏' })
  }
  const mix = checkMixMaterial(text, frost)
  if (mix) {
    findings.push({ file: filename, id: mix.id, hint: mix.hint })
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
