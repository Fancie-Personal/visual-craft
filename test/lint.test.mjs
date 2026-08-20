import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatLintReport, lintVisualText, parseSkillFrontmatter } from '../lib.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

test('flags purple AI chrome and Inter-only type', () => {
  const text = `
    body { font-family: Inter, sans-serif; background: linear-gradient(#6366f1, #7c3aed); }
    h1 { } /* Unlock the power */
  `
  const hits = lintVisualText(`${text}\nUnlock the power of AI`, 'a.html').map((x) => x.id)
  assert.ok(hits.includes('purple-hex'))
  assert.ok(hits.includes('inter-only'))
  assert.ok(hits.includes('unlock'))
})

test('flags three generic cards in a flex row', () => {
  const html = `
    <style>.cards { display: flex; } .card { flex: 1; }</style>
    <div class="cards">
      <div class="card">a</div>
      <div class="card">b</div>
      <div class="card">c</div>
    </div>
  `
  const hits = lintVisualText(html, 'cards.html').map((x) => x.id)
  assert.ok(hits.includes('three-cards'))
})

test('two panes named card do not trip three-cards', () => {
  const html = `
    <div class="card">misread</div>
    <div class="card">still only two</div>
  `
  assert.equal(lintVisualText(html, 'two.html').length, 0)
})

test('frost without a background is a finding', () => {
  const text = '.pane { backdrop-filter: blur(20px); color: white; }'
  const hits = lintVisualText(text, 'frost.css').map((x) => x.id)
  assert.deepEqual(hits, ['frost-on-empty'])
})

test('flags gradient clipped titles and page blur', () => {
  const text = `
    h1 { background: linear-gradient(#fff, #38bdf8); -webkit-background-clip: text; }
    img { filter: blur(8px); }
  `
  const hits = lintVisualText(text, 'chrome.css').map((x) => x.id)
  assert.ok(hits.includes('clip-text'))
  assert.ok(hits.includes('page-blur'))
})

test('clean frost recipe passes', () => {
  const text = `
    /* visual-craft: frost · 暗场 */
    body { background-image: url(hero.jpg); }
    .frost {
      background: rgba(16, 18, 24, 0.48);
      backdrop-filter: blur(18px) saturate(1.2);
    }
  `
  assert.deepEqual(lintVisualText(text, 'ok.css'), [])
  assert.match(formatLintReport([]), /通过/)
})

test('recipe shown in pre does not trip too-many-frost', () => {
  const text = `
    body { background-image: url(hero.jpg); }
    .frost { backdrop-filter: blur(18px); }
    <pre>.frost { backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }</pre>
  `
  assert.equal(lintVisualText(text, 'deck.html').some((x) => x.id === 'too-many-frost'), false)
})

test('paper plus backdrop-filter is mix-material', () => {
  const text = `
    /* visual-craft: paper */
    .paper { background: #f4efe6; }
    .x { backdrop-filter: blur(12px); background-image: url(a.jpg); }
  `
  const hits = lintVisualText(text, 'mix.css').map((x) => x.id)
  assert.ok(hits.includes('mix-material'))
})

test('flags slide canvas hairline', () => {
  const hits = lintVisualText('.slide { width: 1280px; border: 1px solid #fff; }', 'deck.css').map((x) => x.id)
  assert.ok(hits.includes('slide-hairline'))
})

test('skill frontmatter is kebab-case and mentions frost + PPT', () => {
  const raw = readFileSync(fileURLToPath(new URL('../skills/visual-craft/SKILL.md', import.meta.url)), 'utf8')
  const skill = parseSkillFrontmatter(raw)
  assert.equal(skill.name, 'visual-craft')
  assert.match(skill.description, /PPT/)
  assert.match(skill.description, /磨砂/)
  assert.match(skill.content, /backdrop-filter/)
  assert.match(skill.content, /\.paper/)
  assert.match(skill.content, /白边/)
  assert.match(skill.content, /background-clip/)
})
