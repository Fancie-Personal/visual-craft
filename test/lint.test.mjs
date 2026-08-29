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
  assert.ok(lintVisualText('body { color: #4f46e5; }', 'b.html').some((x) => x.id === 'purple-hex'))
  assert.ok(lintVisualText('<div class="bg-violet-500">', 'c.html').some((x) => x.id === 'purple-name'))
  assert.ok(lintVisualText('<div class="from-violet-500 text-violet-200">', 'v.html').some((x) => x.id === 'purple-name'))
  assert.ok(lintVisualText('h1 { } /* 开启全新体验 */ 一站式解决方案', 's.html').some((x) => x.id === 'unlock'))
  assert.ok(lintVisualText('body { font-family: Geist, sans-serif; }', 'd.html').some((x) => x.id === 'inter-only'))
  assert.equal(lintVisualText('body { font-family: Inter, "PingFang SC", sans-serif; }', 'ok.html').some((x) => x.id === 'inter-only'), false)
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
  const tailwind = `
    <div class="grid grid-cols-3">
      <div class="card">a</div>
      <div class="card">b</div>
      <div class="card">c</div>
    </div>
  `
  assert.ok(lintVisualText(tailwind, 'tw.html').some((x) => x.id === 'three-cards'))
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
  const white = 'body { background: #ffffff; } .pane { backdrop-filter: blur(20px); }'
  assert.ok(lintVisualText(white, 'white.css').some((x) => x.id === 'frost-on-empty'))
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
  const inkBg = `
    body { background-color: #0b0f19; }
    .frost { backdrop-filter: blur(18px); }
  `
  assert.equal(lintVisualText(inkBg, 'ink-bg.css').length, 0)
})

test('recipe shown in pre does not trip too-many-frost', () => {
  const text = `
    body { background-image: url(hero.jpg); }
    .frost { backdrop-filter: blur(18px); }
    <pre>.frost { backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }</pre>
  `
  assert.equal(lintVisualText(text, 'deck.html').some((x) => x.id === 'too-many-frost'), false)
  const twoPanes = `
    body { background-image: url(hero.jpg); }
    .a { backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
    .b { backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
  `
  assert.equal(lintVisualText(twoPanes, 'two-frost.css').some((x) => x.id === 'too-many-frost'), false)
})

test('paper plus backdrop-filter is mix-material', () => {
  const text = `
    /* visual-craft: paper */
    .paper { background: #f4efe6; }
    .x { backdrop-filter: blur(12px); background-image: url(a.jpg); }
  `
  const hits = lintVisualText(text, 'mix.css').map((x) => x.id)
  assert.ok(hits.includes('mix-material'))
  const ink = `
    /* visual-craft: ink */
    .ink { background: #fafafa; }
    .x { backdrop-filter: blur(12px); background-color: #111; }
  `
  assert.ok(lintVisualText(ink, 'ink-mix.css').some((x) => x.id === 'mix-material'))
  const studio = `
    /* visual-craft: studio */
    .studio { background: #111827; }
    img { filter: blur(8px); }
  `
  assert.ok(lintVisualText(studio, 'studio-mix.css').some((x) => x.id === 'mix-material'))
})

test('flags slide canvas hairline', () => {
  const hits = lintVisualText('.slide { width: 1280px; border: 1px solid #fff; }', 'deck.css').map((x) => x.id)
  assert.ok(hits.includes('slide-hairline'))
  assert.ok(lintVisualText('.slide { border-width: 1px; border-style: solid; }', 'w.css').some((x) => x.id === 'slide-hairline'))
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
  assert.match(skill.description, /海报/)
  assert.match(skill.content, /扫得到/)
})
