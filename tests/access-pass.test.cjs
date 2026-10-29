#!/usr/bin/env node
"use strict";
// Dependency-free browser-client tests. Run: node tests/access-pass.test.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/access-pass.js"), "utf8");
const address = "0x" + "1".repeat(40);
const contract = "0xCCC748d63333F9aF58f259CDF771d5AB1226e20D";
const word = n => "0x" + BigInt(n).toString(16).padStart(64, "0");
const tick = () => new Promise(resolve => setImmediate(resolve));

async function scenario({ language = "es", input = address, chain = "0x13882", code = "0x6000", decimals = 18n, balance = 25n * 10n ** 18n, rpcError = false, wallet = null } = {}) {
  const elements = Object.fromEntries(["access-status", "access-form", "wallet-address", "check-balance", "balance-result", "balance-address", "balance-value", "connect-wallet"].map(id => [id, { textContent: "", dataset: {}, hidden: id === "balance-result", disabled: false, value: "", listeners: {}, addEventListener(type, cb) { this.listeners[type] = cb; } }]));
  elements["wallet-address"].value = input;
  const methods = [];
  const fetch = async (_url, opts) => {
    const request = JSON.parse(opts.body);
    methods.push(request);
    if (rpcError) throw Error("network error");
    let result;
    if (request.method === "eth_chainId") result = chain;
    else if (request.method === "eth_getCode") { assert.equal(request.params[0], contract); result = code; }
    else if (request.method === "eth_call") {
      const data = request.params[0].data;
      result = data === "0x313ce567" ? word(decimals) : (assert.equal(data, "0x70a08231" + input.slice(2).toLowerCase().padStart(64, "0")), word(balance));
    } else throw Error("unexpected RPC method");
    return { ok: true, json: async () => ({ jsonrpc: "2.0", id: request.id, result }) };
  };
  const context = { document: { documentElement: { lang: language }, getElementById: id => elements[id] }, window: { ethereum: wallet }, fetch, AbortController, setTimeout, clearTimeout, BigInt, console };
  vm.runInNewContext(source, context, { filename: "access-pass.js" });
  elements["access-form"].listeners.submit({ preventDefault() {} });
  for (let i = 0; i < 12 && elements["check-balance"].disabled; i++) await tick();
  return { elements, methods };
}
(async () => {
  let r = await scenario();
  assert.match(r.elements["balance-value"].textContent, /25 NVRA/);
  assert.equal(r.methods.length, 4);
  r = await scenario({ input: "invalid" });
  assert.equal(r.methods.length, 0);
  assert.equal(r.elements["balance-result"].hidden, true);
  r = await scenario({ balance: 0n });
  assert.match(r.elements["balance-value"].textContent, /0 NVRA/);
  r = await scenario({ chain: "0x1" });
  assert.equal(r.elements["balance-result"].hidden, true);
  r = await scenario({ code: "0x" });
  assert.equal(r.elements["balance-result"].hidden, true);
  r = await scenario({ decimals: 6n });
  assert.equal(r.elements["balance-result"].hidden, true);
  r = await scenario({ rpcError: true });
  assert.equal(r.elements["balance-result"].hidden, true);
  r = await scenario({ language: "en" });
  assert.match(r.elements["access-status"].textContent, /Query complete/);
  console.log("PASS: 8 mocked NVRA Access Pass scenarios");
})().catch(e => { console.error(e); process.exitCode = 1; });
