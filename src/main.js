const {app,BrowserWindow,ipcMain,dialog}=require("electron");
const fs=require("fs"),path=require("path");
const dataPath=path.join(app.getPath("userData"),"data.json");
function load(){const defaults={settings:{businessName:"Jubilant Interior Solution",tagline:"Interior Design • Space • Detail",phone:"",email:"Jarruljone@gmail.com",website:"",address:"",prefix:"QT",paymentDetails:"",footer:"Thank you for choosing Jubilant Interior Solution."},clients:[],projects:[],catalog:[],quotes:[]};try{const d=JSON.parse(fs.readFileSync(dataPath,"utf8"));if(!d||typeof d!=="object"||Array.isArray(d))throw new Error("The local data file is not a valid database.");if(d.settings!=null&&(typeof d.settings!=="object"||Array.isArray(d.settings)))throw new Error("The local data file contains invalid business settings.");d.settings={...defaults.settings,...(d.settings||{})};d.clients=Array.isArray(d.clients)?d.clients:[];d.projects=Array.isArray(d.projects)?d.projects:[];d.catalog=Array.isArray(d.catalog)?d.catalog:[];d.quotes=Array.isArray(d.quotes)?d.quotes:[];return d}catch(err){if(err.code==="ENOENT")return defaults;throw err}}
function save(d){fs.mkdirSync(path.dirname(dataPath),{recursive:true});fs.writeFileSync(dataPath,JSON.stringify(d,null,2))}
function addCompanyLogoWatermark(html,logoData){html=html.replace(/src="(?:file:[^"]*jubilant-logo\.png|company-logo\.png)"/gi,`src="${logoData}"`);const watermark=`<style>html,body{min-height:100%}body{isolation:isolate}body::before{content:"";position:fixed;inset:20% 25%;background:url("${logoData}") center/contain no-repeat;opacity:.08;mix-blend-mode:multiply;z-index:-1;pointer-events:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>`;return html.replace("</head>",`${watermark}</head>`)}
let db;
function createWindow(){const w=new BrowserWindow({width:1440,height:920,minWidth:1100,minHeight:700,backgroundColor:"#f7f7f7",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});w.loadFile(path.join(__dirname,"index.html"))}
app.whenReady().then(()=>{db=load();createWindow();app.on("activate",()=>BrowserWindow.getAllWindows().length||createWindow())}).catch(err=>{dialog.showErrorBox("Data could not be loaded",`The application could not read its local data file.\n\n${err.message}`);app.quit()});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
ipcMain.handle("db:get",()=>db);
ipcMain.handle("db:save",(e,next)=>{db=next;save(db);return db});
ipcMain.handle("db:backup",async()=>{const r=await dialog.showSaveDialog({title:"Backup Interior Quote Manager",defaultPath:"interior-quote-manager-backup.json",filters:[{name:"JSON Backup",extensions:["json"]}]});if(!r.canceled)fs.writeFileSync(r.filePath,JSON.stringify(db,null,2));return !r.canceled});

ipcMain.handle("pdf:export",async(e,html,filename="report.pdf")=>{
 const defaultName=path.basename(String(filename||"report.pdf")).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_");
 const r=await dialog.showSaveDialog({title:"Export PDF",defaultPath:defaultName.toLowerCase().endsWith(".pdf")?defaultName:`${defaultName}.pdf`,filters:[{name:"PDF Document",extensions:["pdf"]}]});
 if(r.canceled)return {ok:false};
 const pdfWin=new BrowserWindow({show:false,width:900,height:1200,webPreferences:{sandbox:true}});
 try{
   const logo=path.join(__dirname,"../assets/jubilant-logo.png");
   if(!fs.existsSync(logo))throw new Error("Company logo file was not found.");
   const logoData=`data:image/png;base64,${fs.readFileSync(logo).toString("base64")}`;
   html=addCompanyLogoWatermark(html,logoData);
   await pdfWin.loadURL("data:text/html;charset=utf-8,"+encodeURIComponent(html));
   const data=await pdfWin.webContents.printToPDF({printBackground:true,pageSize:"A4",margins:{top:0,bottom:0,left:0,right:0},preferCSSPageSize:true});
   const outputPath=path.extname(r.filePath).toLowerCase()===".pdf"?r.filePath:`${r.filePath}.pdf`;
   fs.writeFileSync(outputPath,data);
   return {ok:true,path:outputPath};
 }catch(err){return {ok:false,error:String(err)};}finally{pdfWin.close();}
});
ipcMain.handle("db:restore",async()=>{const r=await dialog.showOpenDialog({title:"Restore backup",properties:["openFile"],filters:[{name:"JSON Backup",extensions:["json"]}]});if(r.canceled)return {cancelled:true};try{const restored=JSON.parse(fs.readFileSync(r.filePaths[0],"utf8"));if(!restored||typeof restored!=="object"||Array.isArray(restored))throw new Error("The selected file is not a valid backup.");if(restored.settings!=null&&(typeof restored.settings!=="object"||Array.isArray(restored.settings)))throw new Error("The backup contains invalid business settings.");restored.settings=restored.settings||{};restored.clients=Array.isArray(restored.clients)?restored.clients:[];restored.projects=Array.isArray(restored.projects)?restored.projects:[];restored.catalog=Array.isArray(restored.catalog)?restored.catalog:[];restored.quotes=Array.isArray(restored.quotes)?restored.quotes:[];save(restored);db=restored;return {ok:true,data:db}}catch(err){return {ok:false,error:String(err.message||err)}}});
