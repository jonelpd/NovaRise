# Fase 6 — Integración segura de NVRA en Reinos de Leyenda

**Estado:** diseño técnico iniciado · sin transacciones reales habilitadas (13-11-2026).

## Estado existente verificado

- `juego/index.html` ya incorpora un **Centro NVRA** accesible desde el encabezado. Presenta minas, cristales y méritos **informativos** de la partida, sin saldo en cadena, monedero conectado ni recompensas reales.
- Las minas generan recursos internos del juego; los méritos de partidas guardadas o importadas **no constituyen prueba verificable de trabajo** y no se convertirán automáticamente en tokens.
- La red prevista es **Base mainnet** (chain ID 8453). El suministro total previsto para NVRA es **1.000.000**. La dirección del contrato, sus decimales, la propiedad/roles y el estado de seguridad deben verificarse con documentación y explorador de bloques antes de introducirlos en código. No se presupone una dirección.
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
