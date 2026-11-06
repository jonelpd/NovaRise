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

### Pendiente — orden recomendado
1. Confirmar CI del HEAD más reciente y corregir regresiones; añadir pruebas de reversiones atómicas y controles de Safe 2-de-3 reales en simulación local.
2. Ejecutar comprobación SOLO LECTURA del Safe en Base RPC 8453: dirección, código, propietarios, umbral, singleton, fallback handler y hashes contra referencias fiables. Scripts contracts/scripts/base-mainnet-readiness.cjs y check-safe-2of3.cjs. No afirmar verificación on-chain hasta ejecutarla.
3. Auditoría de seguridad independiente, resolver hallazgos y congelar bytecode, dependencias y commit.
4. Revisión legal/regulatoria, custodia independiente de firmantes y presupuesto de gas.
5. Preparar checklist go/no-go y pedir autorización expresa para cada transacción real. No firmar, desplegar, fondear ni fusionar sin dicha autorización.
6. Tras despliegue autorizado: verificar contratos en BaseScan, registrar direcciones/hashes y actualizar web/libro blanco; después desarrollar utilidades de juegos/minería y aplicaciones según su plan separado.

## Bloqueos actuales
- Safe aún NO verificado independientemente contra Base Mainnet RPC; singleton y codehashes desconocidos.
- Sin auditoría independiente ni revisión legal aprobada.
- No existe autorización concreta para una transacción de despliegue o financiación.
- Tres firmantes pueden estar bajo un mismo dispositivo: revisar custodia.

## Regla de continuidad
Al terminar cada ejecución, mostrar: fase actual, completado en esa ejecución, pruebas/commit, pendientes ordenados, bloqueos, siguiente paso único. Nunca confundir pruebas locales con despliegue en Base Mainnet. No mezclar NovaRise con Impulsa tu negocio ya ni AhorraEnCasa.
