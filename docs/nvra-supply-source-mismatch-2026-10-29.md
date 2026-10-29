# NVRA — hallazgo de auditoría: discrepancia de suministro (2026-10-29)

**Estado: ABIERTO — bloqueante para declarar equivalencia entre fuente y despliegue.**

## Evidencia
1. La ejecución exitosa de GitHub Actions «NVRA Amoy read-only verification #3» aportada por el usuario devuelve un `totalSupplyRaw` equivalente a **1.000.000 NVRA** (18 decimales) para `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`, Polygon Amoy, chain ID 80002. También devuelve **100.000 NVRA** de saldo para la dirección de tesorería consultada.
2. El archivo `contracts/NVRAToken.sol` en la rama principal declara `MAX_SUPPLY = 100_000_000 * 10 ** 18` y acuña ese importe al constructor-supplied treasury.
3. `contracts/amoy.manifest.json` registra `token.maxSupply = "100000000"`, `deployed: true`, `status: DEPLOYED_TESTNET`, y no aporta hash de transacción (`transactionHash: null`).
4. `contracts/README.md` también describe 100 millones de suministro fijo.

## Conclusión limitada
El contrato consultado responde como NVRA ERC-20, pero **el suministro observado no coincide con la constante y la lógica de acuñación del código fuente actualmente publicado**. No puede declararse `sourceMatched: true` ni afirmar que el contrato desplegado fue compilado a partir de `contracts/NVRAToken.sol`. La huella del código de ejecución es una referencia para comparación posterior, no una auditoría.

## Acciones para cerrar el hallazgo
- Identificar transacción de creación, bloque, creador y constructor arguments del contrato.
- Recuperar el código fuente exacto utilizado en Remix y sus versiones de compilador/OpenZeppelin, configuración de optimización y metadatos.
- Recompilar y comparar el runtime bytecode desplegado, contemplando metadatos y parámetros inmutables.
- Revisar permisos de minteo, propietario, actualización, pausas y distribución real antes de cualquier lanzamiento.
- **No cambiar** suministro, fuente, manifiesto ni contrato para hacerlos coincidir sin evidencia; corregir el registro histórico mediante una actualización trazable cuando se confirme la procedencia.
- No usar fondos reales ni anunciar equivalencia de código o auditoría superada.

**Alcance:** análisis documental de archivos GitHub y captura de resultado del usuario; no hay prueba de equivalencia ni de revisión de seguridad independiente.
