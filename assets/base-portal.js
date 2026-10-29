(() => {
"use strict";
const rpc = "https://mainnet.base.org";
const get = id => document.getElementById(id);
const valid = s => /^0x[0-9a-fA-F]{40}$/.test(s);
let sequence = 0;
function status(message, error = false) {
  get("base-status").textContent = message;
  get("base-status").dataset.error = String(error);
}
async function rpcCall(method, params, signal) {
  const response = await fetch(rpc, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal
  });
  if (!response.ok) throw new Error("RPC unavailable");
  const payload = await response.json();
  if (payload.error || typeof payload.result !== "string") throw new Error("Invalid RPC response");
  return payload.result;
}
function ethFormat(wei) {
  const whole = wei / (10n ** 18n);
  const fraction = (wei % (10n ** 18n)).toString().padStart(18, "0").slice(0, 8).replace(/0+$/, "");
  return whole.toString() + (fraction ? "," + fraction : "");
}
async function check(address) {
  if (!valid(address)) { status("Introduce una dirección EVM válida.", true); return; }
  const id = ++sequence;
  const button = get("base-check");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  button.disabled = true;
  get("base-result").hidden = true;
  status("Consultando Base Mainnet…");
  try {
    const chainId = await rpcCall("eth_chainId", [], controller.signal);
    if (BigInt(chainId) !== 8453n) throw new Error("Unexpected chain");
    const hexBalance = await rpcCall("eth_getBalance", [address, "latest"], controller.signal);
    if (!/^0x[0-9a-fA-F]+$/.test(hexBalance)) throw new Error("Invalid balance");
    if (id !== sequence) return;
    get("base-result-address").textContent = address;
    get("base-eth").textContent = ethFormat(BigInt(hexBalance));
    get("base-result").hidden = false;
    status("Consulta completada. No se ha enviado ninguna transacción.");
  } catch {
    if (id === sequence) status("No se pudo consultar Base. Inténtalo más tarde.", true);
  } finally {
    clearTimeout(timeout);
    if (id === sequence) button.disabled = false;
  }
}
get("base-form").addEventListener("submit", event => {
  event.preventDefault();
  void check(get("base-address").value.trim());
});
get("base-connect").addEventListener("click", async () => {
  if (!window.ethereum?.request) {
    status("No se detectó una billetera. Puedes introducir una dirección pública.", true);
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!Array.isArray(accounts) || !valid(accounts[0])) throw new Error("Invalid account");
    get("base-address").value = accounts[0];
    status("Dirección obtenida. Consulta Base cuando quieras.");
  } catch { status("No se pudo conectar la billetera.", true); }
});
})();
