# Fase 6 — Integración segura de NVRA en Reinos de Leyenda

**Estado:** diseño técnico iniciado · sin transacciones reales habilitadas (13-11-2026).

## Estado existente verificado

- `juego/index.html` ya incorpora un **Centro NVRA** accesible desde el encabezado. Presenta minas, cristales y méritos **informativos** de la partida, sin saldo en cadena, monedero conectado ni recompensas reales.
- Las minas generan recursos internos del juego; los méritos de partidas guardadas o importadas **no constituyen prueba verificable de trabajo** y no se convertirán automáticamente en tokens.
- La red prevista es **Base mainnet** (chain ID 8453). El suministro total previsto para NVRA es **1.000.000**. La documentación del proyecto identifica como **dirección comunicada, todavía no verificada on-chain**, `0xa1128B1F4CB8394c179eb2558608a7302972EcBF` (véase `docs/nvra-auditoria-contrato-liquidez-2026-11-08.md`). Los decimales previstos son 18 y el suministro previsto 1.000.000, pero ambos deben comprobarse directamente en Base. La propiedad/roles, el bytecode y la seguridad también siguen pendientes. No activar el contrato en código de producción sin esa verificación.
- **No** existe aún una integración de billetera verificada en el juego.

## Orden de ejecución

1. **Identidad de contrato y seguridad (bloqueante):** confirmar dirección ERC-20 en Base, ABI mínima, decimales, red, permisos, suministro, auditoría/estado de verificación y mecanismos de pausa o revocación si los hubiera. Mantener configuración separada y pruebas de validación.
2. **Conexión opcional de monedero:** integración compatible con proveedores EIP-1193; solicitud de acceso solo tras pulsación explícita del usuario, lectura de cuenta y chain ID, manejo de cambio de cuenta/red, desconexión y ausencia de proveedor. Nunca solicitar frases semilla ni claves privadas. Sin firmas automáticas.
3. **Lectura sin gasto:** mostrar saldo ERC-20 **solo si** se confirma contrato y red; indicar explícitamente diferencia entre NVRA en cadena y cristales/oro del juego. Manejar fallos de RPC y cadenas incorrectas.
4. **Utilidad optativa:** definir un caso de uso que no permita comprar victorias ni bloquee la campaña gratuita. Exigir revisión de experiencia de usuario, seguridad, economía, términos y costes de gas antes de introducir escrituras en cadena.
5. **Recompensas, si se aprueban:** nunca derivar pagos de estados locales manipulables. Requerir verificación de acciones por backend, controles contra fraude/repetición, presupuesto máximo, límites por usuario/periodo, reservas disponibles y análisis legal/fiscal. No prometer ingresos ni liquidez.
6. **Pruebas y lanzamiento progresivo:** unitarias, integración con RPC, validación de red/contrato, errores de proveedor, accesibilidad, guardado sin billetera, móvil y prueba manual. Activación por bandera de función deshabilitada por defecto.

## Condiciones para pasar a implementación de billetera

- Dirección de contrato y metadatos verificados de manera independiente.
- Flujo de consentimiento y privacidad aprobado.
- No alterar partidas ni economía al conectar/desconectar.
- Pruebas de regresión verdes y aceptación manual de la fase 5 documentada.
- Prohibido pedir o almacenar claves privadas, frases semilla o permisos de gasto ilimitados.

## Criterios de cierre

La fase 6 no se considera terminada hasta disponer de conexión voluntaria funcional, lectura de saldo verificada, pruebas de seguridad y usabilidad, y una utilidad definida y aprobada. El diseño por sí solo **no** habilita minería ni pagos reales.

## Localización documental del contrato — 13-11-2026

- Dirección **comunicada en la auditoría existente**, no corroborada mediante una lectura directa de la blockchain: `0xa1128B1F4CB8394c179eb2558608a7302972EcBF`.
- BaseScan: https://basescan.org/address/0xa1128B1F4CB8394c179eb2558608a7302972EcBF#code
- Blockscout: https://base.blockscout.com/address/0xa1128B1F4CB8394c179eb2558608a7302972EcBF
- La consulta de BaseScan no estuvo disponible desde la herramienta de navegación en esta sesión. No hay evidencia suficiente para afirmar que los metadatos del contrato o su código desplegado coinciden con el repositorio.
- **Decisión:** mantener desactivadas la lectura de saldos NVRA en el juego y las transacciones hasta verificar el contrato. La conexión opcional de billetera puede prepararse independientemente, sin solicitar firmas ni permisos.

## Verificador de identidad RPC de solo lectura — 13-11-2026

- Implementado `contracts/scripts/verify-nvra-base-readonly.cjs` (commit `d45a2246`): consulta por JSON-RPC HTTPS `eth_chainId`, `eth_getCode` y llamadas `eth_call` ERC-20 para `name`, `symbol`, `decimals`, `totalSupply`; exige Base 8453, bytecode no vacío, nombre `NovaRise Utility Token`, símbolo `NVRA`, 18 decimales y 1.000.000 unidades. No firma ni envía transacciones.
- Creado workflow manual `.github/workflows/nvra-token-identity-readonly.yml` (commit `297cc0b4`) para ejecutarlo en GitHub Actions con el RPC público `https://mainnet.base.org`.
- **Ejecución no realizada todavía:** la herramienta de GitHub disponible no expone inicio de `workflow_dispatch` y el entorno local no puede resolver los hosts RPC. No afirmar que el contrato está verificado. Para lanzarlo: GitHub → Actions → `NVRA token identity on Base (read only)` → Run workflow → main. Revisar resultado y logs. Un resultado correcto valida solo identidad básica, no auditoría de seguridad, proxy ni titularidad.

## Verificación on-chain confirmada — 13-11-2026

- GitHub Actions `NVRA token identity on Base (read only)` ejecución **43406947102**, job `verify-token`, **completed/success**. Logs consultados directamente.
- RPC Base Mainnet: chain ID **8453**, dirección `0xa1128B1F4CB8394c179eb2558608a7302972EcBF`, bytecode desplegado **1.814 bytes**.
- Llamadas ERC-20: `name()` = `NovaRise Utility Token`; `symbol()` = `NVRA`; `decimals()` = `18`; `totalSupply()` = `1000000000000000000000000` unidades mínimas (**1.000.000 NVRA**). Los cuatro checks devolvieron `true`.
- Evidencia: https://github.com/jonelpd/NovaRise/actions/runs/43406947102
- **Alcance limitado:** identidad y suministro verificados por RPC; NO se ha auditado el código desplegado, permisos, titularidad, posibilidad de upgrade, custodia o liquidez. No autoriza transacciones, pagos ni minería de NVRA.
- **Próxima implementación permitida:** lectura de saldo ERC-20 mediante `balanceOf` sin firma y conexión voluntaria de cuenta; mantener gastos y recompensas deshabilitados.
