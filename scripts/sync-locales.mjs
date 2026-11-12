import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function prefix(key) {
  const separator = key.lastIndexOf('.')
  return separator === -1 ? '' : key.slice(0, separator)
}

function compare(first, second) {
  return first < second ? -1 : first > second ? 1 : 0
}

function formatEntries(entries) {
  const groups = new Map()
  for (const entry of entries) {
    const group = prefix(entry[0])
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group).push(entry)
  }
  const sorted = [...groups.values()]
    .map((group) => group.sort(([first], [second]) => compare(first, second)))
    .sort((first, second) => compare(first[0][0], second[0][0]))
    .flat()
  if (!sorted.length) return '{}\n'
  const lines = sorted.map(([key, value], index) => {
    const gap = index > 0 && prefix(key) !== prefix(sorted[index - 1][0]) ? '\n' : ''
    return `${gap}  ${JSON.stringify(key)}: ${JSON.stringify(value, null, 2).replaceAll('\n', '\n  ')}`
  })
  return `{\n${lines.join(',\n')}\n}\n`
}

export async function syncLocales(keysFile, localesDirectory, warn = console.warn) {
  const keysContents = await readFile(keysFile, 'utf8')
  const descriptions = JSON.parse(keysContents)
  if (!descriptions || Array.isArray(descriptions) || typeof descriptions !== 'object' ||
    Object.entries(descriptions).some(([key, description]) => !key || typeof description !== 'string')) {
    throw new Error(`${keysFile} must contain an object mapping non-empty translation keys to descriptions`)
  }
  const keys = new Set(Object.keys(descriptions))
  const formattedKeys = formatEntries(Object.entries(descriptions))
  if (formattedKeys !== keysContents) await writeFile(keysFile, formattedKeys)
  const entries = await readdir(localesDirectory, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const localeFile = path.join(localesDirectory, entry.name, 'translation.json')
    let contents
    try {
      contents = await readFile(localeFile, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    const translations = JSON.parse(contents)
    if (!translations || Array.isArray(translations) || typeof translations !== 'object') {
      throw new Error(`${localeFile} must contain a JSON object`)
    }
    const values = new Map(Object.entries(translations))
    for (const key of values.keys()) {
      if (!keys.has(key)) warn(`${localeFile}: undocumented translation key ${JSON.stringify(key)}`)
    }
    for (const key of keys) {
      if (!values.has(key)) values.set(key, null)
    }
    const output = formatEntries(values)
    if (output !== contents) await writeFile(localeFile, output)
  }

  return keys.size
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const locales = path.join(root, 'src/locales')
  const count = await syncLocales(path.join(locales, 'keys.json'), locales)
  console.log(`Synchronized ${count} translation keys.`)
}