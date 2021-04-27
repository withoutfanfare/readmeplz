const EXT = require("../lib/extension")

exports.log = function (msg) {
  if (nova.inDevMode()) {
    console.log(msg)
  }
}

/**
 * Get the locally valid configuration setting (workspace if set, else global).
 * @returns {?*} The configuration value (if any).
 * @param {string} key - The configuration key to look up.
 * @param {string} [type] - The type to coerce the configuration value to.
 * @see {@link https://docs.nova.app/api-reference/configuration/}
 */
exports.getLocalConfig = function (key, type) {
  return nova.workspace.config.get(key) != null
    ? nova.workspace.config.get(key, type)
    : nova.config.get(key, type)
}

/**
 * Simple event notification.
 * @param {string} id - NotificationRequest.id.
 * @param {string} message - NotificationRequest.message.
 */
exports.notify = function (id, message) {
  const request = new NotificationRequest(id)
  request.title = nova.extension.name
  request.body = message

  exports.log(message)
  nova.notifications.add(request)
}


/*
Returns a boolean representing whether or not the current
environment is a workspace or Nova window without a 
workspace.
*/
exports.isWorkspace = function isWorkspace() {
  if (nova.workspace.path == undefined || nova.workspace.path == null) {
    return false
  } else {
    return true
  }
}

/**
 * Check for Nova Workspace
 */
exports.ensureWorkspace = function ensureWorkspace() {
  return new Promise((resolve, reject) => {
    /**
     * If not a project workspace, prevent further execution
     */
    if (!exports.isWorkspace()) {
      const msg = nova.localize(`${EXT.prefixMessage()}.not-workspace-error`)
      reject(msg)
    } else {
      resolve(true)
    }
  })
}


exports.ensureFolder = function ensureFolder() {
  return new Promise((resolve, reject) => {
    try {
      if (!nova.workspace || !nova.workspace.path) {
        throw new Error("missing nova.workspace.path.");
      }
      
      let openPath = nova.workspace.path
            
      if (!nova.fs.access(openPath, nova.fs.W_OK)) {
        throw new Error("unable to open nova.workspace.path.");
      }
      
      if(!nova.fs.stat(openPath)) {
        throw new Error("unable to stat nova.workspace.path");
      }
      
      if (nova.fs.stat(openPath) && !nova.fs.stat(openPath).isDirectory()) {
        throw new Error("nova.workspace.path is not a directory");
      }
      
      resolve(true)
      
    } catch (_err) {
      console.log(_err)
      reject(false)
    }
  })
}


/*
Returns a boolean representing whether or not a .nova folder is present.
*/
exports.isProject = function isProject() {  
  return new Promise((resolve, reject) => {
    try {
      let novaFolder = nova.path.join(nova.workspace.path, ".nova")
      if (!nova.fs.access(novaFolder, nova.fs.W_OK)) {
        throw new Error("missing .nova folder.");
      }
      
      if (!nova.fs.stat(novaFolder).isDirectory()) {
        throw new Error(".nova is not a directory");
      }
      
      resolve(true)
      
    } catch (_err) {
      console.log(_err)
      reject(false)
    }
  })
}

/*
Returns a boolean representing whether or not a .nova folder is present.
*/
exports.ensureNovaFolderExists = function ensureNovaFolderExists() {
  return new Promise((resolve, reject) => {
    try {
      let novaFolder = nova.path.join(nova.workspace.path, ".nova")

      if (!nova.fs.access(novaFolder, nova.fs.F_OK)) {
        // TODO - make a config setting to auto-create or ask user when this happens.
        nova.fs.mkdir(novaFolder)
      }

      if (
        nova.fs.stat(novaFolder).isDirectory() &&
        nova.fs.access(novaFolder, nova.fs.W_OK)
      ) {
        resolve(novaFolder)
      } else {
        reject(false)
      }
    } catch (_err) {
      reject(false)
      console.log(_err)
    }
  })

  return true
}

exports.filterDuplicates = (itemArr) =>
  itemArr.filter((v, i) => itemArr.indexOf(v) === i)


