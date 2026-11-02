const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const artifactDir=path.resolve('artifacts/browser-reports');
 fs.mkdirSync(artifactDir,{recursive:true});
 try{
  for(const [lang,file] of [['es','index.html'],['en','en.html']]){
   for(const [device,viewport] of [['desktop',{width:1366,height:900}],['mobile',{width:390,height:844}]]){
    const page=await browser.newPage({viewport});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('https://api.gopluslabs.io/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({code:1,result:{'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':{is_open_source:'1',is_honeypot:'0',is_mintable:'0',is_blacklisted:'0',can_take_back_ownership:'0',is_proxy:'0'}}})}));
    await page.route('https://api.dexscreener.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await page.goto('http://127.0.0.1:8765/'+file,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    await page.locator('#network').selectOption({label:'Base'});
    await page.locator('#address').fill('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    await page.locator('#analyze').click();
    await page.waitForFunction(()=>document.querySelector('#analyze')?.disabled===false&&document.querySelector('#report')?.textContent.includes('GoPlus'),{timeout:15000});
    const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
    assert.ok(dimensions.content<=dimensions.viewport+2,'Horizontal overflow: '+lang+'/'+device+' '+JSON.stringify(dimensions));
    assert.ok(await page.locator('#report').isVisible());
    assert.ok(await page.locator('#report').innerText().then(t=>t.includes('GoPlus')));
    assert.equal(await page.locator('#print-report').count(),1);
    const pdf=await page.pdf({format:'A4',printBackground:true});
    assert.ok(pdf.length>3000,'PDF too small: '+lang+'/'+device);
    fs.writeFileSync(path.join(artifactDir,lang+'-'+device+'.pdf'),pdf);
    await page.screenshot({path:path.join(artifactDir,lang+'-'+device+'.png'),fullPage:true});
    assert.deepEqual(errors,[],'Browser errors: '+lang+'/'+device);
    console.log('PASS '+lang+' '+device+' report and A4 PDF ('+pdf.length+' bytes)');
    await page.close();
   }
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
