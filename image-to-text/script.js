(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
  const maxSize = 10 * 1024 * 1024;
  let file = null, previewURL = null, worker = null, busy = false;
  const input=$("fileInput"), zone=$("dropZone"), preview=$("previewWrap"), img=$("imagePreview");
  const extract=$("extractBtn"), output=$("resultText"), progress=$("progressBox"), error=$("errorBox");

  function errorMsg(message){error.textContent=message;error.classList.remove("hidden");}
  function clearError(){error.textContent="";error.classList.add("hidden");}
  function countWords(){const n=output.value.trim()?output.value.trim().split(/\s+/).length:0;$("wordCount").textContent=`${n} ${n===1?"word":"words"}`;$("copyBtn").disabled=!output.value.trim();$("downloadBtn").disabled=!output.value.trim();}
  function setProgress(p,label){$("progressPercent").textContent=`${Math.round(p*100)}%`;$("progressBar").style.width=`${Math.round(p*100)}%`;if(label)$("progressLabel").textContent=label;}
  function selectFile(f){
    clearError();if(!f)return;
    if(!allowed.includes(f.type)){errorMsg("Unsupported file. Choose a JPG, PNG, WebP or BMP image.");return;}
    if(f.size>maxSize){errorMsg("This image is larger than 10 MB. Please choose a smaller image.");return;}
    if(previewURL)URL.revokeObjectURL(previewURL);
    file=f;previewURL=URL.createObjectURL(f);img.src=previewURL;
    $("fileName").textContent=f.name;$("fileSize").textContent=`${(f.size/1024/1024).toFixed(2)} MB`;
    zone.classList.add("hidden");preview.classList.remove("hidden");extract.disabled=false;
    output.value="";countWords();$("resultStatus").textContent="Image ready to scan";progress.classList.add("hidden");
  }
  function clearFile(){if(busy)return;if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;file=null;input.value="";img.removeAttribute("src");preview.classList.add("hidden");zone.classList.remove("hidden");extract.disabled=true;$("resultStatus").textContent="Waiting for an image";clearError();}
  async function getWorker(){
    if(worker)return worker;
    if(!window.Tesseract)throw new Error("OCR engine could not load. Check your internet connection and refresh the page.");
    worker=await Tesseract.createWorker("eng",1,{logger:m=>{
      if(m.status){let label=m.status==="recognizing text"?"Recognizing text…":m.status==="loading language traineddata"?"Loading English language data…":m.status+"…";setProgress(m.progress||0,label);}
    }});
    return worker;
  }
  async function runOCR(){
    if(!file||busy)return;busy=true;clearError();extract.disabled=true;$("browseBtn").disabled=true;$("removeBtn").disabled=true;
    extract.textContent="Processing image…";progress.classList.remove("hidden");setProgress(0,"Starting OCR engine…");$("resultStatus").textContent="Reading image…";
    try{
      const w=await getWorker();const result=await w.recognize(file);const text=(result.data.text||"").trim();
      output.value=text;countWords();setProgress(1,"Extraction complete");$("resultStatus").textContent=text?"Text extracted successfully":"No readable text found";
      if(!text)errorMsg("No readable text detected. Try a sharper, brighter image with larger text.");
    }catch(e){console.error(e);errorMsg(e.message||"Text extraction failed. Please try again.");$("resultStatus").textContent="Extraction failed";}
    finally{busy=false;extract.disabled=!file;$("browseBtn").disabled=false;$("removeBtn").disabled=false;extract.innerHTML='✦ &nbsp;Extract text <span>→</span>';}
  }
  $("browseBtn").addEventListener("click",()=>input.click());
  zone.addEventListener("click",e=>{if(!e.target.closest("button")&&!busy)input.click();});
  zone.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!busy){e.preventDefault();input.click();}});
  input.addEventListener("change",()=>selectFile(input.files[0]));
  ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add("drag");}));
  ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove("drag");}));
  zone.addEventListener("drop",e=>{if(!busy&&e.dataTransfer.files.length)selectFile(e.dataTransfer.files[0]);});
  $("removeBtn").addEventListener("click",clearFile);extract.addEventListener("click",runOCR);output.addEventListener("input",countWords);
  $("copyBtn").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(output.value);$("copyBtn").textContent="Copied!";$("resultStatus").textContent="Copied to clipboard";setTimeout(()=>$("copyBtn").textContent="Copy text",1500);}
    catch{output.focus();output.select();const ok=document.execCommand("copy");$("resultStatus").textContent=ok?"Copied to clipboard":"Select and copy the text manually";}
  });
  $("downloadBtn").addEventListener("click",()=>{
    const blob=new Blob([output.value],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`${file?file.name.replace(/\.[^.]+$/,""):"extracted-text"}.txt`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);$("resultStatus").textContent="Text file downloaded";
  });
  window.addEventListener("beforeunload",()=>{if(previewURL)URL.revokeObjectURL(previewURL);if(worker)worker.terminate();});
})();
