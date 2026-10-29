(() => {
"use strict";
const contract = "0xCCC748d63333F9aF58f259CDF771d5AB1226e20D";
const rpc = "https://polygon-amoy.drpc.org";
const en = document.documentElement.lang === "en";
const tr = (es, eng) => en ? eng : es;
const el = id => document.getElementById(id);
const status = (message, error = false) => {
  el("access-status").textContent = message;
  el("access-status").dataset.error = String(error);
};
const valid = address => /^0x[0-9a-fA-F]{40}$/.test(address);
let activeRequest = 0;
async function call(method, params = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error("RPC HTTP " + response.status);
    const body = await response.json();
    if (body.error || typeof body.result !== "string") throw new Error("RPC invalid response");
    return body.result;
  } finally { clearTimeout(timeout); }
}
function formatBalance(hex) {
  const amount = BigInt(hex);
  const whole = amount / (10n ** 18n);
  const decimal = (amount % (10n ** 18n)).toString().padStart(18, "0").replace(/0+$/, "");
  return whole.toLocaleString(en ? "en-US" : "es-ES") + (decimal ? (en ? "." : ",") + decimal.slice(0, 6) : "");
}
async function check(address) {
  if (!valid(address)) { status(tr("Dirección no válida.", "Invalid address."), true); return; }
  const button = el("check-balance");
  const requestId = ++activeRequest;
  button.disabled = true;
  el("balance-result").hidden = true;
  status(tr("Consultando red de pruebas…", "Checking test network…"));
  try {
    if (BigInt(await call("eth_chainId")) !== 80002n) throw new Error("Wrong chain");
    if (await call("eth_getCode", [contract, "latest"]) === "0x") throw new Error("Missing contract");
    const data = "0x70a08231" + address.slice(2).toLowerCase().padStart(64, "0");
    const result = await call("eth_call", [{ to: contract, data }, "latest"]);
    if (!/^0x[0-9a-fA-F]{64}$/.test(result)) throw new Error("Unexpected balance response");
    const decimalsResult = await call("eth_call", [{ to: contract, data: "0x313ce567" }, "latest"]);
    if (!/^0x[0-9a-fA-F]{64}$/.test(decimalsResult) || BigInt(decimalsResult) !== 18n) throw new Error("Unexpected token decimals");
    if (requestId !== activeRequest) return;
    el("balance-address").textContent = address;
    el("balance-value").textContent = formatBalance(result) + " NVRA";
    el("balance-result").hidden = false;
    status(tr("Consulta completada. Saldo experimental.", "Query complete. Experimental balance."));
  } catch {
    if (requestId !== activeRequest) return;
    status(tr("No se pudo consultar el saldo. Inténtalo más tarde.", "Balance unavailable. Please try again later."), true);
  } finally { if (requestId === activeRequest) button.disabled = false; }
}
el("access-form").addEventListener("submit", event => {
  event.preventDefault();
  void check(el("wallet-address").value.trim());
});
el("connect-wallet").addEventListener("click", async () => {
  if (!window.ethereum?.request) {
    status(tr("No se detectó una cartera. Introduce la dirección manualmente.", "No wallet detected. Enter the address manually."), true);
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!Array.isArray(accounts) || !valid(accounts[0])) throw new Error("Invalid account");
    el("wallet-address").value = accounts[0];
    status(tr("Cartera conectada. Ahora puedes consultar el saldo.", "Wallet connected. You can check the balance."));
  } catch {
    status(tr("Conexión no autorizada.", "Connection not authorized."), true);
  }
});
})();
