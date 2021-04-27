/**
 * @file Extension data not easily retrieved from the global `nova` object.
 * @version 1.1.0
 * @author Martin Kopischke <martin@kopischke.net>
 * @license MIT
 */

/**
 * Get the common prefix of all extension configuration items.
 * @returns {string} The prefix.
 */
exports.prefix = function () {
  return nova.extension.identifier.split(".").pop()
}

/**
 * Get the common prefix of extension preferences items.
 * @returns {string} The prefix.
 */
exports.prefixConfig = function () {
  return `${exports.prefix()}.conf`
}

/**
 * Get the common prefix of extension commands.
 * @returns {string} The prefix.
 */
exports.prefixCommand = function () {
  return `${exports.prefix()}.cmd`
}

/**
 * Get the common prefix of extension messages.
 * @returns {string} The prefix.
 */
exports.prefixMessage = function () {
  return `${exports.prefix()}.msg`
}

/**
 * Qualified path to the temporary storage path for the extension.
 * This function guarantees the path exists and is a writable directory.
 * @returns {string} The path to the temporary storage directory.
 * @throws {Error} When the path exists, but is not a writable directory.
 */
exports.supportDir = function () {
  const store = nova.extension.workspaceStoragePath
  if (!nova.fs.access(store, nova.fs.F_OK)) {
    nova.fs.mkdir(store)
    return store
  }

  if (!nova.fs.stat(store).isDirectory()) {
    throw new Error(`backup path exists but is not a directory: ${store}`)
  }

  if (!nova.fs.access(store, nova.fs.W_OK)) {
    throw new Error(`backup directory is not writable: ${store}`)
  }

  return store
}
