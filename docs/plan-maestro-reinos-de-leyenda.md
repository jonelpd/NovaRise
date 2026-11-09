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

## Inventario inicial de fase 2 — Progresión de héroes
- Ya existe `heroSpecialization()` con tres clases: `warrior`, `mage`, `guardian`, y valores predeterminados para campañas antiguas.
- Ya existe `heroLevel()` (nivel 1 + 1 por cada 100 puntos de experiencia), `heroStats()`, `awardHeroExperience()` y `heroSkillMilestones()`.
- El árbol actual desbloquea dos hitos por especialización en niveles 2 y 4; los atributos y el maná progresan con el nivel. Ya existen hechizos con coste de maná y diferencias por especialización.
- No introducir un sistema paralelo de nivel o habilidades: ampliar el existente, comprobar sus límites y mantener compatibilidad con partidas guardadas.
- Próxima implementación de fase 2: revisar todos los puntos que otorgan experiencia, límites de nivel, interfaz de progresión y pruebas específicas antes de introducir nuevas habilidades.

## Fase 2 — Primera implementación de progresión (2026-11-09)
- `awardHeroExperience` en juego y demo rechaza recompensas no enteras, negativas, cero y no finitas.
- El total de experiencia se limita a 100.000.000, máximo ya exigido por `validGame`, evitando que una recompensa invalide la campaña persistida.
- Añadidas dos pruebas de regresión de nivel, valores inválidos y límite máximo: `tests/p0-hero-experience-bounds.test.cjs`.
- La batería de Node y los flujos E2E siguen pendientes de ejecución confirmada; no se declara prueba superada sin resultado.

## Fase 2 — Habilidades de nivel 6 (2026-11-09)
- Tercer hito automático por especialización en ambas vistas: Guerrero `Veterano de campaña` (+1 daño físico), Mago `Canalización superior` (+2 daño Rayo arcano), Guardián `Defensa experta` (+1 daño físico).
- Mantiene hitos anteriores de niveles 2 y 4 y usa experiencia existente; no requiere migración de guardados.
- Añadidas cuatro pruebas en `tests/p0-hero-level-six-skills.test.cjs` (desbloqueo y presencia de efectos en combate). Ejecución de CI todavía sin confirmar.

## Fase 2 — Roles de criaturas (2026-11-09)
- Inventariadas las reglas existentes: soldados (alcance 1, movimiento 1), arqueros (alcance 3, sin disparo adyacente, movimiento 1), grifos (movimiento 3, contraataque), dragones (alcance 2, movimiento 2, daño elevado).
- Añadida información táctica específica en el título accesible de cada casilla aliada del escenario de combate en ambas vistas, sin cambiar las reglas ni el formato de guardado.
- Añadidas dos pruebas estáticas de coherencia de descripciones y reglas: `tests/p0-creature-role-tooltips.test.cjs`. CI pendiente de confirmar.

## Fase 2 — Equidad táctica de arqueros (2026-11-09)
- Corregido `duelEnemyTurn` en ambas vistas: los arqueros enemigos ya no disparan desde distancia adyacente (1 casilla). Necesitan 2–3 casillas y línea de tiro despejada, como los arqueros aliados.
- Mantiene la búsqueda de una posición válida por IA; no cambia el formato de guardado.
- Incorporadas dos pruebas estáticas de las condiciones de alcance y obstáculos: `tests/p0-enemy-archer-min-range.test.cjs`. Falta validación de ejecución y combate real en navegador.

## Fase 2 — Selección de blancos de arqueros IA (2026-11-09)
- En combates contra héroes, los arqueros enemigos priorizan un blanco con distancia válida (2–3) y línea despejada frente a un objetivo más cercano pero no atacable.
- Sin blanco válido, conservan la búsqueda de posición anterior. Aplicado a `juego/index.html` y `juego/combate-demo.html` sin migración de guardado.
- Incorporadas dos pruebas de regresión estáticas: `tests/p0-enemy-archer-target-priority.test.cjs`. Pendiente ejecución real de CI y E2E.

## Fase 2 — Consumo de defensa en duelos (2026-11-09)
- En `duelEnemyTurn`, una unidad protegida absorbe un ataque enemigo y consume esa protección inmediatamente. Antes podía bloquear varios ataques sucesivos durante la misma ronda.
- Aplicado en juego principal y demo; sin cambios de formato de guardado.
- Dos pruebas estáticas añadidas: `tests/p0-duel-guard-consumption.test.cjs`. Falta ejecutar CI y validar en navegador con varios atacantes.

## Fase 2 — Defensa y contraataques coherentes (2026-11-09)
- Incorporada función compartida `consumeBattleGuard(type)` en ambas vistas: cada protección se consume una única vez.
- Aplicada a ataques de unidades enemigas ordinarias, ataques en duelos de héroes y contraataques recibidos por tropas aliadas.
- Actualizadas cuatro pruebas de `tests/p0-duel-guard-consumption.test.cjs`, incluyendo una ejecución aislada de la función con `node:vm`.
- Pendiente confirmar ejecución de Node/CI y validar casos completos en navegador.

## Fase 2 — IA de selección de objetivos, referencia Heroes III (2026-11-09)
- En duelos entre ejércitos, la IA enemiga prefiere blancos sin defensa activa cuando dispone de varios objetivos inmediatamente atacables; conserva los requisitos de distancia y línea de tiro de arqueros.
- Si no existe blanco atacable, mantiene la búsqueda de aproximación; el criterio de protección es secundario al hecho de poder atacar.
- Aplicado en ambas vistas y añadidas dos pruebas estáticas `tests/p0-enemy-unguarded-targets.test.cjs`.
- Referencia de diseño: decisiones tácticas comprensibles de Heroes of Might and Magic III, sin copiar sus recursos ni afirmar equivalencia exacta de reglas. Pendiente ejecución de pruebas y validación E2E.

## Fase 2 — Movimiento de criaturas voladoras (2026-11-09)
- Corregida la generación de destinos alcanzables: grifos y dragones pueden atravesar obstáculos, pero no finalizar movimiento en casillas ocupadas por ellos. Soldados y arqueros siguen bloqueados por obstáculos.
- Cambio sincronizado en juego y demo, sin alterar el guardado.
- Dos pruebas de comportamiento con `node:vm` en `tests/p0-flying-unit-landing.test.cjs`: atravesar obstáculo y prohibir aterrizaje sobre él.
- Referencia conceptual: vuelo táctico de Heroes of Might and Magic III. Pendiente ejecución confirmada en CI y validación en navegador.

## Fase 2 — Órdenes de defensa sin duplicados (2026-11-09)
- Evitado que la orden Defender añada una segunda entrada de protección si la unidad ya estaba protegida por la especialización del héroe o por otra orden.
- La protección continúa consumiéndose una sola vez mediante `consumeBattleGuard`; cambio en ambas vistas sin modificar partidas guardadas.
- Añadidas dos comprobaciones estáticas `tests/p0-guard-no-duplicates.test.cjs`. Ejecución de CI y pruebas de navegador pendientes.

## Fase 2 — Contraataques por pila enemiga (2026-11-09)
- En duelos entre ejércitos, sustituido el límite global de contraataque por un registro `counterUsedByEnemy` de las pilas enemigas que ya respondieron en la ronda. Cada pila superviviente puede contraatacar una vez si recibe un ataque cuerpo a cuerpo.
- En combates con un único enemigo se conserva `counterUsed`; el registro se inicializa al abrir combate y se reinicia al empezar una ronda nueva.
- Aplicado en juego y demo, sin modificar el formato persistente de campaña. Añadidas dos pruebas estáticas `tests/p0-per-enemy-retaliation.test.cjs`.
- Pendiente confirmar CI y probar manualmente duelos con varias pilas enemigas.

## Fase 2 — Iniciativa por velocidad (2026-11-09)
- `battleNextUnit()` consulta ahora `battleInitiativeOrder()`, calculado ordenando las criaturas por `battleSpeed()` descendente; empates resueltos por orden base estable.
- Velocidades actuales: grifos 3, dragones 2, arqueros 1, soldados 1. El orden efectivo actual no cambia, pero la iniciativa queda ligada a la velocidad y preparada para futuras variaciones.
- Aplicado a ambas vistas, sin modificar persistencia. Añadidas dos pruebas de comportamiento con `node:vm` en `tests/p0-speed-based-initiative.test.cjs`.
- Pendiente confirmar CI y validación real en navegador.

## Fase 2 — Visualización de turnos de iniciativa (2026-11-09)
- Barra de iniciativa actualizada en ambas vistas: orden calculado por velocidad, etiquetas «Ahora» y «Después», marca de acción completada y velocidades en la información contextual.
- Se reutiliza la barra existente sin añadir paneles redundantes ni modificar el formato de guardado.
- Dos pruebas estáticas añadidas en `tests/p0-initiative-turn-indicators.test.cjs`; pendiente confirmar CI y validación visual en navegador.

## Fase 2 — Coherencia de barra y selección (2026-11-09)
- Corregidas las etiquetas de iniciativa: el sistema permite elegir libremente cualquier pila no actuada, por lo que «Ahora/Después» era engañoso. La barra muestra «Seleccionada» y «Disponible», manteniendo marcas de unidades ya actuadas y orden visual por velocidad.
- Actualizada la regresión `tests/p0-initiative-turn-indicators.test.cjs` en ambas vistas.
- Pendiente ejecución confirmada de CI y comprobación en navegador.

## Fase 2 — Coherencia de controles de combate (2026-11-09)
- Mensaje posterior a una acción indica que la unidad propuesta está disponible, sin afirmar turno obligatorio.
- La barra de iniciativa distingue guardianes de ejércitos enemigos en duelos.
- Los botones de selección de criaturas quedan deshabilitados durante `battle.moving` para impedir entradas contradictorias.
- Sin cambios en guardado; dos comprobaciones estáticas añadidas en `tests/p0-battle-ui-turn-consistency.test.cjs`.
- Pendiente ejecutar pruebas automáticas y validar interacciones reales en navegador.

## Auditoría de combates — Primera corrección (2026-11-09)
- Inspeccionadas las rutas de `battleFinishAction`, `enemyAdvance`, `duelEnemyTurn`, `hit`, `hitResolveVictory` y `loseBattle` en el código principal.
- Hallazgo corregido: el guardián podía preferir caminar hacia un objetivo lejano de mayor prioridad aun teniendo un blanco adyacente. La ordenación de opciones favorece ahora siempre un ataque inmediato; entre blancos atacables conserva su valoración táctica.
- Sin cambios de guardado, corregido en juego y demo. Añadidas dos pruebas funcionales del comparador de decisiones en `tests/p0-guardian-immediate-attack.test.cjs`.
- Auditoría de extremo a extremo NO cerrada: faltan ejecución de suite automatizada, pruebas de navegador de victorias/derrotas, asedios, duelos y continuidad de guardado.

## Auditoría de combates — Resolución de ejército vacío (2026-11-09)
- Detectado un retorno anticipado de `enemyAdvance` cuando no quedan tropas aliadas; podía impedir que `battleFinishAction` ejecutara su comprobación de derrota.
- Corregido: `enemyAdvance` invoca `onComplete` una vez antes de retornar en este caso. Cambio sincronizado en juego y demo, sin cambios de persistencia.
- Añadidas dos pruebas de comportamiento con `node:vm` en `tests/p0-empty-army-turn-resolution.test.cjs`.
- Continúan pendientes la ejecución confirmada de CI y las pruebas de campaña completas en navegador, incluidos guardados posteriores a combates.

## Auditoría de combates — Guarniciones y resultados (2026-11-09)
- Inspeccionados `finishDefensiveSiege`, `loseBattle`, `hitResolveVictory` y `persistGame`: la defensa sustituye temporalmente las tropas visibles por la guarnición, conserva las bajas de esta y restaura el ejército del héroe antes de cerrar el combate.
- Corregido doble `render()` al finalizar el asedio defensivo: `message(outcome)` ya renderiza y persiste cuando corresponde.
- Añadidas dos pruebas de comportamiento en `tests/p0-defensive-siege-army-preservation.test.cjs` para victoria defensiva, bajas de guarnición, restauración del ejército y una sola actualización de interfaz.
- Falta ejecutar pruebas y validar derrota defensiva, recompensas de conquista y continuidad real de guardado en navegador.

## Auditoría de combates — Bajas y resultados de asedios defensivos (2026-11-09)
- Revisado `finishDefensiveSiege(won)`: restaura el ejército del héroe tras usar temporalmente las tropas de guarnición; registra supervivientes de guarnición en victoria y vacía la guarnición al perder el castillo.
- Incorporadas dos pruebas ejecutables con `node:vm` en `tests/p0-defensive-siege-outcome.test.cjs`, cubriendo victoria y derrota en ambas páginas.
- No se modificó la lógica del juego en este paso: el comportamiento revisado ya estaba implementado. Pendiente confirmar ejecución de tests, duelos ofensivos, recompensas y persistencia real tras recarga del navegador.

## Auditoría de combates — Duelos entre héroes (2026-11-09)
- Revisadas `loseBattle` y `hitResolveVictory` para combates con el héroe del Reino Umbrío.
- Añadidos cuatro casos de prueba de comportamiento en `tests/p0-hero-duel-outcomes.test.cjs` (victoria y derrota en juego y demo). Comprueban bajas de tropas propias, supervivientes rivales, recompensa de oro y experiencia, y ausencia de doble recompensa al repetir resolución.
- Sin cambios de reglas ni del formato de guardado en esta etapa.
- Pendiente ejecución de pruebas, validación en navegador de ambos resultados y comprobación de persistencia real tras recarga.

## Auditoría de continuidad de guardado tras combate (2026-11-09)
- Revisado el flujo `hitResolveVictory` → `render` → `persistGame`: el guardado se solicita al cerrar el combate y se impide mientras `battle` está activo.
- Añadidas pruebas de integración simulada en `tests/p0-combat-save-continuity.test.cjs` para serializar una victoria en duelo con bajas, oro, experiencia y estado del rival; y para impedir sobrescrituras durante un combate activo.
- Sin cambios en la estructura de partidas. Pendientes ejecución de la suite, recarga real del navegador, sincronización en nube y comprobación de conquista de castillos.

## Auditoría de recarga de castillos conquistados (2026-11-09)
- Añadida prueba `tests/p0-castle-save-reload.test.cjs`: simula la victoria en un castillo, guardado local y posterior `load`, verificando propiedad, supervivientes, oro y experiencia.
- La prueba utiliza las funciones reales de resolución, validación, persistencia y carga aisladas con `node:vm`; no sustituye una comprobación en navegador real.
- Sin cambios en reglas ni esquema de partidas. Pendiente ejecutar las pruebas de Node y verificar publicación, recarga del navegador y sincronización en nube.

## Auditoría de sincronización nube — Instantáneas obsoletas (2026-11-09)
- Hallazgo: `autoCloudSave` tomaba una instantánea antes de consultar asincrónicamente la revisión remota y podía enviar una instantánea antigua si la partida cambiaba durante la espera.
- Corrección en `juego/index.html`: tras consultar la revisión y antes de la RPC se comprueba `JSON.stringify(s)===snapshotText`; en caso contrario se marca `autoCloudPending` y se programa una nueva sincronización al salir de `finally`.
- Añadida prueba de regresión estructural `tests/p0-cloud-stale-snapshot.test.cjs`.
- No se ha confirmado ejecución de la suite: intento de clonar GitHub desde el entorno local falló por falta de resolución DNS. Pendiente validación de CI y sincronización real entre dispositivos.
