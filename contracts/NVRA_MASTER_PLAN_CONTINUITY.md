# NovaRise NVRA — Plan maestro y punto de continuidad

Actualizado: 2026-11-06. Este documento es el punto de partida para retomar el trabajo en un nuevo chat. Verificar siempre el HEAD de la rama y sus GitHub Actions antes de actuar.

## Decisiones aprobadas
- Red Base Mainnet (chainId 8453); sin despliegues en testnet.
- Token NovaRise Utility Token (NVRA), 18 decimales, suministro fijo 1.000.000 sin mint posterior.
- Asignaciones: 300.000 juegos/minería/participación; 250.000 ecosistema/apps; 200.000 liquidez/expansión; 150.000 equipo; 100.000 reserva.
- Equipo: beneficiario inmutable 0x89316a3553Da9315a720e25915d731AfD11d0B16, cliff 365 días y liberación lineal posterior de 1.095 días. Inicio real: timestamp de la inicialización atómica y financiación, sin retroactividad.
- Tesorería: Safe 2-de-3 0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd. Propietarios esperados: 0x89316a3553Da9315a720e25915d731AfD11d0B16, 0xe697351daE40E770769B35852C1e05737015b6B7, 0x5927b6f05c4CdD16Cce6Cc429650c0b767137245.
- Política A: recuperación acotada del excedente accidental en vesting, ejecutable solo por Safe controlador y devuelta exclusivamente al mismo Safe; preservar siempre 150.000 NVRA menos los ya liberados.
- No publicar enlaces al repositorio GitHub en la web pública.

## Repositorio
- jonelpd/NovaRise, rama feat/phase4-create2-vesting-integration, PR borrador #93 (dependiente de #92). No fusionar sin aprobación expresa.
- En commit 7caa08dd457550785f2d10590ecd04c9112142d1 los cuatro flujos GitHub Actions estaban en verde: estáticas, experimentales, validación y pruebas Solidity locales.
- Commit posterior a852da8fa7527cd40913c2b79d79974474bc93f6 actualiza manifiesto; su CI debe comprobarse por separado.

## Fase actual: 4.3 — contrato y vesting integrados; validación pre-mainnet
### Completado
- Fábrica atómica CREATE2 para cinco destinos y emisión de 1 millón de NVRA.
- Vesting de beneficiario fijo, 12 meses de cliff y 36 meses lineales, financiado atómicamente.
- Nuevo contrato NVRABoundedSurplusVestingDraft y conexión a NVRAAtomicImmutableVestingFactoryDraft.
- Pruebas de acceso, límites de excedente, liberación parcial, protección de 150.000 NVRA y flujo integral local. CI verde en 7caa08d.
- Manifiesto de Base con decisiones y bloqueos explícitos.
- Guía de verificación de Safe en `contracts/BASE_MAINNET_SAFE_VERIFICATION_RUNBOOK.md`; aún NO ejecutada contra RPC real.

### Pendiente — orden recomendado
1. Confirmar CI del HEAD más reciente y corregir regresiones; añadir pruebas de reversiones atómicas y controles de Safe 2-de-3 reales en simulación local. CI confirmado verde para commit 86d877dac2ab5af8f4c24774da5a5cf2b1dd55c9 (cuatro flujos).
2. Ejecutar comprobación SOLO LECTURA del Safe en Base RPC 8453: dirección, código, propietarios, umbral, singleton, fallback handler y hashes contra referencias fiables. Scripts contracts/scripts/base-mainnet-readiness.cjs y check-safe-2of3.cjs. No afirmar verificación on-chain hasta ejecutarla.
3. El script estricto ya admite Safe 1.4.x y 1.5.x y cuenta con prueba simulada 1.5.0; **aún falta** identificar la versión y singleton reales por RPC y contrastar codehashes independientes. Después: auditoría de seguridad independiente, resolver hallazgos y congelar bytecode, dependencias y commit.
4. Revisión legal/regulatoria, custodia independiente de firmantes y presupuesto de gas.
5. Preparar checklist go/no-go y pedir autorización expresa para cada transacción real. No firmar, desplegar, fondear ni fusionar sin dicha autorización.
6. Tras despliegue autorizado: verificar contratos en BaseScan, registrar direcciones/hashes y actualizar web/libro blanco; después desarrollar utilidades de juegos/minería y aplicaciones según su plan separado.

## Bloqueos actuales
- El intento de consultar https://mainnet.base.org desde el entorno de ejecución falló por resolución DNS (2026-11-06); NO se obtuvo información on-chain. Safe aún NO verificado independientemente contra Base Mainnet RPC; singleton y codehashes desconocidos. Riesgo identificado y mitigado a nivel de compatibilidad local: el preflight acepta versiones 1.4.x/1.5.x; falta comprobación en Base y hashes confiables.
- Sin auditoría independiente ni revisión legal aprobada.
- No existe autorización concreta para una transacción de despliegue o financiación.
- Tres firmantes pueden estar bajo un mismo dispositivo: revisar custodia.

## Regla de continuidad
Al terminar cada ejecución, mostrar: fase actual, completado en esa ejecución, pruebas/commit, pendientes ordenados, bloqueos, siguiente paso único. Nunca confundir pruebas locales con despliegue en Base Mainnet. No mezclar NovaRise con Impulsa tu negocio ya ni AhorraEnCasa.

## Registro de continuidad 2026-11-06
- CI del commit `86d877d` confirmado: cuatro workflows exitosos.
- Se intentó consulta JSON-RPC de solo lectura `eth_chainId` a `https://mainnet.base.org`, pero el entorno no resolvió DNS. No se realizó consulta real al Safe ni se obtuvo bloque o código.
- Próxima acción: conseguir acceso a RPC Base Mainnet en entorno habilitado y ejecutar preflight read-only, contrastar singleton/version/bytecode y hashes contra fuentes independientes. No marcar Safe verificado hasta contar con evidencia.

## Registro 2026-11-06 — documentación Safe
- Confirmados cuatro workflows verdes del commit `efee96dbef8ec28110dede232234f1d956c2924c`.
- Se añadieron referencias oficiales de Safe 1.5.0 y riesgos de fallback handlers a `contracts/BASE_MAINNET_SAFE_VERIFICATION_RUNBOOK.md`.
- Sigue pendiente leer estado real del Safe de NovaRise por Base RPC, contrastar bytecode/hashes con `safe-deployments`, realizar auditoría independiente, revisión legal y aprobación expresa de despliegue.

## Registro 2026-11-06 — catálogo Safe Base
- CI del commit `74c52f7` confirmado: cuatro workflows verdes.
- Documentados cuatro candidatos oficiales de singleton Safe/SafeL2 1.4.1/1.5.0 para Base (8453) en `BASE_MAINNET_SAFE_VERIFICATION_RUNBOOK.md`.
- No se ha leído el proxy real; NO se ha elegido singleton ni verificado hashes. Próximo paso: lectura RPC de solo lectura del Safe y contraste independiente del bytecode.

## Registro 2026-11-06 — Safe discovery automatizado
- CI del commit `abed43a` confirmado: cuatro flujos verdes.
- RPC público Base desde entorno local sigue inaccesible por DNS; también se probaron proveedores alternativos, sin conexión. No hay verificación on-chain.
- Añadido script `contracts/scripts/discover-base-safe-readonly.cjs`: lee chainId, bloque, owners, threshold, version, módulos, guard, singleton, fallback y hashes runtime (solo lectura). Los hashes observados NO equivalen a comparación con referencias independientes.
- Añadido workflow manual `.github/workflows/nvra-safe-readonly-discovery.yml` para ejecución desde GitHub Actions; **NO se ha ejecutado** y no debe confundirse con CI de tests.
- Siguiente: confirmar CI del HEAD, ejecutar workflow de descubrimiento read-only cuando esté disponible y evaluar resultados, luego contrastar hashes con artefactos oficiales. Sin transacciones ni autorización de despliegue.

## Registro 2026-11-06 — CI de Safe discovery
- Commit `eb90962` comprobado: cuatro GitHub Actions exitosas.
- El conector GitHub disponible permite consultar resultados pero no lanzar `workflow_dispatch`; flujo manual de descubrimiento **no ejecutado**.
- Procedimiento manual y alternativa de ejecución local documentados en `BASE_MAINNET_SAFE_VERIFICATION_RUNBOOK.md`. Puede ser necesario que GitHub reconozca el workflow desde la rama predeterminada; no fusionar PR para habilitarlo sin permiso.
- Próximo paso: ejecutar descubrimiento read-only en entorno con red, verificar resultados y comparar hashes contra artefactos independientes; auditoría y revisión legal después. Sin despliegues.

## Registro 2026-11-06 — habilitación workflow en rama predeterminada
- Usuario autorizó expresamente incorporar **solo** el workflow manual a rama principal.
- Archivo `.github/workflows/nvra-safe-readonly-discovery.yml` creado en rama predeterminada, commit `dec4c31bf0bf61e150ca9ca2d5df9f19268e5080`. Hace checkout explícito de `feat/phase4-create2-vesting-integration` sin persistir credenciales y ejecuta consultas de solo lectura.
- PR #93 sin fusionar, sin contratos desplegados, sin transacciones. El flujo no se ha ejecutado ni se ha confirmado todavía que aparezca en la UI.
- Siguiente: abrir Actions, localizar `NVRA Base Safe read-only discovery`, ejecutarlo manualmente, revisar logs y cotejar hashes con referencias oficiales.

## Registro 2026-11-06 — primera ejecución real de Safe discovery
- Usuario mostró capturas del workflow manual `NVRA Base Safe read-only discovery #1`, exitoso (27 s total; job 21 s), en `main` commit `dec4c31`.
- Salida visible: `mode=READ_ONLY_DISCOVERY_NOT_ATTESTATION`, `chainId=8453`, bloque `53884969`, Safe `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd`, `VERSION()=1.5.0`, threshold=2, owners coincidentes con las tres direcciones previstas, módulos vacíos, singleton `0xEdd160fEBBD92E350D4D398fb636302fccd67C7e` (Safe L2 1.5.0).
- La captura corta el valor completo de guard y no muestra fallback ni codehashes. Aunque el job terminó verde, falta guardar/inspeccionar el registro completo y contrastar hashes contra referencias oficiales. No se declara auditoría ni attestation independiente.
- Siguiente: solicitar captura de parte inferior del mismo log (guard, fallback, codehashes, mensaje final) y verificar hashes. No hay autorización de despliegue.

## Registro 2026-11-06 — resultados completos de descubrimiento Safe
- Captura del usuario de workflow `NVRA Base Safe read-only discovery #1`, job verde. Resultado `DISCOVERY_CHECKS_PASSED`.
- Bloque Base 53884969; versión 1.5.0, owners esperados 3, threshold 2, módulos vacíos, singleton Safe L2 `0xEdd160fEBBD92E350D4D398fb636302fccd67C7e`.
- Guard `0x0000000000000000000000000000000000000000`; fallback `0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4`.
- Runtime codehash proxy `0x4e381985ca68b3e5d27b4425fa581c19cf33146d3f887a3cfca96f55528ea46f`.
- Runtime codehash singleton `0x180193227186ccb85316c94db1f0d156ed932b14712cfaac78901899178572dc`.
- Runtime codehash fallback `0x3c6a85bcf7b563daa624b884b4e9a1b9fa5371edde7be945d998071a48f28bbc`.
- **IMPORTANTE:** estos son hashes observados, aún NO comparados con artefactos oficiales independientes; no hay auditoría ni autorización de despliegue.
- Siguiente paso: contraste reproducible con `safe-global/safe-deployments`, revisión de seguridad de scripts y expediente de auditoría.

## Decisión del usuario 2026-11-06 — priorizar despliegue real NVRA
- Usuario solicita comenzar **ya** el despliegue de NVRA en Base Mainnet y posponer las demás comprobaciones hasta disponer del token. Se acepta priorizar preparación de lanzamiento, dejando riesgos explícitos y sin declarar auditoría superada.
- Revisión de código: `NVRAAtomicImmutableVestingFactoryDraft` requiere **dos transacciones on-chain**: (1) desplegar fábrica con controller Safe, beneficiary, start, cliff y linearDuration; (2) llamar `initialize()` desde el **mismo deployer** (`initializer`), en timestamp >= start. Solo la segunda crea y financia token, vaults y vesting de forma atómica. No afirmar que ambas transacciones sean atómicas.
- `contracts/hardhat.config.cjs` tiene `accounts: []` en Base; **no existe firmante configurado ni despliegue posible desde el conector actual**. El script `simulate-deployment.cjs` es legado, usa `NVRAToken` con 100 millones y **NO es apto para NVRA de 1 millón**; no ejecutarlo como despliegue final.
- Preparar procedimiento de despliegue final con firma desde cartera bajo control del usuario, gas ETH en Base, validación de parámetros de constructor y captura de tx hash/contrato. Nunca pedir claves privadas/frases semilla en chat. Se requiere autorización para cada transacción concreta y explicación de riesgos de omitir auditoría/legal.
- Estado actual: **sin despliegue**. Siguiente: preparar scripts de despliegue controlados y revisarlos en simulación local; después solicitar firma del usuario en cartera, sin transmitir secretos.

## Registro 2026-11-06 — medición de gas de lanzamiento
- Usuario confirma MetaMask móvil con Base disponible, saldo cripto cero. **No comprar ETH todavía** sin estimación de ejecución y L1 data fees.
- Cuatro CI de `e111633` confirmados exitosos.
- Añadido `contracts/scripts/estimate-atomic-launch-gas.cjs`, que mide gas local de despliegue de fábrica y llamada `initialize()`; verifica suministro 1M y vesting 150k. Emplea código Safe ficticio **solo local** para satisfacer `code.length`; no simula comportamiento real del Safe.
- Script todavía sin ejecución ni resultados de gas verificados. Ejecución: `cd contracts && npm ci && npx hardhat run scripts/estimate-atomic-launch-gas.cjs --network hardhat`.
- Antes de compra, obtener gas usado de ambas transacciones, tarifas Base recientes, coste L1 de datos, colchón y comisiones de adquisición de ETH. Nunca solicitar frase semilla.

## Registro 2026-11-06 — medición gas por CI
- Añadida prueba `contracts/test/atomic-launch-gas-report.test.cjs` que despliega fábrica e inicializa NVRA en Hardhat local, comprueba 1M de suministro y 150k vesting, imprime `NVRA_LOCAL_GAS_REPORT` con gas de cada tx y margen del 30%.
- Commit `ddc732e3893a86500adcfd341c178606117491a1`: CI al último control: estáticas verde, tres flujos aún en progreso; **no se han obtenido ni validado cifras de gas todavía**.
- Próximo paso: esperar CI, extraer `NVRA_LOCAL_GAS_REPORT` del job, contrastar tarifas de Base y L1 data fees; solo entonces recomendar importe de ETH para MetaMask.
- Sin fondos ni despliegue; el usuario tiene MetaMask con Base, saldo cero.

## Registro 2026-11-06 — resultado de gas confirmado
- CI de commit `9d4cc054de7889d9804f41e5f30bbbc970f127df`: 4/4 workflows verdes.
- En logs de jobs `127893988453` y `127894059609` aparece el mismo `NVRA_LOCAL_GAS_REPORT`: despliegue fábrica 3,060,359 gas; initialize 3,101,070 gas; total 6,161,429 gas; con colchón 30% 8,009,857 gas.
- Referencia pública Base 2026-11-06: 0.0062 gwei, solo ejecución: 8,009,857 * 0.0062 gwei = 0.0000496611134 ETH (~USD 0.11 si ETH ~USD 2,230). No es precio vinculante.
- **Pendiente** estimación exacta de Base L1 data fee por bytecode de factory (transacción grande), variación de gas y comisiones de compra/retiro. No recomendar comprar un importe exacto ni desplegar hasta cotejar total en wallet. Saldo usuario cero, MetaMask Base instalada.
- Siguiente paso: construir transacciones sin firmar para cotizar con wallet/Base RPC, preservando la identidad del inicializador entre ambas operaciones; nunca solicitar secretos.

## Registro 2026-11-06 — preparación de transacciones sin firma
- Creado `contracts/scripts/prepare-base-unsigned-launch.cjs` (commit `2f80479b0f69d23660cd4a355a6013c536da63e3`), que genera payload de despliegue de fábrica y calldata de `initialize()` usando artefactos compilados, sin RPC, firma ni fondos.
- Uso tras compilar: `node scripts/prepare-base-unsigned-launch.cjs <start_unix_seconds> <deployer_eoa_address>` desde `contracts`. El inicio se escoge explícitamente; la dirección factory de tx2 se obtiene únicamente del recibo minado de tx1.
- **Decisión operativa pendiente:** usuario debe confirmar si usará su EOA de MetaMask como desplegador e inicializador (ambas transacciones requieren misma dirección). El Safe sigue siendo controlador de vaults y vesting, no firmante de estas transacciones EOA.
- Pendiente estimación de comisión L1 datos de Base, gas real y compra ETH. No ejecutar ni firmar transacciones sin autorización concreta. El nuevo script aún no está validado en CI.

## Registro 2026-11-06 — EOA de despliegue confirmada
- Usuario confirma usar la misma MetaMask EOA `0x89316a3553Da9315a720e25915d731AfD11d0B16` para desplegar fábrica y llamar `initialize()`; coincide con beneficiario vesting y propietario 1 del Safe 2/3.
- Añadida prueba `contracts/test/unsigned-base-launch-payload.test.cjs` para validar dirección EOA, controlador Safe, constructor, plazos y calldata `initialize` sin firmar ni enviar; último commit de prueba `971ccb8ac6032ceff51772fc16d3c117b326b7e4`.
- Pendiente CI del test, fijar fecha mínima `start` explícita y calcular L1 data fee Base + coste real. No se solicita clave privada ni fondos todavía. Despliegue real no realizado.

## Registro 2026-11-06 — inicio inmediato autorizado
- Usuario autoriza lanzamiento en cuanto haya ETH, sin espera por fecha futura. Para constructor se fija umbral mínimo `1793923200` (2026-11-06 00:00 UTC), ya transcurrido, **no** es fecha efectiva de vesting. El vesting empieza al minarse `initialize()`.
- Se detectó y corrigió fallo de prueba en CI (`decodeDeploy` no existe en ethers v6); ahora se usa `AbiCoder.defaultAbiCoder().decode` para argumentos de constructor.
- Script `prepare-base-unsigned-launch.cjs` acepta `deployer_eoa_address` como primer argumento, inicio opcional por defecto al umbral fijo. La prueba usa dirección MetaMask confirmada y comprueba umbral.
- Último commit de cambios `81a4aa9590f3420181f874207838e41b6110336a`. CI pendiente. No se ha enviado ni firmado transacción. Pendiente L1 fee y método seguro de firma en MetaMask móvil.

## Registro 2026-11-06 — CI verde y guía firma móvil
- Commit `ac97dd5e6f1cf421267e09a4184a5900e2dc4162`: 4/4 workflows GitHub Actions verdes.
- Creada guía `contracts/BASE_MAINNET_MOBILE_METAMASK_LAUNCH_RUNBOOK.md` commit `51b64b015624812bafdc32819034553b442528e1`, con EOA confirmada, Safe, umbral de fecha, pasos de firma separada, verificaciones de recibos y prohibición de secretos.
- Todavía **no** hay método de firma móvil comprobado ni cotización completa de L1 data fees; no se ha solicitado compra de ETH ni enviado transacción. Próximo paso: elegir un método fiable de interacción con MetaMask móvil y estimar gas L1 antes de financiar.

## Registro 2026-11-06 — cotización Base L1/L2 sin firma
- Creado `contracts/scripts/quote-base-launch-readonly.cjs` (commit `95c9d172ec96336faf455c86bfc85e765ae89a7f`), consulta por RPC HTTPS Base Mainnet: gas estimado de creación, tarifas EIP-1559, `GasPriceOracle.getL1Fee` y `getL1FeeUpperBound` sobre transacción serializada **sin firma**.
- Requiere `BASE_MAINNET_RPC_URL` y artefactos Hardhat compilados. No envía transacciones ni necesita ETH. No se ha ejecutado aún contra RPC en este turno; sin cifra final verificada.
- Para segunda tx, sin factory desplegada no puede obtenerse estimación L1 exacta en mainnet: el script usa límite L1 de primera tx para ambas y gas local de initialize; esta cifra es **provisional** y debe revisarse en MetaMask.
- Último CI verificado 4/4 verde en commit `ac97dd5`. Mantener ETH sin comprar hasta validar cotización. Siguiente paso: ejecutar script en entorno con RPC Base y validar resultado, luego escoger interfaz segura de firma móvil.

## Registro 2026-11-06 — ejecución automatizada de cotización L1/L2
- Creado workflow `.github/workflows/nvra-base-fee-quote.yml` commit `f1548e7ecf2faa93d219ca62b3fdb6fb70ae67ee`, que instala dependencias, compila y consulta en solo lectura el GasPriceOracle en Base RPC público `https://mainnet.base.org`.
- Aún **no** aparece una ejecución del nuevo workflow asociada al commit; GitHub puede requerir que workflow esté en rama por defecto para despacho manual. No se dispone de resultados de L1 ni presupuesto exacto. No inferir que 0.002 ETH es suficiente.
- Consulta de documentación Base: tarifas incluyen L2 y L1; Oracle en `0x420000000000000000000000000000000000000F` con `getL1Fee(bytes)` y `getL1FeeUpperBound(uint256)`.
- Próximo paso: verificar si se dispara workflow y obtener log; si no, habilitar ejecución mediante un workflow ya autorizado sin tocar web pública ni credenciales. No se ha firmado ni desplegado token.

## Registro 2026-11-06 — intento de ejecución de cotización Base
- Verificado: 4 workflows existentes del commit `f1548e7` en verde, pero workflow nuevo de tarifas no figuraba entre ejecuciones.
- Añadido trigger `pull_request` al `.github/workflows/nvra-base-fee-quote.yml` (commit `76d0b84`) para activar el job desde PR abierto.
- Conforme documentación Base actual, coste total incluye L2 + L1 + operator fee. Añadida consulta `getOperatorFee(uint256)` para ambas operaciones al script de cotización (commit `ef20637`).
- **Sin resultado RPC todavía:** ni workflow nuevo confirmado ni ejecución local de RPC (entorno local sin resolución DNS). No asegurar que 0.002 ETH basta ni solicitar compra aún.
- Próximo: recuperar log del job de cotización, depurar errores si aparecen y validar presupuesto. Último commit anterior a esta actualización `ef206378167f9048b9ea822b6591f59099e7b176`.

## Registro 2026-11-06 — cotización integrada en workflow existente
- Dado que el workflow nuevo no generó ejecuciones observables, se añadió el paso de cotización read-only al workflow **ya activo** `.github/workflows/nvra-contracts-validation.yml` tras compilación y tests (commit `b9aebf128119ce90f3dd8032f42d8d76ce341796`).
- El paso usa `BASE_MAINNET_RPC_URL=https://mainnet.base.org`, no requiere claves ni envía transacciones, y es `continue-on-error` para no bloquear validación si RPC público falla.
- Pendiente observar ejecución y logs, verificar el cálculo de L1, L2 y operador. No existe todavía presupuesto exacto ni autorización para comprar ETH o desplegar.

## Registro 2026-11-06 — cotización real RPC Base obtenida
- Workflow `NVRA contracts validation` run **42289829058**, job **128140025951**, commit `e69c459fe9a5b403ee0d174a89e0a26c6da66916`, completado **success**, incluido paso `Quote Base Mainnet fees (read-only, non-blocking)` **success**. Los cuatro workflows del commit finalizaron en verde.
- RPC Base Mainnet chain 8453, deployer nonce 0, tamaño serializado unsigned tx1 15.010 bytes; maxFeePerGas 0.011 gwei; gas deploy estimado RPC 3.085.815; gas initialize local 3.101.070; L1 fee deploy estimada 0.00000007579967954 ETH; L1 upper bound deploy 0.00000013902368518 ETH; operator fees estimadas 0 ETH; **presupuesto provisional ambas tx con buffers = 0.00008875049737036 ETH**.
- Comparación: 0.002 ETH / presupuesto provisional ≈22.5 veces. 0.002 ETH es **reserva sugerida**, no gasto ni coste fijo; excluir comisiones exchange/puente y no prometer precio de adquisición. L1 de segunda tx aproximada con upper bound de primera; requerirá recotización al desplegar.
- Próximo paso: seleccionar y verificar interfaz MetaMask móvil para firmar tx1 creación contrato, recotizar antes de cada firma, validar bytecode y parámetros, obtener autorización explícita antes de gastar. No hay transacciones on-chain.
