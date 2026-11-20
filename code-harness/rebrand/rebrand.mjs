// Apply the Code Harness brand to the installed DSH release. Runs once at image
// build, after `npm install -g @deepseek-ai/dsh`. Fails if any "DeepSeek Harness"
// text is left in the files it owns. Licence and notice files are never touched.
import { execSync } from 'node:child_process'
import { copyFileSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const here = new URL('.', import.meta.url).pathname
const dsh = join(execSync('npm root -g').toString().trim(), '@deepseek-ai/dsh')
const scope = join(dsh, 'node_modules/@deepseek-ai')
const edit = (file, change) => writeFileSync(file, change(readFileSync(file, 'utf8')))
const json = (file, change) => edit(file, text => JSON.stringify(change(JSON.parse(text)), null, 2) + '\n')

// 1. Brand plugin: the official package keeps its id and slots, with our artwork.
const brand = join(scope, 'dsh-client-ui-brand-official')
const mark = readFileSync(join(here, 'assets/mark-128.png')).toString('base64')
writeFileSync(join(brand, 'lib/client.js'), readFileSync(join(here, 'brand-client.js'), 'utf8').replace('__MARK__', mark))
rmSync(join(brand, 'lib/client.js.map'), { force: true })
rmSync(join(brand, 'lib/assets'), { recursive: true, force: true })
json(join(brand, 'package.json'), p => ({ ...p, description: 'Code Harness brand mark and name' }))

// 2. Web app shell: title, install name and icons.
const dist = join(scope, 'dsh-web-frontend/dist')
for (const name of readdirSync(join(here, 'assets')).filter(n => n !== 'mark-128.png'))
  copyFileSync(join(here, 'assets', name), join(dist, name))
edit(join(dist, 'index.html'), html => html
  .replace(/<title>[^<]*<\/title>/, '<title>Code Harness</title>')
  .replace(/(apple-mobile-web-app-title" content=")[^"]*/, '$1Code Harness'))
json(join(dist, 'manifest.webmanifest'), m => ({ ...m, name: 'Code Harness', short_name: 'Code Harness' }))

// 3. Display patches: compiled UI code that shows npm package ids. Each anchor
// must match exactly the expected number of times, so an upstream change fails
// the build here instead of silently showing the scope again.
const scopeless = expr => `${expr}.replace(/^@deepseek-ai\\//,\`\`)`
const display = [
  ['dsh-client-ui-settings-plugin-inventory/lib/client.js', 'moduleName:row.moduleName', 2],
  ['dsh-client-ui-settings-plugin-inventory/lib/client.js', 'moduleName:entry.moduleName', 2],
]
for (const [file, anchor, count] of display) {
  const path = join(scope, file)
  const text = readFileSync(path, 'utf8')
  const found = text.split(anchor).length - 1
  if (found !== count) throw Error(`display patch: expected ${count} x ${anchor} in ${file}, found ${found}`)
  const [prop, expr] = anchor.split(':')
  writeFileSync(path, text.replaceAll(anchor, `${prop}:${scopeless(expr)}`))
  rmSync(path + '.map', { force: true })
}

// 4. Product name in DSH's own text: UI strings, prompts, plugin descriptions.
const owned = []
const walk = dir => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) { if (entry.name !== 'node_modules' && entry.name !== 'src') walk(path) }
    else if (/\.(js|mjs|cjs|json|ya?ml|html|webmanifest)$/.test(entry.name) && !entry.name.endsWith('.map')) owned.push(path)
  }
}
walk(join(dsh, 'lib'))
owned.push(join(dsh, 'package.json'))
for (const pkg of readdirSync(scope)) walk(join(scope, pkg))
// The product name, not the npm scope or repository URLs (lower-case, hyphenated).
const name = /DeepSeek Harness/
let changed = 0
for (const file of owned) {
  const text = readFileSync(file, 'utf8')
  if (!name.test(text)) continue
  writeFileSync(file, text.replaceAll(new RegExp(name, 'g'), 'Code Harness'))
  changed++
}
const left = owned.filter(file => /deepseek\s+harness/i.test(readFileSync(file, 'utf8')))
if (left.length) throw Error('brand text left in:\n' + left.join('\n'))
console.log(`Code Harness brand applied: ${changed} files renamed, ${owned.length} scanned`)
