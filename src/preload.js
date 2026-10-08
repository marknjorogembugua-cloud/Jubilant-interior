const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("appAPI",{
 get:()=>ipcRenderer.invoke("db:get"),
 save:d=>ipcRenderer.invoke("db:save",d),
 backup:()=>ipcRenderer.invoke("db:backup"),
 restore:()=>ipcRenderer.invoke("db:restore"),
 exportPDF:(html,filename)=>ipcRenderer.invoke("pdf:export",html,filename)
});
