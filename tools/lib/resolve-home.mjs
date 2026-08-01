/**
 * resolve-home — shared brain-home resolution contract for tools/*.mjs.
 *
 * Resolution order:
 *   1. PI_BRAIN_HOME environment variable (set by the extension)
 *   2. process.cwd() (the extension passes cwd: home.path; standalone dev
 *      runs are expected from the repo root)
 *   3. Package-dir fallback derived from the calling script's location
 *      (preserves standalone runs when cwd is unavailable)
 *
 * @param {string | undefined} scriptDir - import.meta.dirname of the caller
 * @returns {string} absolute path to the brain home
 */
import { dirname } from "node:path";

export function resolveHome(scriptDir) {
  if (process.env.PI_BRAIN_HOME) {
    return process.env.PI_BRAIN_HOME;
  }
  try {
    const cwd = process.cwd();
    if (cwd) {
      return cwd;
    }
  } catch {
    // process.cwd() can throw if the directory was deleted
  }
  return scriptDir ? dirname(scriptDir) : ".";
}
