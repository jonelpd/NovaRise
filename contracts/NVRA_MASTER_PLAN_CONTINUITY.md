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
