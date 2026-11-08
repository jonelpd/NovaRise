# Integración progresiva de NVRA en Reinos de Leyenda
Fecha: 2026-11-08

## Objetivo
Introducir utilidad verificable para NVRA sin confundir los recursos del juego con activos económicos. El proyecto utiliza Base como red prevista para NVRA y conserva el suministro planificado de un millón de tokens; esta integración no cambia el contrato ni la distribución.

## Etapa 1 — Implementada en código
- Indicador NVRA en la barra superior del juego principal y la demostración.
- Información dinámica: minas controladas y cristales del juego.
- Aviso visible de que la integración está en preparación y no hay recompensas reales.
- No hay conexión de wallet, firma, transferencia ni emisión de NVRA.
- Commits: 73eca43 (principal), 06ce486 (demo).

## Etapa 2 — Antes de cualquier reparto real
- Confirmar dirección y código del contrato desplegado en Base, propietario, permisos y suministro.
- Verificar auditoría del contrato, reservas, vesting, liquidez y asignación del fundador.
- Diseñar una economía con usos reales del token y mecanismos contra abuso, evitando prometer rentabilidad o liquidez garantizada.
- Definir un servidor de juego confiable: el estado local, importaciones y partidas del navegador no pueden determinar pagos de tokens.
- Diseñar límites por cuenta, antifraude, controles de repetición y registro auditable de méritos.
- Evaluar cumplimiento legal, fiscal y de protección de datos antes de habilitar incentivos con valor económico.

## Etapa 3 — Integración controlada
- Mostrar balances reales solo mediante lectura verificable de blockchain y con dirección de contrato confirmada.
- Conexión de monedero opcional y claramente separada de la cuenta de juego.
- Recompensas reales únicamente tras validación del servidor y autorización expresa de transacciones, nunca por confiar en JSON local.
- Pruebas de seguridad, accesibilidad, móviles y recuperación de errores.

## Reglas de diseño
- Oro, cristales, experiencia y progreso del reino son recursos de juego, no NVRA.
- No ofrecer conversión fija entre cristales y NVRA.
- No anunciar minería real ni ganancias automáticas hasta que el sistema exista y esté auditado.
- Mantener la experiencia estratégica accesible sin wallet ni compra de tokens.
