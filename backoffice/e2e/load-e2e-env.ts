import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Charge `.env.e2e.local` puis `.env.e2e` (racine du dossier backoffice).
 * À appeler dans playwright.config et dans global-setup : le setup global tourne
 * dans un autre processus Node et ne réapplique pas le config.
 */
export function loadE2eEnv(cwd: string = process.cwd()): void {
  for (const rel of ['.env.e2e.local', '.env.e2e']) {
    const filePath = resolve(cwd, rel)
    if (!existsSync(filePath)) continue
    let content = readFileSync(filePath, 'utf8')
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1)
    }
    for (const line of content.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      let val = t.slice(i + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = val
      }
    }
  }
}
