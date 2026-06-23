const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  mouseEnter: () => ipcRenderer.send('mouse-enter'),
  mouseLeave: () => ipcRenderer.send('mouse-leave'),

  // Test IPC từ renderer lên main
 onChibiState: (callback) => {ipcRenderer.on('CHIBI_STATE', (_, payload) => callback(payload))},
  removeChibiStateListener: () => {
    ipcRenderer.removeAllListeners('CHIBI_STATE')
  }
})