/* Optional NVRA wallet viewer: no signatures, approvals or transactions. */
(function(){
'use strict';
const TOKEN='0xa1128B1F4CB8394c179eb2558608a7302972EcBF';
const BASE_CHAIN='0x2105';
const byId=id=>document.getElementById(id);
const center=byId('nvra-center');
if(!center)return;
const panel=document.createElement('section');
panel.className='nvra-merits';
panel.setAttribute('aria-labelledby','nvra-wallet-title');
panel.innerHTML='<h3 id="nvra-wallet-title">🔐 Billetera NVRA · solo consulta</h3><p id="nvra-wallet-status" role="status" aria-live="polite">Sin billetera conectada. Esta función es opcional.</p><p id="nvra-wallet-account"></p><p id="nvra-wallet-balance"></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="nvra-wallet-connect">Conectar billetera</button><button type="button" id="nvra-wallet-refresh" disabled>Actualizar saldo</button><button type="button" id="nvra-wallet-disconnect" disabled>Desvincular</button></div><p>Solo lectura en Base Mainnet. No solicita firmas, autorizaciones ni claves privadas. No convierte cristales ni oro en NVRA.</p>';
center.querySelector('.nvra-center-panel').append(panel);
const connect=byId('nvra-wallet-connect'),refresh=byId('nvra-wallet-refresh'),disconnect=byId('nvra-wallet-disconnect');
const status=byId('nvra-wallet-status'),accountText=byId('nvra-wallet-account'),balanceText=byId('nvra-wallet-balance');
let provider=null,account=null,epoch=0;
const validAddress=a=>typeof a==='string'&&/^0x[0-9a-fA-F]{40}$/.test(a);
function message(s){status.textContent=s}
function reset(s){epoch++;account=null;provider=null;accountText.textContent='';balanceText.textContent='';connect.disabled=false;refresh.disabled=true;disconnect.disabled=true;message(s||'Billetera desvinculada de este panel.')}
function format(raw){
 const n=BigInt(raw),whole=n/10n**18n,fraction=(n%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');
 return whole.toString()+(fraction?','+fraction.slice(0,6):'')+' NVRA';
}
async function readBalance(){
 if(!provider||!account)return;
 const current=++epoch,active=provider,addr=account;
 refresh.disabled=true;balanceText.textContent='';
 try{
  const chain=await active.request({method:'eth_chainId'});
  if(current!==epoch)return;
  if(String(chain).toLowerCase()!==BASE_CHAIN){message('Selecciona Base Mainnet (8453) en tu billetera. No se cambiará la red automáticamente.');return}
  const data='0x70a08231'+'0'.repeat(24)+addr.slice(2).toLowerCase();
  const result=await active.request({method:'eth_call',params:[{to:TOKEN,data},'latest']});
  if(current!==epoch||provider!==active||account!==addr)return;
  if(typeof result!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(result))throw Error('Respuesta de saldo no válida');
  balanceText.textContent='Saldo en Base: '+format(result);
  message('Consulta completada. No se ha realizado ninguna transacción.');
 }catch(e){if(current===epoch)message('No se pudo consultar el saldo: '+(e&&e.message?e.message:'error de proveedor'))}
 finally{if(current===epoch)refresh.disabled=!account}
}
async function connectWallet(){
 const candidate=window.ethereum;
 if(!candidate||typeof candidate.request!=='function'){message('No se detecta una billetera compatible en este navegador.');return}
 connect.disabled=true;message('Esperando autorización de acceso a la cuenta…');
 try{
  const accounts=await candidate.request({method:'eth_requestAccounts'});
  if(!Array.isArray(accounts)||!validAddress(accounts[0]))throw Error('No se obtuvo una cuenta EVM válida');
  provider=candidate;account=accounts[0];accountText.textContent='Cuenta: '+account;
  disconnect.disabled=false;connect.disabled=true;refresh.disabled=false;
  await readBalance();
 }catch(e){reset('Conexión no realizada: '+(e&&e.message?e.message:'cancelada'))}
}
connect.addEventListener('click',connectWallet);
refresh.addEventListener('click',readBalance);
disconnect.addEventListener('click',()=>reset('Billetera desvinculada del panel. La autorización de la extensión se gestiona en la propia billetera.'));
if(window.ethereum&&typeof window.ethereum.on==='function'){
 window.ethereum.on('accountsChanged',()=>reset('La cuenta de la billetera ha cambiado. Vuelve a conectar si quieres consultar el saldo.'));
 window.ethereum.on('chainChanged',()=>{epoch++;balanceText.textContent='';if(account){message('La red ha cambiado. Actualiza el saldo para verificar Base.');refresh.disabled=false}});
 window.ethereum.on('disconnect',()=>reset('Proveedor desconectado.'));
}
})();
