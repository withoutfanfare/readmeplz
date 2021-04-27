const EXT = require("./lib/extension")
const CMDS = require("./core/commands")

const {
      log,
      getLocalConfig,
      notify,
      ensureWorkspace,
      ensureFolder
    } = require("./lib/utils")
      
let myEventHandler = null
let readmeExists = false

const README = 'README'
const README_FILE = `${README}.md`
const README_PATH = nova.path.join(nova.workspace.path, README_FILE)

/**
 * Extension state.
 * @property {object}
 */
let state = {
  activated: false
}
    
/**
 * Configuration keys.
 * @property {object}
 */
const CONFIGKEYS = {
  seen: `${EXT.prefixConfig()}.seen`,
}


/**
 *
 */
function initialiseEmitHandler() {
  return new Promise((resolve, reject) => {
    try {
      myEventHandler = new Emitter()
      resolve(true)
    } catch (_err) {
      log(_err)
      reject(_err)
    }
  })
}


/**
 * If we have a readme...
 */
function hasReadme() {
  return new Promise((resolve, reject) => {
    try {
      let fullPath = nova.path.join(nova.workspace.path, "README.md")
      CMDS.canAccessPath(fullPath)
      .then(res => {
          resolve(fullPath)
      })
      .catch(_err => {
          reject(false)
      })
      
    } catch (_err) {
      log(_err)
      reject(_err)
    }
  })
}


function writeReference(filePath) {    
    return new Promise((resolve, reject) => {
        try {
            const refFile = nova.fs.open(filePath, "w+")
            if (refFile) {
              refFile.write("Created by Nova README extension.")
              resolve(refFile)
            } else {
              reject(false)
            }         
        } catch (_err) {
            reject(false)
        }
    })
  }


/**
 *
 */
function initialiseEventListeners() {
  return new Promise((resolve, reject) => {
    try {
      myEventHandler.on("open-readme", function (payload) {
          let rpath = `${README_PATH}.md`
          let fullPath = nova.path.join(nova.workspace.path, "README.md")
          CMDS.canAccessPath(fullPath)
          .then(res => {
              nova.workspace.openFile(fullPath)
              .then(function () {
                let editor = nova.workspace.activeTextEditor
              })
          })
          .catch(_err => {
              console.log(_err)
          })
      })

      resolve(true)
    } catch (_err) {
      log(_err)
      reject(_err)
    }
  })
}


/**
 */
function updateSeen(newEnabledStatus) {
  if (newEnabledStatus) {
    initReferenceFile()
  } else {
    removeReferenceFile()
  }
}

/**
 * Register configuration listeners.
 */
function registerConfigListeners(configKeys) {
  return new Promise((resolve, reject) => {
    try {
      nova.workspace.config.onDidChange(
        configKeys.seen,
        updateSeen
      )
      resolve(true)
    } catch (_err) {
      console.log(_err)
      reject(_err)
    }
  })
}


function getHashedReference(path) {
    return nova.path.join(EXT.supportDir(), `${CMDS.stringToHash(path)}`)
}


function removeReferenceFile() {
  return new Promise((resolve, reject) => {
    try {
      let fullPath = nova.path.join(nova.workspace.path, "README.md")
      let referencePath = getHashedReference(fullPath)
      
      CMDS.canAccessPath(referencePath)
      .then(res => {
          let removed = nova.fs.remove(referencePath)
          let confUpdated = nova.workspace.config.set(CONFIGKEYS.seen , false)
          resolve(fullPath)
      })
    } catch (_err) {
      reject(_err)
    }
  })
}


function initReferenceFile() {
  // If we have a README file
  hasReadme()
  .then(path => {
     // Create a hashed reference using the file path.
     let referencePath = getHashedReference(path)
     // If it doesn't exist, create reference file.
     CMDS.canAccessPath(referencePath)
     .catch(_err => {
         writeReference(referencePath)
         .then(res => {
             // After writing the reference (to denote README has been seen)
             // emit an open README request.
             let prefix = EXT.prefixConfig()
             let confUpdated = nova.workspace.config.set(CONFIGKEYS.seen , true)
             myEventHandler.emit("open-readme", true)
         })
         .catch(_err => {
            console.log(_err)
         })
     })
  })
}

/**
 * Reload the data from file and refresh interface.
 */
nova.commands.register(`${EXT.prefixCommand()}.reset`, () => {
  removeReferenceFile()
})

/**
 * Initialise
 * @returns void
 */
exports.activate = async function () {
    return Promise.all([
        ensureWorkspace(),
        ensureFolder(),
        initialiseEmitHandler(),
        initialiseEventListeners(),
        registerConfigListeners(CONFIGKEYS)
    ])
    .then(() => {
      state.activated = true
      let confUpdated = nova.workspace.config.set(CONFIGKEYS.seen , true)
      initReferenceFile()
    })
    .catch((_e) => {
      state.activated = false
      reject(false)
    })
}

exports.deactivate = function() {
    state.activated = false
}