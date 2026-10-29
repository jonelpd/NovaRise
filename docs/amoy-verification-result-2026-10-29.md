# Polygon Amoy NVRA — verificación RPC #3 (29 octubre 2026)

## Evidencia aportada
Captura del usuario de GitHub Actions «NVRA Amoy read-only verification #3», trabajo «verify» con estado **succeeded** (duración aproximada 6 s). El registro muestra ejecución correcta de `node tests/verify-amoy.cjs` con proveedor RPC `polygon-amoy.drpc.org`.

## Datos que muestra la ejecución
- Red: `polygon-amoy`; chain ID: `80002`.
- Dirección consultada: `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`.
- Código de contrato desplegado: **3610 bytes**.
- Símbolo ERC-20: **NVRA**.
- Decimales: **18**.
- Suministro total mostrado: **1.000.000 NVRA** (un millón).
- Dirección de tesorería consultada: `0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77`.
- Saldo de tesorería mostrado: **100.000 NVRA** (cien mil).
- `sourceMatched: false`: campo fijo del verificador que señala **comparación del código fuente pendiente**, no un resultado de comparación negativa.

## Alcance y limitaciones
Esta prueba acredita que, en el momento de la ejecución, el RPC consultado respondió a `eth_chainId`, `eth_getCode` y llamadas de lectura ERC-20 con los valores anteriores. **No acredita** auditoría de seguridad, identidad del código fuente, permisos administrativos, distribución económica, propiedad de la tesorería ni preparación para producción. La captura es evidencia aportada por el usuario; no se ha reproducido una ejecución independiente en este entorno.

## Próxima etapa
1. Identificar transacción de creación, bloque, creador y código fuente verificado en un explorador.
2. Registrar compilador, parámetros de optimización y artefactos de compilación reproducible.
3. Comparar bytecode de ejecución y metadatos con el contrato desplegado.
4. Revisar privilegios, capacidad de acuñación, pausas, transferencias y controles de acceso.
5. Mantener el manifiesto histórico `contracts/amoy.manifest.json` como preparación, sin presentarlo como prueba de despliegue.
