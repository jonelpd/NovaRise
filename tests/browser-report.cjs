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
    await page.addInitScript(()=>{window.__nvraPrintCalls=0;window.print=()=>{window.__nvraPrintCalls++;};});
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
    // Exercise the real print button handler, without opening a native print dialog.
    await page.locator('#print-report').click();
    const printState=await page.evaluate(()=>({calls:window.__nvraPrintCalls,active:document.body.classList.contains('printing-nvra-report')}));
    assert.equal(printState.calls,1,'Print button must call window.print once');
    assert.equal(printState.active,true,'Print button must activate report-only print mode');
    await page.emulateMedia({media:'print'});
    const printVisibility=await page.evaluate(()=>({report:getComputedStyle(document.querySelector('#report')).visibility,header:getComputedStyle(document.querySelector('header')).visibility}));
    assert.equal(printVisibility.report,'visible','Report must be visible in print mode');
    assert.equal(printVisibility.header,'hidden','Website header must be hidden in report PDF');
    const pdf=await page.pdf({format:'A4',printBackground:true});
    const pdfPageCount=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert.ok(pdfPageCount>=1&&pdfPageCount<=25,'Unexpected PDF page count: '+lang+'/'+device+' '+pdfPageCount);
    assert.ok(pdf.length>3000,'PDF too small: '+lang+'/'+device);
    fs.writeFileSync(path.join(artifactDir,lang+'-'+device+'.pdf'),pdf);
    await page.screenshot({path:path.join(artifactDir,lang+'-'+device+'-print.png'),fullPage:true});
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.evaluate(()=>document.body.classList.contains('printing-nvra-report')),false,'afterprint must restore normal page mode');
    await page.screenshot({path:path.join(artifactDir,lang+'-'+device+'-screen.png'),fullPage:true});
    // Master Plan 2.2: exercise the real bilingual comparison form with mocked providers.
    const compare=page.locator('#token-comparator');
    assert.equal(await compare.count(),1,'Token comparator must be present');
    await compare.locator('[name=network]').selectOption('Base');
    await compare.locator('[name=contractA]').fill('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    await compare.locator('[name=contractB]').fill('0x4200000000000000000000000000000000000006');
    await compare.locator('button[type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#token-comparator button[type=submit]')?.disabled===false,{timeout:15000});
    assert.equal(await compare.locator('table tr').count(),16,'Comparison must render security checks, market and holder metrics');
    assert.ok((await compare.locator('[data-results]').innerText()).includes(lang==='en'?'Unavailable':'Sin datos'),'Missing market metrics must not be shown as zero');
    // Plan Maestro 2.3: watchlist persistence, duplicate prevention, and manual refresh.
    const watch=page.locator('#nvra-watchlist');
    assert.equal(await watch.count(),1,'Watchlist must be present');
    await watch.locator('[name=network]').selectOption('Base');
    await watch.locator('[name=address]').fill('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    await watch.locator('button[type=submit]').click();
    assert.equal(await watch.locator('[data-list] .panel').count(),1,'One saved token');
    // Verify that long security labels and token cards do not overflow mobile viewport.
    if(device==='mobile'){
      await page.evaluate(()=>{const panel=document.querySelector('#nvra-watchlist [data-list] .panel');const notice=document.createElement('p');notice.textContent='Security change: can_take_back_ownership (0 → 1) '.repeat(5);panel.append(notice)});
      const bounds=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth,card:document.querySelector('#nvra-watchlist [data-list] .panel').getBoundingClientRect().right}));
      assert.ok(bounds.document<=bounds.viewport+2&&bounds.card<=bounds.viewport+2,'Mobile watchlist overflow: '+JSON.stringify(bounds));
    }
    assert.equal(await watch.locator('[data-status]').getAttribute('aria-live'),'polite','Watchlist status should announce API errors accessibly');

    // Security risk comparisons must be bilingual and run only on manual refresh.
    assert.ok((await page.locator('script[src*="watchlist.js"]').count())===1,'Security watchlist script loaded');

    await watch.locator('button[type=submit]').click();
    assert.equal(await watch.locator('[data-list] .panel').count(),1,'Duplicate must be rejected');
    const alertThreshold=watch.locator('input[type=number]');
    assert.equal(await alertThreshold.count(),1,'Configurable alert threshold must exist');
    await alertThreshold.fill('15');
    await alertThreshold.dispatchEvent('change');
    assert.equal(await page.evaluate(()=>localStorage.getItem('nvra-watchlist-alert-threshold-v1')),'15','Threshold must persist');
    await alertThreshold.fill('0');
    await alertThreshold.dispatchEvent('change');
    assert.equal(await alertThreshold.inputValue(),'15','Out-of-range threshold must be rejected');
    await watch.locator('[data-list] button').first().click();
    await page.waitForFunction(()=>document.querySelector('#nvra-watchlist [data-list] button')?.disabled===false,{timeout:15000});
    assert.ok((await watch.locator('[data-list]').innerText()).includes(lang==='en'?'No matching pairs':'No se encontraron pares'),'No-pair state should be explicit');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('nvra-watchlist-v1')||'[]').length),1,'Watchlist must persist');
    // Missing market pairs must not erase the last valid snapshot.
    await page.evaluate(()=>{const key='nvra-watchlist-v1';const items=JSON.parse(localStorage.getItem(key));items[0].snapshot={liquidity:1000,volume:500};localStorage.setItem(key,JSON.stringify(items))});
    await page.reload();
    const watchAfterReload=page.locator('#nvra-watchlist');
    await watchAfterReload.locator('[data-list] button').first().click();
    await page.waitForFunction(()=>document.querySelector('#nvra-watchlist [data-list] button')?.disabled===false,{timeout:15000});
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('nvra-watchlist-v1'))[0].snapshot),{liquidity:1000,volume:500},'Missing pair must retain previous baseline');
    await watch.locator('[data-list] button').last().click();
    assert.equal(await watch.locator('[data-list] .panel').count(),0,'Remove must work');
    assert.deepEqual(errors,[],'Browser errors: '+lang+'/'+device);
    console.log('PASS '+lang+' '+device+' report and A4 PDF ('+pdf.length+' bytes)');
    await page.close();
   }
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
