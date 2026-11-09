# Plan Maestro de Desarrollo — Reinos de Leyenda

Estado: APROBADO · Fecha de referencia: 2026-11-08
Repositorio: jonelpd/NovaRise · Juego: juego/index.html · Demo: juego/combate-demo.html

## Objetivo
Desarrollar un juego de estrategia por turnos estable, profundo y atractivo, inspirado en la experiencia de exploración, gestión de castillos y combate táctico de Heroes of Might and Magic III, con identidad y recursos propios. La futura integración de NVRA no debe comprometer el equilibrio, la seguridad ni el acceso gratuito.

## Fase 1 — Auditoría de jugabilidad y estabilidad (CORRECCIONES FINALIZADAS; ACEPTACIÓN PENDIENTE)
Prioridad: movimientos, turnos, combates, economía, IA, castillos y persistencia.
- [x] Protección frente a desplazamientos durante turno rival.
- [x] Protección del reinicio de campaña durante acciones asíncronas.
- [x] Pruebas de regresión existentes: 108/108 correctas en GitHub Actions run 42526963572.
- [ ] Validar campaña completa: inicio, exploración, tesoros, minas, reclutamiento, asedios, conquistas, derrota/victoria y regreso al mapa.
- [ ] Validar economía y cambios de turno, incluidos errores y acciones interrumpidas.
- [ ] Validar cierre/reapertura con progreso idéntico y recuperación de copias locales.
- [ ] Validar nube con dos sesiones reales, conflictos de revisión, desconexión y reconexión.
- [ ] Verificar navegadores reales en escritorio y móvil; documentar incidencias.
**Criterio de salida:** regresiones verdes más matriz E2E funcional sin defectos críticos o graves de pérdida de progreso.

## Fase 2 — Profundizar en la jugabilidad (INICIADA: PLANIFICACIÓN)
- Habilidades de héroes y progresión.
- Rasgos diferenciados de criaturas y equilibrio de ejércitos.
- Construcciones y mejoras de castillos.
- Recompensas y decisiones de exploración basadas en elementos reales del mapa.
- IA rival más estratégica y ajustable.
**Criterio de salida:** mecánicas completas, equilibradas y probadas sin regresiones.

## Fase 3 — Experiencia visual (PENDIENTE)
- Mejoras de escenarios de combate y castillos.
- Animaciones y estados visuales de unidades.
- Información legible y coherente de héroes, criaturas y recursos.
- Ventanas medievales superpuestas, accesibles y adaptadas a móvil.
**Criterio de salida:** revisión visual de escritorio/móvil y pruebas funcionales de todos los controles.

## Fase 4 — Integración de NVRA (PENDIENTE)
- Definir utilidades verificables dentro del juego.
- Diseñar economía sostenible y límites de emisión/recompensa.
- Prevenir automatización abusiva, duplicación, fraude y ventajas desproporcionadas.
- Auditar seguridad de cuentas, backend y contratos antes de habilitar valor real.
- Mantener experiencia de juego gratuita y distinguir recursos ficticios de NVRA real.
**Criterio de salida:** revisión económica, legal y de seguridad, más pruebas de abuso y despliegue controlado.

## Reglas de ejecución
1. Respetar el orden de las cuatro fases; no dar una fase por cerrada sin sus criterios de salida.
2. Corregir primero los fallos críticos de la fase activa y evitar cambios innecesarios.
3. Acompañar los cambios de código con pruebas de regresión y revisar GitHub Actions.
4. Mantener sincronizadas las correcciones entre juego principal y demo cuando corresponda.
5. Actualizar este Plan Maestro y docs/auditoria-juego-2026-11-03.md con hallazgos, correcciones, pruebas y pendientes.
6. No confundir pruebas Node aisladas con validación integral en navegador.
7. No activar recompensas NVRA reales antes de completar las salvaguardas de las fases anteriores.

## Avance de la fase 1 — 2026-11-09
- Añadida prueba de continuidad de campaña en ambas vistas: guardado, recarga, progresión posterior y recuperación de copia previa ante corrupción de datos (`tests/p0-campaign-continuity.test.cjs`).
- Esta prueba usa el almacenamiento simulado y funciones reales aisladas; no constituye validación E2E en navegador.
- Pendiente confirmar el resultado del nuevo flujo de GitHub Actions antes de marcar la prueba como superada.

- Añadidas pruebas estáticas de seguridad ante errores de red, conflicto de revisión y restauración remota (`tests/p0-cloud-interruption-safety.test.cjs`).
- Pendiente ejecutar CI y pruebas reales de dos navegadores y desconexión durante RPC.

- Corregida la recuperación local para preservar los bytes del guardado corrupto antes de restaurar la copia anterior, en `juego/index.html` y `juego/combate-demo.html`.
- Ampliada la regresión de recuperación para verificar que el guardado defectuoso se conserva (`tests/p0-save-backup-recovery.test.cjs`).
- Sin confirmación todavía de CI de los cambios recientes; no cerrar fase 1.

- Añadidas cuatro comprobaciones de fallos de escritura local (cuota de almacenamiento y copia de respaldo), dos por cada vista: `tests/p0-save-write-failure.test.cjs`.
- Pendiente verificar las nuevas pruebas en CI; no se han simulado navegadores reales ni dos cuentas autenticadas.

- Corregido el aislamiento del validador en `tests/p0-campaign-continuity.test.cjs`: se detiene antes de inicializar la interfaz y evita un fallo falso en Node.
- Intento de ejecutar `node --test tests/p0-*.test.cjs` bloqueado porque el entorno no resuelve `github.com` al clonar. Sin resultados nuevos de CI confirmados.

- Corregido el guardado local en ambas vistas: si falla escribir el respaldo de una partida previa válida, se cancela el guardado nuevo sin reemplazar el progreso anterior.
- Ampliadas las pruebas de cuota y guardado anterior inválido en `tests/p0-save-write-failure.test.cjs` (seis escenarios, aún sin ejecución CI confirmada).

- Corregido el reinicio de campaña en ambas vistas: limpia el guardado principal y su copia de respaldo obsoleta solo tras confirmación; si falla la limpieza, no inicia una nueva campaña.
- Añadidas cuatro pruebas de aislamiento del respaldo en reinicio y cancelación: `tests/p0-reset-backup-isolation.test.cjs`.
- Pendiente ejecución CI y pruebas en navegador.

- Endurecido el reinicio: si falla la eliminación del guardado principal, se intenta restaurar el respaldo previo y se cancela la nueva campaña; advertencia explícita si también falla la restauración.
- Ampliado `tests/p0-reset-backup-isolation.test.cjs` con dos escenarios de fallo de eliminación (uno por vista), sin CI verificado.

## Transición de fase 1 a fase 2 — 2026-11-09
- Finalizada por ahora la implementación de correcciones identificadas de fase 1. No equivale a certificación de calidad ni a cumplir los criterios de salida: siguen pendientes CI actualizado y pruebas E2E de campaña, navegador móvil y dos sesiones reales.
- Riesgo abierto: la red del entorno de ejecución no resuelve github.com para clonar y ejecutar toda la batería; el último CI confirmado corresponde a una revisión anterior de 108 pruebas.
- Se autoriza iniciar trabajo preparatorio y desarrollo incremental de fase 2 sin declarar aprobada la aceptación de fase 1. Cualquier regresión crítica vuelve a prioridad inmediata.

## Plan operativo de fase 2
1. **Habilidades y progresión:** inventariar experiencia, nivel y héroes actuales; diseñar habilidades pasivas y activas con costes y límites claros, sin modificar partidas existentes sin migración.
2. **Criaturas:** catalogar estadísticas reales y reglas de combate; diferenciar roles (defensa, distancia, movilidad y unidades avanzadas), evitando ventajas irreversibles.
3. **Castillos:** auditar edificios ya presentes y añadir mejoras graduales vinculadas a recursos reales del juego.
4. **Exploración:** aprovechar exclusivamente cofres, minas, estructuras y objetos que existen en el mapa; decisiones mediante ventanas superpuestas.
5. **IA:** ampliar objetivos y prioridades, conservando determinismo de turnos y límites de tiempo.
6. **Calidad:** para cada cambio, pruebas de reglas, compatibilidad de guardados y regresión de combates; no activar recompensas NVRA reales.

## Próxima tarea
Fase 2: inventario técnico de habilidades, criaturas, construcciones y economía actual; escoger primera mecánica pequeña e implementarla con pruebas. En paralelo, verificar CI y matriz E2E pendientes de fase 1 sin usar partidas reales de usuarios.
