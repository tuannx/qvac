// Perf benches for qvac (fork tuannx/qvac).
// Scope: pure TypeScript core functions of the SDK/RAG/error packages — no
// model loading, no native addons, no network. Sources are imported directly;
// Node >=22 type-stripping loads the .ts sources (type-only imports erased).
// Fixtures are fixed; warmup/iterations are fixed per bench for determinism.
import { selectDiverse } from '../packages/rag/src/diversify.ts'
import { normalizeAssistantCacheContent } from '../packages/sdk/src/utils/cache-normalize.ts'
import { sanitizePathComponent, checkPathWithinBase } from '../packages/sdk/src/utils/path-sanitize.ts'
import { resolve, sep } from 'node:path'

let sink = 0

// 1000 search hits spread over 50 documents, fixed order.
const hits = Array.from({ length: 1000 }, (_, i) => ({
  documentId: `doc-${i % 50}`,
  chunkId: `chunk-${i}`,
  score: 1 - i / 1000,
  content: `content ${i}`
}))

// ~4 KB assistant text with paired + unclosed think blocks.
const assistantText = ('<think>reasoning step with some detail</think>Visible answer text. '.repeat(40)) + '<think>trailing unclosed'

const pathInputs = ['report final.pdf', '../secret.txt', 'a/b\\c.txt', '%2e%2e%2fetc', 'normal-name_01.txt']

export const benches = [
  {
    name: 'rag.selectDiverse-1000hits-k20',
    scope: 'packages/rag/src/diversify.ts selectDiverse() — 1000 hits, k=20, perDocument=4',
    warmup: 200,
    iterations: 2000,
    fn: () => { sink += selectDiverse(hits, 20, 4).length }
  },
  {
    name: 'sdk.normalizeAssistantCacheContent-4kb',
    scope: 'packages/sdk/src/utils/cache-normalize.ts normalizeAssistantCacheContent() — ~4KB with think blocks',
    warmup: 500,
    iterations: 5000,
    fn: () => { sink += normalizeAssistantCacheContent(assistantText).length }
  },
  {
    name: 'sdk.sanitizePathComponent+checkPathWithinBase',
    scope: 'packages/sdk/src/utils/path-sanitize.ts sanitizePathComponent()+checkPathWithinBase() — 5 fixed inputs',
    warmup: 1000,
    iterations: 10000,
    fn: () => {
      for (const input of pathInputs) {
        try { sink += sanitizePathComponent(input).length } catch { sink += 1 }
        sink += checkPathWithinBase('/base/data', '/base/data/sub/file.txt', resolve, sep) ? 1 : 0
      }
    }
  }
]

export function getSink () { return sink }
