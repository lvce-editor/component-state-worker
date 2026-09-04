import { createHash } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { brotliDecompressSync } from 'node:zlib'
import tar from 'tar-fs'
import { root } from './root.ts'

const expectedSha256 = '4ccbd03e1b6dd021570ee7ccaad080f41e2739cdb5e70bd393c3a4f970b126bf'
const version = '1.22.1'
const archiveName = `language-features-json-v${version}.tar.br`
const downloadUrl = `https://github.com/lvce-editor/language-features-json/releases/download/v${version}/${archiveName}`

export const jsonLanguageFeaturesPath = join(root, '.tmp', 'extensions', 'builtin.language-features-json')

export const downloadJsonLanguageFeatures = async (): Promise<void> => {
  const response = await fetch(downloadUrl)
  if (!response.ok) {
    throw new Error(`Failed to download ${downloadUrl}: ${response.status} ${response.statusText}`)
  }
  const archive = Buffer.from(await response.arrayBuffer())
  const actualSha256 = createHash('sha256').update(archive).digest('hex')
  if (actualSha256 !== expectedSha256) {
    throw new Error(`SHA-256 mismatch for ${downloadUrl}: expected ${expectedSha256}, received ${actualSha256}`)
  }
  await rm(jsonLanguageFeaturesPath, { force: true, recursive: true })
  await mkdir(jsonLanguageFeaturesPath, { recursive: true })
  const decompressed = brotliDecompressSync(archive)
  await pipeline(Readable.from([decompressed]), tar.extract(jsonLanguageFeaturesPath))
  await mkdir(join(jsonLanguageFeaturesPath, 'src'))
}
