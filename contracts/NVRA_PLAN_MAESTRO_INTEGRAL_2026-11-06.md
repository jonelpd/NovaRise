# NOVARISE NVRA — PLAN MAESTRO INTEGRAL
**Corte:** 7 de noviembre de 2026 · **Estado:** NVRA emitido en Base Mainnet; utilidades y verificaciones posteriores pendientes · **Versión:** 1.1

> Documento de gestión del proyecto, no promesa de rentabilidad, oferta pública ni informe de auditoría. Los contratos siguen siendo candidatos (Draft/Candidate) y la rama es experimental. Este documento consolida las decisiones vigentes; las anotaciones históricas en `NVRA_MASTER_PLAN_CONTINUITY.md` pueden contener datos anteriores ya sustituidos.

## 1. Visión y alcance
NovaRise Analítica construye un ecosistema de herramientas de análisis, comunidad, aplicaciones y videojuegos. NVRA se proyecta como token de **utilidad** para funciones elegibles del ecosistema, sujeto a revisión técnica y jurídica. La integración con el juego Reinos de Leyenda y eventuales recompensas/minería de juego es una **meta futura**, no una funcionalidad on-chain operativa. No hay rentabilidad garantizada ni venta pública anunciada.

## 2. Decisiones vigentes (no confundir con versiones antiguas)
| Decisión | Configuración |
|---|---|
| Red | Base Mainnet, chainId 8453 |
| Nombre/símbolo | NovaRise Utility Token / NVRA |
| Estándar | ERC-20, 18 decimales |
| Suministro | 1.000.000 NVRA fijos, sin mint posterior |
| Cuenta que firma las 2 transacciones | 0x89316a3553Da9315a720e25915d731AfD11d0B16 |
| Safe controlador | 0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd |
| Umbral Safe | 2 de 3 |
| Vesting equipo | 150.000 NVRA; 365 días cliff y 1.095 días lineales |
| Beneficiario vesting | 0x89316a3553Da9315a720e25915d731AfD11d0B16 |
| Fecha mínima constructor | 1793923200 (2026-11-06 00:00 UTC); inicio efectivo vesting = timestamp de initialize() |
| Lanzamiento | Dos transacciones independientes, ambas firmadas por la misma cuenta |

### Asignaciones
| Destino | NVRA | Porcentaje |
|---|---:|---:|
| Juegos, minería y participación | 300.000 | 30 % |
| Ecosistema y aplicaciones | 250.000 | 25 % |
| Liquidez y expansión | 200.000 | 20 % |
| Equipo (vesting) | 150.000 | 15 % |
| Reserva | 100.000 | 10 % |
| **Total** | **1.000.000** | **100 %** |

No reutilizar la distribución anterior «30 % ecosistema, 25 % tesorería, 20 % comunidad, 15 % equipo, 10 % liquidez» ni Safe «3 de 5». Una asignación para liquidez no implica provisión ni bloqueo real de liquidez.

## 3. Hecho y comprobado
### Producto y web
- Web bilingüe ES/EN con páginas de inicio, tokenómica, libro blanco, analizador de tokens EVM, comparador, herramientas de seguimiento, formulario de interés, moderación y hoja de ruta de comunidad.
- Canales de comunicación: Facebook y Telegram como prioridad de automatización; X pospuesto. No publicar enlaces de GitHub en el sitio público.
- Se actualizan textos de tokenómica, libro blanco y estado de lanzamiento en rama de trabajo. **No equivale a publicación en web visible** hasta integración autorizada en rama desplegada.

### Contratos y seguridad
- Contrato candidato ERC-20 de 1 millón de NVRA y fábrica `NVRAAtomicImmutableVestingFactoryDraft` que despliega cinco vaults CREATE2, token y vesting y los financia en una llamada `initialize()`.
- Vesting con beneficiario fijo, 365 días de espera y 1.095 días de liberación lineal; política A de rescate limitado del excedente accidental, solo al Safe controlador.
- Pruebas locales de contratos, asignaciones, permisos, recuperación acotada, preflight Safe y preparación de payloads sin firma.
- Safe 2 de 3 consultado en Base mediante workflow de solo lectura: versión 1.5.0, umbral 2, tres propietarios esperados, sin módulos habilitados, guard nulo. **Falta contraste independiente de bytecode/referencias y auditoría**.
- Las cuatro suites habituales de CI superadas en commit `e69c459fe9a5b403ee0d174a89e0a26c6da66916`. Verificar CI del HEAD antes de fusionar.

### Tarifas y despliegue
- Gas local medido: factory 3.060.359; initialize 3.101.070; total 6.161.429; con margen 30 % = 8.009.857.
- Consulta Base RPC real mediante workflow run 42289829058, job 128140025951, 2026-11-06: maxFeePerGas 0.011 gwei, factory estimateGas 3.085.815, L1 estimate factory 0.00000007579967954 ETH, upper bound L1 0.00000013902368518 ETH, operator fee 0 ETH.
- Presupuesto provisional **0.00008875049737036 ETH** para dos tx (L1 de tx2 aproximada y gas tx2 local); **0.002 ETH** es saldo de reserva sugerido, no gasto real garantizado. No incluye tarifas de adquisición o puente. Recotizar al firmar.
- Guía de MetaMask/Remix documentada. Remix advierte que móvil no está oficialmente soportado; se decidió continuar desde ordenador en próxima sesión.
- No hay transacciones de creación firmadas, no se ha comprado ETH para el lanzamiento en esta fase y **NVRA no está desplegado**.

## 4. Estado técnico y control de cambios
- Repositorio privado de trabajo: `jonelpd/NovaRise`; rama `feat/phase4-create2-vesting-integration`; PR #93 **borrador**, basada en #92; **NO FUSIONAR** sin autorización.
- Código principal: `contracts/src/NVRAAtomicImmutableVestingFactoryDraft.sol`, `contracts/src/NVRAAtomicAllocationCandidate.sol` y vesting acotado.
- Herramientas: `contracts/scripts/prepare-base-unsigned-launch.cjs`, `contracts/scripts/quote-base-launch-readonly.cjs`; CI `.github/workflows/nvra-contracts-validation.yml`.
- Guía: `contracts/BASE_MAINNET_MOBILE_METAMASK_LAUNCH_RUNBOOK.md`.
- **Prohibido usar** `contracts/scripts/simulate-deployment.cjs` para Mainnet: script legado de suministro 100 millones/Polygon.
- No añadir claves, semillas, firmas o secretos al repositorio ni a chats; GitHub Actions solo lectura.

## 5. Pendientes priorizados
### P0 — Antes de gastar ETH o firmar
- [ ] Verificar CI del HEAD y revisar diferencias entre rama y sitio desplegado.
- [ ] Confirmar compilación reproducible: Solidity 0.8.24, optimizer 200, importaciones y bytecode exacto entre Hardhat y Remix; comprobar constructor y `initialize()`.
- [ ] En ordenador, comprobar conexión MetaMask con **Base 8453** y cuenta prevista. Nunca entregar semilla ni claves.
- [ ] Recotizar L2 + L1 + operador; considerar comisiones de adquisición/transferencia. Confirmar saldo y límite máximo por transacción.
- [ ] Revalidar Safe, direcciones, contrato y parámetros de vesting; evaluar riesgos de seguridad y custodia. Auditoría independiente y revisión jurídica siguen pendientes, aunque el usuario priorice lanzamiento.
- [ ] Obtener aprobación explícita e informada para **cada** transacción; no firmar automáticamente.

### P1 — Lanzamiento técnico
- [ ] Tx1: desplegar factory desde EOA previsto; verificar receipt, dirección, chainId y parámetros inmutables.
- [ ] Tx2: llamar `initialize()` desde la **misma EOA**, con cero ETH; confirmar receipt y eventos.
- [ ] Verificar en explorador/RPC: suministro 1M, 18 decimales, cinco asignaciones, saldos de vaults, 150k de vesting, inicio real, Safe y permisos.
- [ ] Registrar direcciones y hashes **solo tras comprobación**; actualizar sitio, tokenómica, libro blanco, explorador y documentación. No publicar direcciones inventadas.

### P2 — Web y transparencia
- [x] Corregir en rama de trabajo los porcentajes, Safe 2 de 3 y estado pre-lanzamiento de páginas ES/EN.
- [ ] Validar HTML, enlaces, coherencia ES/EN, accesibilidad y pruebas del sitio; confirmar CI del HEAD.
- [ ] Revisar editorialmente, aprobar e integrar cambios al sitio público mediante flujo controlado. No fusionar PR experimental de contratos por publicar textos.
- [ ] Crear página de estado de lanzamiento con datos on-chain verificables **cuando existan**, sin botones de compra ni promesas de rendimiento.
- [ ] Mantener historial editorial y actualizaciones bilingües.

### P3 — Ecosistema y operación
- [ ] Diseñar y probar la utilidad NVRA en juegos, especialmente Reinos de Leyenda, sin confundir recompensas de juego con minería cripto operativa.
- [ ] Especificar reglas de emisión de recompensas, límites, antiabuso, controles del tesoro, contabilidad y aprobación Safe 2 de 3.
- [ ] Planificar integración de aplicaciones, seguridad del CRM y comunicaciones.
- [ ] Revisar marco legal aplicable (España/UE, MiCA si procede), fiscalidad, protección de datos y política de comunicación.
- [ ] Definir proceso de auditoría, respuesta a incidentes, custodia independiente de firmantes y recuperación.
- [ ] Continuar contenido, comunidad, automatización de Facebook/Telegram; X queda aplazado.

## 6. Próxima sesión: ordenador
1. Abrir MetaMask y Remix oficiales; confirmar red y dirección sin firmar.
2. Reproducir compilación y comparar bytecode con el artefacto Hardhat.
3. Consultar de nuevo tarifas reales y decidir cuánto ETH ingresar.
4. Revisar riesgos y pedir autorización separada para Tx1 y Tx2.
5. Si se despliega, comprobar cadena y publicar hechos verificados.

**Criterio de finalización:** no declarar «token lanzado» hasta que Tx2 esté minada con éxito y la distribución/vesting se hayan verificado on-chain.

## 7. Trazabilidad
- Última cotización comprobada: workflow 42289829058, job 128140025951, commit e69c459.
- Referencia de continuidad histórica: `contracts/NVRA_MASTER_PLAN_CONTINUITY.md`.
- La web pública puede seguir mostrando información anterior mientras estos cambios permanezcan en una rama no integrada.


## 8. Hito de producción — 7 de noviembre de 2026 (actualización)

**Estado: emisión confirmada en capturas de Remix y BaseScan facilitadas por el usuario.** Este registro actualiza los estados históricos de preparación anteriores; no los elimina.

- Red: **Base Mainnet (8453)**; token ERC-20 **NovaRise Utility Token (NVRA)**, **18 decimales**.
- **Contrato del token:** `0xa1128B1F4CB8394c179eb2558608a7302972EcBF` — https://basescan.org/token/0xa1128B1F4CB8394c179eb2558608a7302972EcBF
- **Suministro visible en BaseScan:** **1.000.000 NVRA**; **5 holders** iniciales. No se observa precio de mercado establecido ni liquidez pública en la captura.
- Remix conectado mediante MetaMask a EOA `0x89316a3553Da9315a720e25915d731AfD11d0B16`. Contrato de fábrica `NVRAAtomicImmutableVestingFactoryDraft` desplegado en Base; captura de Remix muestra dirección abreviada `0xC45...3cE65` (recuperar dirección completa y hashes de transacción de BaseScan, no deducirlos).
- La captura de Remix muestra `initialize()` ejecutada con indicador verde, seis logs y dos transacciones en historial; `token()` devolvió la dirección NVRA indicada. BaseScan confirmó la emisión.
- Constructor utilizado: Safe controlador `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd`; beneficiario `0x89316a3553Da9315a720e25915d731AfD11d0B16`; fecha mínima `1793923200`; cliff `31536000` segundos; tramo lineal `94608000` segundos.
- Distribución programada: juegos/minería/participación **300.000** (30 %), ecosistema/apps **250.000** (25 %), liquidez/expansión **200.000** (20 %), equipo/vesting **150.000** (15 %), reserva **100.000** (10 %). BaseScan muestra cinco titulares; **pendiente** cotejar cada dirección, saldo y permiso de vault/vesting de forma individual.
- **No repetir Deploy ni initialize().** No existe evidencia de auditoría independiente ni de revisión jurídica final; no afirmar verificación de código en BaseScan, precio de mercado, liquidez, listado en DEX, venta pública, minería operativa ni utilidades NVRA activas.

### Estado de trabajo y prioridades posteriores

| Prioridad | Tarea | Estado |
|---|---|---|
| P0 | Emisión de NVRA 1.000.000 en Base | **Completado** |
| P0 | Incorporar dirección oficial a web ES/EN, libro blanco y tokenómica | **Actualizado en rama pública main, 2026-11-07** |
| P0 | Recuperar hash de ambas tx y dirección completa de fábrica, vesting y vaults; documentar saldos y verificación de código | Pendiente |
| P1 | Auditoría independiente de contratos ya desplegados y controles Safe | Pendiente |
| P1 | Revisión jurídica/regulatoria UE y España y textos públicos | Pendiente |
| P1 | Integración de utilidades NVRA en Reinos de Leyenda y otras aplicaciones | Pendiente; requiere diseño y pruebas |
| P2 | Estrategia de liquidez, acceso a mercados y comunicaciones responsables | Pendiente; no prometer precio ni rendimientos |
| P2 | Consolidar documentación histórica y actualizar automatizaciones/feeds | Pendiente |

### Separación de ramas
Los archivos de web pública se actualizaron directamente en `main` sin fusionar PR #93 ni introducir enlaces públicos a GitHub. La rama experimental `feat/phase4-create2-vesting-integration` conserva el desarrollo de contratos; este plan maestro permanece en ella. No confundir publicación de contenidos con validación técnica de contratos.
