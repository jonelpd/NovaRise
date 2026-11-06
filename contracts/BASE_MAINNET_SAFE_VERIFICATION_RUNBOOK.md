# Base Mainnet Safe 2-de-3 — verificación previa de solo lectura

**Estado:** PENDIENTE DE EJECUCIÓN CON RPC REAL. Ningún resultado de simulación demuestra por sí solo la identidad del Safe en Base.

## Objetivo y alcance
Validar el Safe de tesorería `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd` antes de autorizar cualquier despliegue de NVRA. No conectar billeteras, firmar, aprobar, transferir ni desplegar.

## Datos aprobados
- Cadena: Base Mainnet, ID 8453.
- Umbral: 2 de 3.
- Owners esperados: `0x89316a3553Da9315a720e25915d731AfD11d0B16`, `0xe697351daE40E770769B35852C1e05737015b6B7`, `0x5927b6f05c4CdD16Cce6Cc429650c0b767137245`.
- Fallback handler esperado: `0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4`.
- Singleton del Safe concreto: **NO CONFIRMADO**. El catálogo público de Safe para Base incluye candidatos conocidos de versión 1.4.1: `0x41675C099F32341bf84BFc5382aF534df5C7461a` (Safe) y `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762` (Safe L2). También existen versiones 1.5.0; **no suponer versión** antes de leer slot 0 y VERSION() del Safe objetivo. Fuente de referencia: https://github.com/safe-global/safe-eth-py/blob/main/safe_eth/safe/addresses.py .

## Procedimiento
1. Obtener un endpoint HTTPS RPC fiable de Base Mainnet. Evitar imprimir credenciales/API keys en logs.
2. Ejecutar en el directorio `contracts`:
   ```bash
   BASE_MAINNET_RPC_URL="https://RPC-DE-BASE" npm run base:readiness
   ```
   Esto comprueba cadena, código presente, umbral y owners. **No comprueba implementación ni hashes**.
3. Identificar por fuente fiable el singleton esperado y su versión; contrastar el singleton leído del slot 0 y el código en Base. **Atención:** el fallback handler comunicado (`0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4`) figura en referencias públicas como v1.5.0; no combinar automáticamente ese dato con una expectativa rígida de Safe v1.4.x. El script `check-safe-2of3.cjs` exige actualmente VERSION() 1.4.x y puede requerir una revisión para reconocer 1.5.0 si esa es la versión verificada. Comprobar versión Safe, módulos, guard y fallback. Con variables de entorno locales:
   ```bash
   BASE_RPC_URL="https://RPC-DE-BASE" \
   SAFE_ADDRESS="0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd" \
   SAFE_OWNERS="0x89316a3553Da9315a720e25915d731AfD11d0B16,0xe697351daE40E770769B35852C1e05737015b6B7,0x5927b6f05c4CdD16Cce6Cc429650c0b767137245" \
   SAFE_SINGLETON="0xSINGLETON_CONFIRMADO" \
   SAFE_FALLBACK_HANDLER="0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4" \
   npm run safe:preflight:base
   ```
   Sustituir los marcadores; no ejecutar con valores ficticios.
4. Obtener y contrastar los hashes keccak256 del runtime del proxy, singleton y fallback con artefactos de referencia confiables, no solo con valores leídos del propio contrato. El script estricto actual **no realiza comparación de hashes**: requiere verificación adicional antes de marcar el Safe como autenticado.
5. Guardar evidencia: fecha UTC, bloque, cadena, resultados, referencias de artefactos, hashes y quién revisó. No registrar secretos.
6. Si hay diferencia de owners, threshold, singleton, handler, guard, módulos, código o hashes: **NO-GO**. Investigar antes de continuar.

## Criterio de cierre
Solo marcar verificado tras comprobación real y evidencia independiente de implementación/hashes. Aun así, no equivale a auditoría del token ni autoriza despliegue.

## Riesgos restantes
Custodia: evaluar independencia de las tres claves y copias de seguridad; posible concentración en un solo ordenador. Auditoría independiente y revisión legal siguen pendientes.

## Evidencia oficial adicional (2026-11-06)
- Safe confirma que 1.5.0 es la versión actual y que un Safe 1.3.0/1.4.1 puede actualizarse sin cambiar dirección, owners ni umbral: https://help.safe.global/articles/7628867084-how-to-upgrade-your-safe-to-contract-version-1-5-0
- El fallback handler merece verificación independiente porque Safe advierte que los handlers externos pueden ampliar la superficie de ejecución: https://docs.safe.global/advanced/smart-account-fallback-handler
- No inferir que la tesorería NovaRise ya usa 1.5.0: hace falta leer `VERSION()`, slot 0, código, owners, threshold, guard, módulos y fallback desde Base RPC y contrastar hashes con los artefactos oficiales de https://github.com/safe-global/safe-deployments .
- El script local `check-safe-2of3.cjs` ya acepta 1.4.x/1.5.x; sus resultados simulados y CI no sustituyen comprobación on-chain.
