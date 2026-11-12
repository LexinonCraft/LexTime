import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { syncLocales } from './sync-locales.mjs'

test('synchronizes the manual list without overwriting existing translations', async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'locale-sync-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const locales = path.join(root, 'locales')
  const keysFile = path.join(root, 'keys.json')
  await mkdir(path.join(locales, 'en'), { recursive: true })
  await mkdir(path.join(locales, 'de'))
  await writeFile(keysFile, JSON.stringify({ 'z.used': 'Last', 'a.other': 'Other', 'a.used': 'First', 'new.key': 'New' }))
  await writeFile(path.join(locales, 'en', 'translation.json'), JSON.stringify({ 'z.used': 'Existing', unused: 'Keep' }))
  await writeFile(path.join(locales, 'de', 'translation.json'), JSON.stringify({ 'a.used': 'Vorhanden' }))

  const warnings = []
  assert.equal(await syncLocales(keysFile, locales, (message) => warnings.push(message)), 4)
  assert.deepEqual(warnings, [`${path.join(locales, 'en', 'translation.json')}: undocumented translation key "unused"`])
  const keys = await readFile(keysFile, 'utf8')
  const english = await readFile(path.join(locales, 'en', 'translation.json'), 'utf8')
  const german = await readFile(path.join(locales, 'de', 'translation.json'), 'utf8')
  assert.deepEqual(JSON.parse(english), {
    'a.other': null,
    'a.used': null,
    'new.key': null,
    unused: 'Keep',
    'z.used': 'Existing',
  })
  assert.deepEqual(Object.keys(JSON.parse(german)), ['a.other', 'a.used', 'new.key', 'z.used'])
  assert.equal(JSON.parse(german)['a.used'], 'Vorhanden')
  assert.equal(keys, '{\n  "a.other": "Other",\n  "a.used": "First",\n\n  "new.key": "New",\n\n  "z.used": "Last"\n}\n')
  assert.equal(english, '{\n  "a.other": null,\n  "a.used": null,\n\n  "new.key": null,\n\n  "unused": "Keep",\n\n  "z.used": "Existing"\n}\n')

  await syncLocales(keysFile, locales, () => {})
  assert.equal(await readFile(keysFile, 'utf8'), keys)
  assert.equal(await readFile(path.join(locales, 'en', 'translation.json'), 'utf8'), english)
  assert.equal(await readFile(path.join(locales, 'de', 'translation.json'), 'utf8'), german)
})

test('rejects invalid key lists', async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'locale-sync-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const keysFile = path.join(root, 'keys.json')
  await writeFile(keysFile, JSON.stringify({ 'valid.key': null }))
  await assert.rejects(syncLocales(keysFile, root), /object mapping non-empty translation keys to descriptions/)
})