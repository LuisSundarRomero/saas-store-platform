// Correct hex patterns for Windows-1252 double-encoding corruption
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

function h(s) { return Buffer.from(s.split(' ').map(b => parseInt(b, 16))) }

// Windows-1252 differs from ISO-8859-1 for bytes 0x80-0x9F:
// 0x80=€ 0x82=' 0x83=ƒ 0x84=" 0x85=… 0x86=† 0x87=‡ 0x88=ˆ 0x89=‰ 0x8A=Š
// 0x8B=‹ 0x8C=Œ 0x8E=Ž 0x91=' 0x92=' 0x93=" 0x94=" 0x95=• 0x96=– 0x97=—
// 0x98=˜ 0x99=™ 0x9A=š 0x9B=› 0x9C=œ 0x9E=ž 0x9F=Ÿ

const fixes = [
  // ¡ U+00A1 (C2 A1) → Â(C3 82) + ¡(C2 A1) corrupted = C3 82 C2 A1
  [h('C3 82 C2 A1'), h('C2 A1')],
  // ¿ U+00BF (C2 BF) → Â + ¿ = C3 82 C2 BF
  [h('C3 82 C2 BF'), h('C2 BF')],
  // Ú U+00DA (C3 9A) → Ã(C3 83) + š/0x9A→U+0161(C5 A1) = C3 83 C5 A1
  [h('C3 83 C5 A1'), h('C3 9A')],
  // á U+00E1 (C3 A1) → Ã(C3 83) + ¡(C2 A1) = C3 83 C2 A1  (but only if prev fix ran already)
  // Note: Ã + combinations already handled by fix1. Skip to avoid conflicts.

  // 🦇 bat U+1F987 (F0 9F A6 87)
  // F0→ð(C3B0), 9F→Ÿ/0x9F=U+0178(C5B8), A6→¦(C2A6), 87→‡/0x87=U+2021(E280A1)
  [h('C3 B0 C5 B8 C2 A6 E2 80 A1'), h('F0 9F A6 87')],

  // 🖤 black heart U+1F5A4 (F0 9F 96 A4)
  // 96→–/0x96=U+2013(E28093), A4→¤(C2A4)
  [h('C3 B0 C5 B8 E2 80 93 C2 A4'), h('F0 9F 96 A4')],

  // 💬 speech bubble U+1F4AC (F0 9F 92 AC)
  // 92→'/0x92=U+2019(E28099), AC→¬(C2AC)
  [h('C3 B0 C5 B8 E2 80 99 C2 AC'), h('F0 9F 92 AC')],

  // 🚚 truck U+1F69A (F0 9F 9A 9A)
  // 9A→š/0x9A=U+0161(C5A1), 9A→š(C5A1)
  [h('C3 B0 C5 B8 C5 A1 C5 A1'), h('F0 9F 9A 9A')],

  // 📸 camera with flash U+1F4F8 (F0 9F 93 B8)
  // 93→"/0x93=U+201C(E2809C), B8→¸(C2B8)
  [h('C3 B0 C5 B8 E2 80 9C C2 B8'), h('F0 9F 93 B8')],

  // 📱 phone U+1F4F1 (F0 9F 93 B1)
  // 93→"(E2809C), B1→±(C2B1)
  [h('C3 B0 C5 B8 E2 80 9C C2 B1'), h('F0 9F 93 B1')],

  // 📦 package U+1F4E6 (F0 9F 93 A6)
  // 93→"(E2809C), A6→¦(C2A6)
  [h('C3 B0 C5 B8 E2 80 9C C2 A6'), h('F0 9F 93 A6')],

  // 📷 camera U+1F4F7 (F0 9F 93 B7)
  // 93→"(E2809C), B7→·(C2B7)
  [h('C3 B0 C5 B8 E2 80 9C C2 B7'), h('F0 9F 93 B7')],

  // 🙈 see-no-evil U+1F648 (F0 9F 99 88)
  // 99→™/0x99=U+2122(E284A2), 88→ˆ/0x88=U+02C6(CBB6... wait CB 86)
  [h('C3 B0 C5 B8 E2 84 A2 CB 86'), h('F0 9F 99 88')],

  // 🔗 link U+1F517 (F0 9F 94 97)
  // 94→"/0x94=U+201D(E2809D), 97→—/0x97=U+2014(E28094)
  [h('C3 B0 C5 B8 E2 80 9D E2 80 94'), h('F0 9F 94 97')],

  // 💰 money U+1F4B0 (F0 9F 92 B0)
  // 92→'(E28099), B0→°(C2B0)
  [h('C3 B0 C5 B8 E2 80 99 C2 B0'), h('F0 9F 92 B0')],

  // 📍 pin U+1F4CD (F0 9F 93 8D)
  // 93→"(E2809C), 8D→control→C28D
  [h('C3 B0 C5 B8 E2 80 9C C2 8D'), h('F0 9F 93 8D')],
]

function walkFiles(dir) {
  const results = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(name)) results.push(...walkFiles(full))
    } else if (['.tsx', '.ts', '.css'].includes(extname(name))) {
      results.push(full)
    }
  }
  return results
}

let totalFixed = 0
for (const file of walkFiles('src')) {
  let buf = readFileSync(file)
  let changed = false
  for (const [bad, good] of fixes) {
    let idx = 0
    while ((idx = buf.indexOf(bad, idx)) !== -1) {
      buf = Buffer.concat([buf.slice(0, idx), good, buf.slice(idx + bad.length)])
      changed = true
      idx += good.length
    }
  }
  if (changed) {
    writeFileSync(file, buf)
    totalFixed++
    console.log('Fixed:', file)
  }
}
console.log(`\nDone. Files fixed: ${totalFixed}`)
