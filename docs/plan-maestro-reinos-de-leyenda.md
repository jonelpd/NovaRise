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

## Auditoría GitHub Actions y conflictos de nube (2026-11-09)
- Confirmada configuración de `.github/workflows/game-regression.yml`: ejecuta `node --test tests/p0-*.test.cjs` con Node 22 en cambios a `juego/**` o `tests/**`.
- Consulta de ejecuciones asociadas al commit `9ebc9e69` devolvió lista vacía; la consulta de estados combinados también. No se ha podido confirmar CI verde. Acceso directo desde contenedor a github.com falla por DNS.
- Hallazgo corregido: el guardado manual podía subir una instantánea desactualizada si el estado local cambiaba durante la comprobación asíncrona de revisión remota. Se vuelve a comparar `s` con `latestGame` antes de llamar a la RPC.
- Añadidas pruebas estructurales en `tests/p0-cloud-manual-save-conflicts.test.cjs` para guardado manual y comprobaciones de conflicto en recuperación de nube.
- Pendiente ejecutar tests, validar navegador y ensayar conflictos reales entre dos dispositivos.

## Auditoría de integridad de guarniciones (2026-11-09)
- Hallazgo: `siteGarrison` aceptaba `garrisons` como array y `stock` como dato no estructurado; la normalización podía fallar o dejar guarniciones inutilizables al recuperar una partida dañada.
- Corregido en `juego/index.html` y `juego/combate-demo.html`: se reconstruyen estructuras de guarnición o inventario no válidas a partir del perfil del castillo; no se alteran guarniciones correctamente formadas.
- Prueba añadida: `tests/p0-corrupt-garrison-recovery.test.cjs`, cubre ambas páginas y los dos formatos dañados.
- Sigue pendiente confirmar ejecución de GitHub Actions y validar manualmente la recarga en navegador real.

## Fase 1 — Validación adicional de defensores (2026-11-09)
- Corregido en ambas páginas `siteGarrison`: si `g.defenders` es un array, se sustituye por un objeto de contadores por criatura. Antes los arrays pasaban la comprobación de tipo objeto y podían conservar estructura inválida.
- Ampliada la prueba `tests/p0-corrupt-garrison-recovery.test.cjs` para exigir explícitamente que los defensores reconstruidos no sean un array.
- Se intentó ejecutar la suite mediante `git clone` y `node --test`, pero el contenedor no resuelve `github.com` (DNS). No hay ejecución local confirmada; no se cierra la fase 1.

## Fase 1 — Integridad de recuperación de campañas (2026-11-09)
- Revisión de `tests/p0-save-backup-recovery.test.cjs`: ya cubría recuperación desde backup y preservación de bytes dañados en ambas páginas.
- Nueva suite `tests/p0-save-recovery-integrity.test.cjs` para comprobar datos completos: tropas, oro, experiencia y castillo conquistado tras recarga, recuperación de backup y preservación del guardado irrecuperable.
- Las nuevas pruebas son automatizadas pero todavía no hay ejecución verificada. Pendiente comprobar resultados de GitHub Actions y navegador real antes de cerrar fase 1.

## Fase 1 — Control de sintaxis de páginas del juego (2026-11-09)
- Incorporada `tests/p0-browser-script-syntax.test.cjs`: inspecciona los scripts inline de `juego/index.html` y `juego/combate-demo.html`, verifica scripts clásicos con `vm.Script` y módulos con `node --check --input-type=module`.
- Se integra automáticamente en `.github/workflows/game-regression.yml` mediante `node --test tests/p0-*.test.cjs`.
- No equivale a una prueba funcional real en navegador. Los endpoints disponibles de GitHub no permiten confirmar una ejecución de push a main: la consulta de workflow runs está limitada a ejecuciones asociadas a PR; la consulta de estados no devolvió resultados. Pendiente verificación de la ejecución desde la interfaz de GitHub Actions.

## Fase 1 — Diagnóstico real de GitHub Actions #210 (2026-11-09)
- Registro completo recuperado del job `129179865070` de la ejecución `42623079418`: 185 pruebas, 173 superadas y 12 fallidas.
- Fallos #57 y #60: `p0-combat.test.cjs` esperaba la regla obsoleta de ataque adyacente para arqueros enemigos; actualizado para verificar alcance mínimo y reposicionamiento.
- Fallos #77 y #78: `p0-enemy-archer-target-priority.test.cjs` esperaba el antiguo selector `nearest`; actualizado para verificar `available`, `inReach`, `choices` y selección de objetivo.
- Fallos #156-159: `p0-siege-full-cycle.test.cjs` simulaba `message()` sin el `render()` que ejecuta en producción; corregido el doble de prueba para reflejar persistencia tras el asedio.
- Fallos #160-161: `p0-siege-history-removed.test.cjs` esperaba `render()` explícito redundante después de `message()`; actualizado para comprobar el cierre y retorno sin historial.
- Fallos #182 y #185: `p0-turn-reset-race.test.cjs` exigía reinicio inmediato tras eliminar el guardado; ahora comprueba eliminación de guardado y backup, manejo de errores y posterior inicio.
- Cambios aplicados en los cinco archivos de tests; **pendiente confirmar resultado de una nueva ejecución** antes de cerrar fase 1. Ninguna prueba fue omitida intencionalmente.

## Fase 1 — Auditoría de código: importación concurrente (2026-11-09)
- Hallazgo confirmado en ambas páginas: el manejador de importación comprobaba `rivalBusy` y `battle` tras el diálogo asíncrono, pero no si la campaña, su contenido o la clave de almacenamiento habían cambiado durante la confirmación. Esto podía sobrescribir progreso reciente.
- Corregido con captura y verificación de identidad, instantánea JSON y `STORE` antes de asignar `s=v.game`.
- Añadida prueba `tests/p0-import-confirmation-race.test.cjs` para asegurar que la comprobación antecede a la sustitución de campaña en ambas páginas.
- Auditoría profunda aún en curso: pendientes validación en navegador, sincronización nube y ejecución de suite actualizada.

## Fase 1 — GitHub Actions #220 (2026-11-09)
- Registro real consultado: ejecución `42713142213`, job `129487656161`; dos fallos en `tests/p0-rival-save-lock.test.cjs`, correspondientes a `index.html` y `combate-demo.html`.
- Causa: aserción antigua exigía que la comprobación `if(rivalBusy||battle)` fuese seguida inmediatamente por `s=v.game`; la protección nueva contra importación concurrente añade un guard de instantánea entre ambos.
- Corregida la prueba para exigir en orden bloqueo de turno rival, comprobación de instantánea y asignación de partida. Se mantienen ambas protecciones del juego.
- Pendiente verificar ejecución posterior a la corrección; no declarar verde sin resultados.

## Fase 1 — Bloqueo de operaciones de castillo (2026-11-09)
- Hallazgo: `recruitFromCastle` y `manageCastleGarrison` comprobaban campaña y propiedad del castillo tras los diálogos asíncronos, pero no `rivalBusy` ni `battle`. Podían permitir operaciones de tropas durante un turno rival o un combate activo.
- Corregido en `juego/index.html` y `juego/combate-demo.html` mediante bloqueo adicional antes de aplicar cambios.
- Añadida prueba `tests/p0-castle-menu-turn-lock.test.cjs` para ambas operaciones y páginas.
- Pendiente ejecución confirmada de GitHub Actions y validación manual en navegador; Fase 1 abierta.

## Cierre técnico de Fase 1 — revisión de evidencias (2026-11-10)

**Estado: pruebas automatizadas superadas; aceptación E2E todavía pendiente.** No se declara la Fase 1 cerrada hasta satisfacer su criterio de salida.

### Evidencia CI verificada
- GitHub Actions «Game regression tests» [42794290431](https://github.com/jonelpd/NovaRise/actions/runs/42794290431), commit `c6c4e794a26916ca65936ed0bd3465ba8460ab27`: **191 pruebas superadas, 0 fallidas**; el job `game-regression` finalizó correctamente el 2026-11-10. Incluye pruebas Node, simuladas y estáticas; no sustituye una sesión real de navegador.
- GitHub Pages y su despliegue concluyeron correctamente para el mismo commit (ejecuciones [42794290228](https://github.com/jonelpd/NovaRise/actions/runs/42794290228) y [42794288258](https://github.com/jonelpd/NovaRise/actions/runs/42794288258)).
- Flujo general «NovaRise - pruebas estáticas» [42794290132](https://github.com/jonelpd/NovaRise/actions/runs/42794290132) **fallido**, por referencias a `assets/Logotipo%20circular%20N%20verde%20ne%C3%B3n.png` no resueltas en `index.html` y `en.html`. Incidencia del sitio web general; no demuestra fallo del motor del juego. Requiere corrección separada y nueva verificación.
- La última modificación del commit comprobado ajusta únicamente la velocidad visual de desplazamiento en `juego/combate-demo.html`; no consta todavía aceptación manual de esa velocidad.

### Matriz de aceptación E2E (ningún caso marcado como superado sin evidencia)
| Caso | Procedimiento y resultado esperado | Estado |
| --- | --- | --- |
| E2E-01 Campaña completa | Nueva campaña → explorar → cofres/minas → reclutar → combatir → asediar/conquistar → victoria/derrota; interfaz y recursos coherentes | PENDIENTE: navegador real |
| E2E-02 Economía y turnos | Cambiar turnos, comprobar ingresos/costes, impedir acciones durante turno rival, cancelar diálogos sin mutar recursos | PENDIENTE: navegador real |
| E2E-03 Persistencia local | Guardar después de combate/conquista, recargar y cerrar/reabrir; comparar día, oro, héroes, tropas, minas, castillos y estado del rival | PENDIENTE: navegador real |
| E2E-04 Respaldo y corrupción | Con partida de prueba, corromper copia principal, recuperar respaldo y conservar bytes corruptos; probar fallo de cuota/escritura | PENDIENTE: navegador real |
| E2E-05 Nube y conflictos | Dos sesiones autenticadas de prueba; partidas divergentes, guardar/recuperar, desconectar durante RPC, reconectar sin sobrescribir progreso reciente | PENDIENTE: dos sesiones reales |
| E2E-06 Escritorio y móvil | Probar mapa, panel lateral, consola inferior, diálogos, escenario de combate, selección, animación y accesibilidad en navegadores reales | PENDIENTE: dispositivos reales |
| E2E-07 Demo y juego principal | Confirmar paridad de reglas, regreso al mapa tras victoria/derrota y velocidad reducida solo en la demostración | PENDIENTE: navegador real |

### Reglas para completar la aceptación
1. Usar **partidas y cuentas de prueba**, nunca campañas reales de usuarios; respaldar/exportar antes de probar recuperación.
2. Registrar para cada caso fecha, navegador/dispositivo, commit, pasos, resultado, evidencia y severidad de incidencias.
3. Ante un defecto crítico de pérdida de progreso, detener la aceptación, corregir con regresión y volver a ejecutar el caso afectado.
4. No marcar como E2E aprobado una comprobación Node ni un workflow verde.
5. Al terminar, actualizar este plan y `docs/auditoria-juego-2026-11-03.md` con resultados reales; solo entonces decidir cierre formal de Fase 1 y paso completo a Fase 2.

**Próxima acción prioritaria:** ejecutar E2E-01 y E2E-03 en navegador real, seguidos de E2E-05 con dos sesiones de prueba. La Fase 2 puede continuar únicamente con cambios incrementales que no bloqueen la aceptación de la Fase 1.

### Validación manual comunicada por jugador — 2026-11-10
- El jugador confirma haber probado el movimiento de las unidades en el juego y lo considera satisfactorio; no se requieren ajustes adicionales de velocidad por ahora.
- El jugador confirma haber salido del juego y vuelto a entrar, observando que los datos guardados se mantienen. **Validación manual positiva de persistencia básica en su entorno.**
- Alcance limitado: no se ha aportado comparación campo a campo de héroe, tropas, recursos, castillos y turno; tampoco prueba de corrupción/restauración de respaldo, otro dispositivo o dos sesiones en nube. No declarar E2E-03 ni E2E-05 completamente certificados.
- Próximo paso: verificar continuidad tras combate/conquista y guardado, y después recuperación de respaldo y sincronización en dos sesiones de prueba.

## Ampliación aprobada: héroes enemigos independientes por castillo (2026-11-10)

**Solicitud de diseño:** cada castillo controlado por el enemigo debe contar con un héroe propio, que tenga su turno de movimiento independiente. El objetivo es aumentar la dificultad estratégica de la campaña y preparar, sin activar aún, retos más exigentes para futuras recompensas NVRA.

**Estado:** diseño incorporado al plan; **implementación y pruebas pendientes**. No se debe confundir el héroe rival global actual con una plantilla que pueda duplicarse sin aislar estado y batallas.

### Reglas propuestas
1. Un héroe enemigo activo como máximo por castillo enemigo, incluido el castillo principal; identificarlo mediante un ID estable del castillo. Nunca generar un segundo héroe por recargar la partida.
2. Cada héroe mantiene posición, ejército, movimientos disponibles, objetivo, estado de derrota y contador de recuperación propios, guardados con la campaña.
3. Al finalizar el turno humano, los héroes enemigos activos actúan **secuencialmente**, con presupuesto finito de movimiento, rutas transitables y animación visible. Bloquear interacciones humanas durante la secuencia y garantizar desbloqueo en errores/cancelaciones.
4. IA: defender su castillo, proteger rutas, disputar minas, perseguir al jugador cuando exista ventaja militar y reconquistar fortalezas; evitar ataques suicidas. No utilizar información de niebla de guerra no descubierta por ese héroe.
5. Combates y asedios deben usar el ejército del héroe concreto; aplicar bajas y derrotas solo a su estado. No duplicar recompensas ni activar dos combates simultáneos.
6. La conquista de un castillo desactiva su héroe vinculado según el resultado del combate; el castillo recuperado por el rival puede reclutar un nuevo héroe tras un período y coste definidos, sin generar ejércitos gratis.
7. La dificultad se ajustará a una economía limitada: costes de reclutamiento, producción real y límite de movimientos. Sin ventajas ocultas de recursos para la IA.
8. Migración de partidas existentes: crear el registro de héroes enemigos solo si falta, a partir del control actual de castillos, conservando al héroe rival previo, sus tropas, conquistas y posición. Validar importación, exportación, nube y recuperación local.
9. NVRA: **sin emisión ni pago de tokens reales** por esta mecánica. Antes de cualquier recompensa real: diseño de emisión, límites por jugador/temporada, antifraude, pruebas de balance, seguridad y revisión legal.

### Orden de implementación y criterios de aceptación
- [ ] Auditar funciones actuales `rivalState`, `rivalTurn`, `rivalEncounter`, `rivalHeroDefendingCastle`, `rivalCastleHeroBattle`, conquista/asedio, `validGame`, guardado y recuperación.
- [ ] Introducir modelo de múltiples héroes con migración compatible y pruebas de guardado antiguo.
- [ ] Crear turnos secuenciales de héroes enemigos, con rutas, límite de movimientos y bloqueo robusto.
- [ ] Mostrar marcadores individuales y animaciones sin interferir con la cámara o los diálogos.
- [ ] Vincular combate, bajas, asedio, derrota, conquista y reclutamiento al héroe correcto.
- [ ] Añadir pruebas de regresión: 2+ héroes activos, uno derrotado, castillo conquistado, recarga durante transición, partida antigua, errores de ruta y ausencia de duplicación.
- [ ] Ejecutar CI completo y pruebas E2E en navegador, incluyendo guardado y reentrada.
- [ ] Ajustar dificultad mediante partidas de prueba antes de activar cualquier incentivo NVRA.

**Protección de estabilidad:** realizar la implementación en incrementos pequeños y no reemplazar de golpe el sistema rival vigente. No marcar la función como terminada hasta verificar código, regresiones y comportamiento real.

### Seguimiento de implementación — 10 de noviembre de 2026

**Regla de mantenimiento:** actualizar este plan maestro junto con cada cambio funcional posterior, indicando commit, estado de CI, alcance comprobado y trabajo pendiente. No marcar tareas completas únicamente por haber publicado código.

**Implementado hasta ahora:**
- Registro persistente de comandantes secundarios por las cinco fortalezas, condicionado al control enemigo (commits `97730ba5`, `61276781`).
- Marcadores visibles y patrullas secuenciales limitadas por turnos (commit `2694ba2c`).
- Búsqueda de minas y molinos cercanos, rutas transitables y captura condicionada a llegada (commits `42ec12ec`, `9918b38b`).
- Tesorería individual y reclutamiento limitado; recuperación de tres turnos y continuidad de los comandantes cuando cae el rival principal (commits `9918b38b`, `c489e3fc`).
- Normalización defensiva de tropas, tesorería y coordenadas de partidas anteriores; los comandantes sin tropas pasan a estado derrotado (commit `65a8390`).

**Validación:** la regresión del juego y la publicación de Pages fueron satisfactorias para `c489e3fc`. La validación de `65a8390` está pendiente de finalizar. La prueba estática general sigue fallando por referencias a un logotipo inexistente en las páginas principales; el flujo de Telegram también presenta un fallo independiente. No declarar CI global verde.

**Pendiente prioritario:** integrar batallas de cada comandante con el ejército concreto, bajas persistentes, asedios, derrota y recuperación; comprobar que las rutas y la toma de recursos funcionan en navegador; añadir pruebas específicas de guardado, recuperación, 2+ héroes y conquistas simultáneas. Los héroes secundarios todavía no participan en combates independientes. NVRA real continúa desactivado.

### Avance incremental — defensas de fortalezas (2026-11-10)

- **Código:** commit `930ca4d5`. Cuando una fortaleza rival tiene su comandante secundario cerca, el duelo defensivo usa las tropas de ese comandante, no las del rival global. El combate registra `enemyCommanderId` para atribuir correctamente las bajas si el jugador pierde y la derrota si gana.
- **Compatibilidad:** se conserva el comportamiento anterior cuando no hay comandante secundario defendiendo; no se modifica la versión del guardado ni se generan NVRA.
- **Estado de verificación:** pendiente de resultado de CI de este commit y prueba E2E manual de defensa, derrota y recarga.
- **Aún pendiente:** encuentro en campo abierto contra comandantes secundarios, asedios iniciados por ellos, gestión completa de bajas y defensa en todos los tipos de combate, pruebas automatizadas específicas para múltiples comandantes y evaluación de equilibrio.

### Avance incremental — encuentros en campo abierto (2026-11-10)

- **Código:** `9063cc5c` y corrección `c4d1bd1c`. Los comandantes secundarios de fortalezas enemigas pueden iniciar encuentros con el héroe del jugador a distancia corta, tanto al mover una casilla como durante desplazamientos automáticos.
- **Ejército independiente:** la batalla utiliza las tropas del comandante encontrado; si pierde el jugador, se conservan las bajas de ese ejército concreto; si vence el jugador, el comandante secundario queda derrotado sin destruir automáticamente su fortaleza ni al rival principal.
- **Límites:** no se han incorporado todavía ataques ofensivos iniciados por estos comandantes durante su propio turno ni asedios independientes. La detección de encuentros se hace al mover al jugador.
- **Verificación:** pruebas de regresión y E2E de este cambio pendientes de completar. No declarar terminada la fase hasta comprobar colisiones, animaciones, guardado y resultados de batalla.

### Avance incremental — persecución estratégica (2026-11-10)

- **Código:** `f51336d3`. Los comandantes secundarios detectan al héroe del jugador dentro de nueve unidades de distancia y solo consideran perseguirlo si su ejército tiene una ventaja ponderada mínima del 40 %, permaneciendo además dentro de su radio de defensa de 15 unidades respecto al castillo.
- **Comportamiento:** cuando existe una ruta transitable, la persecución tiene prioridad sobre la búsqueda de recursos; se mantiene el límite de cuatro pasos por turno y la animación. No se inicia todavía un combate automático durante el turno enemigo.
- **Validación:** pendiente de CI y comprobación E2E. Deben verificarse rutas, colisiones, guardado y equilibrio antes de considerar terminada la IA ofensiva.
- **Pendiente:** ataque táctico iniciado por el enemigo, asedios secundarios y pruebas automatizadas específicas para persecución y enfrentamientos.

### Avance incremental — combate iniciado tras el turno enemigo (2026-11-10)

- **Código:** `ee8bbcbf`. Tras completar los movimientos de los comandantes enemigos, el juego comprueba si alguno ha alcanzado al héroe jugador e inicia su duelo táctico individual. La comprobación se realiza después de liberar el bloqueo del turno y no interrumpe las animaciones. También funciona cuando el rival principal está en recuperación.
- **Seguridad:** el encuentro no se inicia si ya existe una batalla; se mantiene el ejército concreto y la atribución individual de bajas incorporados anteriormente.
- **Validación:** CI de este cambio pendiente; se requieren pruebas manuales de combate, movimiento, fin de turno, recarga y coexistencia con asedios.
- **Pendiente:** asedios ofensivos de comandantes secundarios, pruebas específicas y mejoras del equilibrio de IA. No activar recompensas NVRA.

### Avance incremental — asedios de comandantes secundarios (2026-11-10)

- **Código:** `33a32c0`. Los comandantes secundarios pueden iniciar un asedio si llegan físicamente a una fortaleza del jugador (radio 5,5). El motor de asedios acepta un identificador de comandante para utilizar sus tropas y aplicar las bajas a su ejército, no al rival principal.
- **Defensa:** las guarniciones con tropas conservan la opción de defensa manual o automática. Se transmite el comandante atacante al diálogo y a la batalla defensiva. Sin guarnición, se utiliza la resolución automática ya existente.
- **Limitaciones:** los comandantes todavía no planifican rutas de ataque específicas hacia fortalezas; solo asedian si llegan a ellas. El motor y los casos de concurrencia necesitan pruebas E2E de dos comandantes, recarga, victoria/derrota y persistencia de guarniciones.
- **Validación:** CI de este commit pendiente. No declarar la fase completada ni prometer comportamiento verificado en navegador.

### Corrección prioritaria de estabilidad — 10 de noviembre de 2026

- **Hallazgo:** la implementación inicial de asedios secundarios `33a32c0` provocó 13 fallos en las 185 pruebas de regresión, afectando especialmente a la defensa de castillos, conservación de tropas y decisiones asíncronas.
- **Acción:** commit `e3c5a751`: revertida exclusivamente la modificación de asedios secundarios en `juego/index.html`, restaurando el código de combate previo (`f9914730`). Se mantienen los encuentros en campo abierto y la persecución implementados anteriormente.
- **Estado real:** los asedios secundarios vuelven a estar **pendientes**, no completados. La regresión del commit de corrección requiere verificación CI.
- **Próximo paso:** diseñar una integración aislada y compatible con el motor de asedios existente, acompañada de pruebas específicas de atacante, guarnición, bajas, confirmación asíncrona y guardado antes de activarla.

- **Ajuste adicional:** tras la reversión, CI mostró un fallo residual en el bloqueo de turno durante la confirmación de asedios (`p0-siege-turn-lock`). Commit `21ac38af`: restaurado el orden de comprobación del encuentro del rival principal antes de evaluar comandantes secundarios, siempre después de liberar el bloqueo. Resultado de CI pendiente.

- **Corrección de regresión P0:** la prueba `p0-siege-turn-lock.test.cjs` exige que el desbloqueo `rivalBusy=false` vaya seguido inmediatamente de la comprobación `rivalEncounterPending`. El comentario intermedio impedía cumplir el contrato de prueba. Commit `c6a46df4` elimina el comentario sin modificar la lógica; pendiente de confirmación CI.

### Avance controlado — planificación de aproximación a fortalezas (2026-11-10)

- **Base verificada:** regresión verde en ejecución `42812685492` tras la reversión de los asedios secundarios incompatibles.
- **Código:** `bdc256cb`. Los comandantes secundarios evalúan rutas hacia fortalezas del jugador a un máximo de 20 unidades de su castillo, estiman la fuerza de la guarnición y solo priorizan aproximarse cada tercer turno si su fuerza supera un umbral de 1,5 veces la defensa (mínimo 8). La persecución del héroe y la retirada hacia la fortaleza propia conservan prioridad.
- **Alcance deliberado:** únicamente planificación y movimiento; **no** se ejecuta el asedio al llegar ni se modifica el motor defensivo. Se preservan las pruebas P0 del sistema de asedios.
- **Validación:** regresión de este cambio pendiente; comprobar además selección de rutas, obstáculos y guardado en navegador.
- **Pendiente:** añadir un iniciador de asedio secundario compatible con la defensa manual/automática y pruebas específicas antes de activarlo.

### Pruebas específicas de planificación ofensiva — 2026-11-10

- **Base estable:** la regresión del cambio de rutas `bdc256cb` finalizó correctamente en GitHub Actions, ejecución `42815078078`.
- **Pruebas añadidas:** commit `258160d2`, archivo `tests/p0-secondary-commander-siege-planning.test.cjs`. Cinco comprobaciones protegen la selección de castillos del jugador, distancia máxima, evaluación de guarniciones, prioridad de persecución, límite de movimiento y ausencia de llamadas directas al motor de asedios.
- **Estado:** pendiente de confirmar CI del nuevo archivo de pruebas. Son pruebas de regresión estáticas sobre código; no sustituyen simulaciones de combate en navegador.
- **Próximo paso:** integración gradual de asedios secundarios con pruebas funcionales y preservación del motor defensivo original.

### Preparación segura de asedios secundarios — 2026-11-10

- **Regresión previa confirmada verde:** ejecución `42815470059` (planificación ofensiva y sus cinco pruebas).
- **Código `90dd9fea`:** función aislada `secondarySiegeEligibility(commanderId,castleId)`. Valida titularidad de castillo de origen y destino, ejército activo, derrota, proximidad física (5,5) y devuelve copias de atacantes y defensores. No inicia batallas ni modifica tropas, guardado o guarniciones.
- **Pruebas `08753a97`:** cinco casos de ejecución funcional de la nueva función: aceptación válida, propiedad, comandante derrotado/inactivo/sin tropas, distancia y ausencia de mutaciones.
- **Estado:** ejecución CI de estos cambios pendiente. El inicio efectivo de asedios secundarios sigue **desactivado** hasta garantizar compatibilidad con el sistema defensivo y las pruebas P0 existentes.

### Expediente táctico de asedio secundario — 2026-11-10

- **Validación previa:** regresión verde `42816430766` para elegibilidad de comandantes secundarios.
- **Código `413000b3`:** nueva función `secondarySiegeBattleDraft(commanderId,castleId)` que genera una copia independiente de los ejércitos y las pilas tácticas de soldados/arqueros, con puntos de vida y referencias de comandante/castillo. No inicia batalla, no modifica guarniciones y no altera el motor de asedios existente.
- **Pruebas `32ea2202`:** cuatro comprobaciones funcionales de rechazo de ataques inválidos, pilas tácticas, ausencia de mutaciones y ejércitos compuestos solo por arqueros.
- **Pendiente:** comprobar CI de esta entrega; posteriormente implementar el resultado y persistencia del asedio secundario con pruebas de victoria, derrota y recarga antes de habilitarlo en turnos enemigos.

### Resultados de asedios secundarios (sin activación automática) — 2026-11-10

- **Regresión anterior:** verde en ejecución `42817243854` (expediente táctico).
- **Código `ff8d8e26`:** `applySecondarySiegeOutcome(draft,result)` aplica resultados ya calculados exclusivamente al comandante atacante y a la guarnición objetivo. Revalida elegibilidad y estado de tropas para rechazar informes obsoletos, comprueba bajas enteras y no negativas y verifica que el ganador corresponde a la eliminación del ejército contrario. Solo después de validar todo aplica las bajas y la titularidad del castillo. No toca al rival principal ni ejecuta asedios automáticamente.
- **Pruebas `af05c0e3`:** cinco pruebas funcionales de victoria atacante, victoria defensora, rechazo de estado obsoleto, rechazo atómico de bajas inválidas y resultado desconocido.
- **Pendiente:** confirmar regresión CI, resolver el combate con motor compatible y conectar decisiones del jugador, guardado/recarga y turnos enemigos tras pruebas integrales.

### Simulación aislada de asedios secundarios — 2026-11-10

- **Validación anterior:** regresión verde `42817471332` para aplicación de resultados.
- **Código `55095881`:** `simulateSecondarySiege(draft)` simula hasta ocho rondas, calcula bajas deterministas y devuelve copias del estado final y un registro de rondas. Nunca modifica el estado del juego. Si tras ocho rondas sobreviven ambos bandos devuelve `retreat` y no una victoria falsa; este resultado todavía no puede aplicarse mediante `applySecondarySiegeOutcome`.
- **Pruebas `69af0666`:** cinco casos sobre inmutabilidad, determinismo, validación de ejércitos, conquista con defensores eliminados y retirada.
- **Pendiente:** CI de esta entrega, diseñar persistencia y tratamiento de retirada sin pérdida incorrecta de tropas, e integrar decisiones defensivas del jugador antes de activar ataques automáticos.

### Retiradas de asedios secundarios — 2026-11-10

- **Regresión anterior confirmada:** ejecución verde `42817699947` del simulador.
- **Código `14a06d7c`:** función aislada `applySecondarySiegeRetreat(draft,result)` que valida la retirada, compara instantáneas originales de tropas, aplica únicamente bajas válidas, conserva el castillo en manos del jugador y registra `lastSiegeRetreat` en el comandante para impedir doble aplicación en el mismo turno. No activa todavía el asedio en la partida.
- **Pruebas `09ff2e6d`:** cinco casos de conservación de ejércitos y propiedad, aplicación única, rechazo de instantáneas obsoletas, bajas inválidas y supervivencia de ambos bandos.
- **Pendiente:** confirmar CI y conectar cálculo/resultado con interfaz de defensa, guardado/recarga y turnos enemigos tras pruebas integrales.

### Persistencia de retiradas secundarias — 2026-11-10

- **Regresión previa:** verde `42818627184` (retiradas).
- **Código `845823f9`:** al normalizar comandantes de una partida cargada se conserva `lastSiegeRetreat` si es una cadena válida (máximo 120 caracteres), o se inicializa a cadena vacía para partidas antiguas. Los ejércitos permanecen intactos; el guardado existente serializa el estado `s` mediante JSON.
- **Pruebas `5d4dc305`:** tres pruebas funcionales que serializan/restauran el estado y verifican bajas persistentes, rechazo de una segunda aplicación del mismo asedio y compatibilidad con partidas antiguas o sellos inválidos.
- **Alcance:** pruebas de serialización y normalización en entorno aislado, no prueba completa de navegación o recarga real del navegador. CI pendiente de confirmar.
- **Pendiente:** integrar interfaz de defensa y flujo de turnos, además de pruebas end-to-end de guardado y recarga en navegador.

### Preparación de decisiones defensivas secundarias — 2026-11-10

- **Base verificada:** regresión verde `42818834151` de persistencia de retiradas.
- **Código `a83ef5a2`:** funciones `queueSecondarySiegeDecision` y `recoverSecondarySiegeDecision` para preparar una única decisión pendiente de asedio secundario en el estado serializable de campaña. Rechazan solapamiento con batallas o asedios principales, duplicados del mismo turno y expedientes obsoletos tras recarga. No muestran aún ventana ni disparan combates, para preservar el bloqueo de turnos ya validado.
- **Pruebas `09cca9ac`:** cinco casos de cola única, JSON guardado/recarga, invalidación por cambios de ejército, exclusión de combates simultáneos y bloqueo de retiradas duplicadas.
- **Pendiente:** confirmar CI, conectar la cola a una ventana de decisión defensiva y a la resolución del combate, verificar manualmente la experiencia y el guardado en navegador antes de habilitar asedios automáticos.

### Ventana de defensa secundaria: integración aislada — 2026-11-10

- **Código `0b736044`:** `promptSecondarySiegeDefense()` prepara la ventana profesional mediante `realmConfirm`, con resolución automática y opción de mantener la defensa sin modificar tropas. Revalida la campaña y la decisión tras la confirmación asíncrona, calcula el resultado, lo aplica al comandante secundario y a la guarnición, y registra un sello de asedio para evitar repetición en el turno.
- **Pruebas `b617ba4b`:** cuatro pruebas de confirmación, cancelación, combate simultáneo y decisión obsoleta.
- **Limitación importante:** el diálogo existe como función aislada pero aún **no está conectado a los turnos enemigos**; la defensa manual tampoco está habilitada. No presentar esta fase como asedios secundarios jugables. Se requiere integración específica del motor manual y un control de concurrencia antes de conectar el disparador.
- **Pendiente:** CI de regresión, conectar el disparador en turno enemigo, verificar guardado/recarga real y habilitar defensa manual.

### Activación de asedios secundarios durante el turno rival — 2026-11-10

- **Regresión previa:** verde `42822024528` para diálogo de defensa.
- **Código `276f0022`:** los comandantes secundarios solicitan un asedio solo al aproximarse realmente a un castillo del jugador (distancia máxima 5,5), conservando los requisitos previos de superioridad militar y planificación cada tres turnos. Al concluir el turno rival, tras liberar el bloqueo, se muestra la ventana de defensa secundaria si existe una solicitud pendiente. El asedio principal conserva su ruta independiente.
- **Pruebas `e64f7e2e`:** cuatro verificaciones de integración de disparador por proximidad, presentación de diálogo tras liberar bloqueo, preservación de asedio principal y requisitos tácticos.
- **Alcance actual:** opción de resolución automática o mantener la defensa; todavía no existe combate manual secundario. No se ha realizado aún prueba end-to-end en navegador y CI está pendiente.
- **Pendiente prioritario:** verificar regresiones, revisar carreras asíncronas, probar visualmente el diálogo y desarrollar el combate manual secundario sin reutilizar indebidamente el ejército del rival principal.

### Corrección del bloqueo del turno durante la defensa secundaria — 2026-11-10

- La primera integración `e64f7e2e` reveló un fallo en la regresión `42822823863`: se liberaba `rivalBusy` antes de concluir la nueva decisión, incumpliendo la protección contra encuentros simultáneos.
- **Corrección `25203ccd`:** el diálogo secundario se procesa dentro del turno rival manteniendo el bloqueo activo; solo después se libera el turno y pueden comenzar los encuentros pendientes. La llamada interna usa `promptSecondarySiegeDefense(true)` y las llamadas externas continúan bloqueadas mientras `rivalBusy`.
- **Prueba `57b9599e`:** ajustada para exigir el orden correcto de diálogo y desbloqueo; nueva regresión pendiente.

### Revisión de integración y despliegue — 2026-11-10

- **Regresión del juego:** verde `42823064849` tras corregir el bloqueo de turnos.
- **Publicación Pages:** la ejecución `42823064848` falló por conflicto de despliegues simultáneos (GitHub informa que la revisión `5fff7a74` seguía publicándose); no se ha atribuido a un error de sintaxis del juego. Queda pendiente verificar un despliegue limpio.
- **Corrección `1a292f8c`:** si el jugador elige mantener la defensa, se registra `lastSecondarySiege` antes de cerrar la solicitud, evitando que el mismo comandante repita la propuesta durante ese turno sin gastar tropas.
- **Prueba `a47ed0e8`:** refuerza la comprobación del sello de turno al mantener la defensa.
- **Pendiente:** CI de la corrección, pruebas de interacción en navegador, resolución de la concurrencia Pages y defensa manual secundaria.

### Persistencia del sello de asedio y diagnóstico Pages — 2026-11-10

- **Regresión anterior:** verde `42823353891` (bloqueo de turno y rechazo de asedios duplicados).
- **Corrección `a88ae7fa`:** normalizar y preservar `lastSecondarySiege` al recuperar comandantes de partidas guardadas; complementa `lastSiegeRetreat` y evita perder el sello que se registra tanto al resolver automáticamente como al mantener la defensa.
- **Pruebas `903b9fed`:** dos casos adicionales de serialización y compatibilidad con valores inválidos, sin alterar el ejército del comandante.
- **Pages:** el despliegue `42823380887` volvió a fallar porque GitHub indica un despliegue de la revisión `5fff7a74` todavía en curso, aunque las ejecuciones Actions de esa revisión constan como completadas. Es un conflicto de estado del despliegue Pages; requiere revisar el estado de GitHub Pages, no basta con modificar el juego.
- **Pendiente:** verificar CI y publicación, prueba real de recarga en navegador, defensa manual secundaria con motor táctico independiente.

### Defensa manual contra comandantes secundarios — 2026-11-10

- **Integración `aed8645c`:** diálogo de tres opciones (dirigir defensa, automática, mantener defensa), escenario táctico de la guarnición con las pilas reales del comandante secundario, y cierre independiente `finishSecondaryDefensiveSiege` mediante `applySecondarySiegeOutcome`. El ejército principal se conserva y restaura tras el combate; las bajas se registran en la guarnición y el comandante correspondiente, sin tocar el ejército del rival principal.
- **Pruebas `31aa708d` y `4ab2a055`:** adaptación de la ventana y tres casos adicionales de victoria, derrota y rechazo de combate simultáneo.
- **Regresión:** verde `42826385774` para las pruebas del juego.
- **Pendiente:** prueba visual y manual en navegador (incluyendo recarga y retirada), evaluar protección ante cierre abrupto durante batalla y verificar el despliegue Pages más reciente. El motor de combate existente sigue siendo la base táctica; no afirmar validación end-to-end hasta probarlo.

### Protección ante fallo al abrir la defensa manual secundaria — 2026-11-10

- **Código `22cf6cd2`:** apertura de escenario táctico protegida. Si `showBattle()` lanza un error o cancela el combate, se restauran las cuatro tropas del héroe principal y la decisión de asedio pendiente; no se confirma una batalla inexistente.
- **Pruebas `85b93838`:** dos escenarios de rollback por error y por cancelación de escena.
- **Estado:** regresión pendiente; revisión visual del usuario diferida hasta que pueda acceder a su ordenador. Continúa pendiente probar en navegador la defensa secundaria completa.

### Validación de resultados tácticos secundarios — 2026-11-10

- **Corrección `18c4c4af`:** el cierre de defensa secundaria usa las unidades atacantes supervivientes reales del escenario y rechaza una victoria cuando quedan enemigos vivos o una derrota cuando queda guarnición viva. No se cierra el combate ni se reemplazan tropas ante resultados prematuros.
- **Pruebas `445b7a47`:** casos adicionales para impedir victoria/derrota prematura y adaptar la derrota válida a la eliminación de las cuatro clases defensoras.
- **Pendiente:** resultado de CI, validación de batalla real en navegador y guardado posterior.

### Validación de instantáneas antes de la defensa manual — 2026-11-10

- **Corrección `cb72e967`:** el inicio de una defensa manual secundaria compara las instantáneas de las tropas atacantes y defensoras con la decisión vigente. Si están desactualizadas, rechaza abrir el escenario sin tocar el ejército principal.
- **Pruebas `aa3f3b67`:** rechazo de cambios tanto en la guarnición como en el comandante atacante; se verificó que la partida conserva el ejército y la decisión pendiente.
- **Regresión `42879992410`:** completada correctamente. La ejecución intermedia `42879953976` falló por un error en el montaje de la prueba (ambas instantáneas compartían el mismo objeto), corregido antes de esta validación.
- **Pendiente:** prueba visual completa en navegador y evaluación del guardado al cerrar inesperadamente una batalla.

### Reanudación de defensa pendiente al recuperar partida — 2026-11-10

- **Integración `88034dc4`:** al cargar un guardado válido (o recuperar su copia anterior), el juego programa la presentación de una decisión de asedio secundario pendiente después del renderizado. No abre un diálogo si la campaña cambió, existe una batalla activa o está ocupado el turno rival.
- **Pruebas `1ffae634`:** cuatro casos de reanudación, ausencia de asedio, cambio de campaña y bloqueo por combate o turno enemigo.
- **Compatibilidad `eeac1379`:** se corrigió una incompatibilidad con las pruebas aisladas de carga, que ejecutan `load()` sin los auxiliares globales; la reanudación solo se invoca cuando existe un asedio pendiente y está disponible la función.
- **Regresión `42881256150`:** verde. Queda pendiente comprobar en navegador el recorrido completo de cierre y reapertura de una partida con decisión pendiente.

### Recuperación ante fallo de confirmación de batalla secundaria — 2026-11-10

- **Corrección `3079b515`:** si el motor rechaza aplicar un resultado manual (por ejemplo, por datos obsoletos), se restaura el ejército principal, se cierra el escenario y se conserva el expediente original del asedio para validarlo nuevamente. No se marca falsamente el asedio como completado.
- **Prueba `261b5044`:** rechazo del resultado con conservación de tropas, expediente y sello del comandante. La regresión anterior `42881667096` fue verde; pendiente de confirmar la ejecución de esta prueba nueva.
- **Limitación:** el progreso táctico dentro de una batalla activa no se guarda. La política actual evita persistir el estado temporal de la guarnición como si fuese el ejército principal; aún debe validarse en navegador la recuperación tras cierre abrupto.

### Punto de recuperación previo a batalla secundaria — 2026-11-10

- **Código `6c39ffaf`:** antes de sustituir temporalmente las tropas del héroe por las de la guarnición, se guarda una instantánea válida de la campaña con el ejército principal y el asedio pendiente. Funciona incluso dentro del turno rival, cuando `persistGame()` bloquea los guardados habituales. Se mantiene copia anterior válida y no se abre el combate si el guardado falla.
- **Pruebas `aa66d05b`:** verifican rechazo seguro por fallo de escritura y que el archivo almacenado contiene el ejército original y el asedio pendiente, mientras la batalla utiliza la guarnición.
- **Regresión `42883212825`:** verde. Una ejecución intermedia previa falló por necesitar adaptar los dobles de prueba a la nueva función de guardado.
- **Limitación:** al cerrar el navegador durante la batalla se recupera la situación inmediatamente anterior al enfrentamiento y se vuelve a presentar la defensa; no se reanuda la ronda táctica exacta. Pendiente validación manual en navegador.

### Verificación del checkpoint de recuperación — 2026-11-10

- **Código `79182de6`:** la apertura de una defensa manual secundaria verifica que el contenido guardado pueda leerse exactamente antes de intercambiar las tropas del héroe y de la guarnición. Una escritura que falla silenciosamente impide iniciar el combate.
- **Pruebas `2a918595`:** se comprueba el rechazo por escritura silenciosa fallida y la conservación en almacenamiento del ejército original tras simular bajas y cierre de la pestaña.
- **Límite:** las pruebas simulan el almacenamiento y el cierre; falta la comprobación real de recarga en navegador. El punto de recuperación conserva el estado anterior al combate, no la ronda exacta.

### Protección frente a diálogos de asedio duplicados al recargar — 2026-11-10

- **Código `5089d747`:** exclusión mutua para que la defensa secundaria no muestre dos ventanas simultáneas cuando coinciden la recuperación de partida y otro intento de apertura. El bloqueo se libera al finalizar el diálogo, incluso si la ventana produce un error.
- **Pruebas `380be75a`:** dos llamadas concurrentes producen una sola ventana; tras un fallo de diálogo, un nuevo intento puede presentarse.
- **Pendiente:** validación visual en navegador y comprobación final de CI de esta modificación.

### Cancelación segura del diálogo de asedio secundario — 2026-11-10

- **Corrección `975f3dd3`:** pulsar Escape, cerrar la ventana o recibir una respuesta inesperada ya no equivale a seleccionar «Mantener defensa». El expediente pendiente se conserva y no se marca al comandante como atendido; solo una elección explícita ejecuta la decisión.
- **Pruebas `459c2b73`:** cancelación y respuesta inesperada preservan el expediente sin alterar resultados ni sellos del comandante.
- **Pendiente:** validar interacción visual y comportamiento del diálogo en navegador; la recuperación por recarga permanece disponible.

### Prevención de repetición de asedios tras restaurar partidas — 2026-11-10

- **Código `f3987729`:** al recuperar una decisión secundaria, se contrasta su identificador de comandante, castillo y turno con los sellos `lastSecondarySiege` y `lastSiegeRetreat`. Si el asedio ya fue resuelto o el atacante se retiró en ese turno, se descarta la decisión pendiente para impedir un enfrentamiento duplicado.
- **Pruebas `2f4cb196`:** recuperación de un asedio previamente resuelto y de una retirada ya registrada; ambos deben invalidar el expediente sin alterar tropas.
- **Pendiente:** prueba de navegación real con partidas antiguas y validación visual de las ventanas.

### Validación anticipada de asedios al cargar partidas — 2026-11-10

- **Código `66a8bbf0`:** al cargar la partida principal o recuperar una copia de respaldo, se valida el expediente de asedio secundario antes de revelar, renderizar y guardar el mapa. Los expedientes obsoletos o ya resueltos se descartan antes de cualquier persistencia automática.
- **Pruebas `5a4dc767`:** verifican el orden de validación anterior al renderizado tanto para guardado principal como respaldo.
- **Pendiente:** validar en navegador con guardados reales; comprobar CI de esta versión.

### Validación estricta de tropas al recuperar asedios — 2026-11-10

- **Código `22d51d78`:** antes de reactivar un asedio secundario pendiente se exige que todas las cantidades de atacantes y defensores sean enteros no negativos y coincidan con el estado actual. Los datos corruptos se descartan sin ejecutar un combate.
- **Pruebas `91a914c2`:** cantidades negativas, decimales, texto, nulos y valores ausentes no pueden reabrir un expediente de asedio.
- **Pendiente:** verificación de la ejecución de regresión y pruebas manuales de recuperación en navegador.

### Cancelación segura de movimientos de comandantes secundarios — 2026-11-10

- **Código `baa0bb3e`:** después de la última espera asíncrona de movimiento se vuelve a verificar el identificador de turno, el estado de la campaña y la propiedad del castillo de origen antes de solicitar un asedio o capturar un recurso. Evita acciones tardías de un turno cancelado o de un comandante cuyo castillo cambió de propietario.
- **Prueba `89e86bc0`:** garantiza que la comprobación se encuentre después de la pausa final y antes de ambas acciones estratégicas.
- **Pendiente:** validación manual de interrupciones durante el movimiento y confirmación del CI.

### Prueba de recuperación tras rechazo de resultado de asedio — 2026-11-11

- **Prueba `cb57ab9`:** ampliado `tests/p0-secondary-siege-manual.test.cjs` para simular un resultado táctico rechazado después de bajas en la guarnición, comprobar la restauración del ejército principal y verificar que el checkpoint local conserva el ejército y la decisión de asedio previos al combate.
- **Alcance:** prueba Node con almacenamiento simulado; no equivale a cerrar y reabrir un navegador real ni a validar un ciclo E2E.
- **Pendiente:** confirmar ejecución verde de GitHub Actions para esta revisión y probar en navegador victoria, derrota, resultado rechazado, cierre abrupto, recarga y resolución posterior de la defensa pendiente.

### Inicio de mejoras de realismo del demo de combate — 2026-11-11

- **Código `845f2a8`:** en `juego/combate-demo.html`, el ataque de una pila enemiga en un duelo activa explícitamente la animación de ataque, los arqueros lanzan el efecto de proyectil y la pausa de resolución visual pasa de 420 a 1050 ms.
- **Objetivo visual:** ataques legibles y movimientos con transición perceptible, sin alterar las reglas ni el ritmo del mapa de aventura.
- **Pendiente:** comprobar en navegador la sincronización entre proyectil, golpe y bajas; estudiar animación interpolada de desplazamiento en vez de limitarse a aumentar esperas. Ejecutar CI de regresión y comprobar que no hay fallos.

### Desplazamiento visual continuo en el demo de combate — 2026-11-11

- **Código `714a1ef` y ajuste `67948f9`:** `juego/combate-demo.html` incorpora `animateTacticalStep`, que interpola durante 1450 ms la imagen de la unidad entre casillas en movimientos aliados, enemigos y pilas enemigas. El estado táctico se actualiza una sola vez; la animación es únicamente visual.
- **Accesibilidad:** se omite la interpolación cuando el sistema solicita movimiento reducido.
- **Pendiente:** comprobar en navegador el movimiento con sprites ilustrados, cambios de ronda, interrupciones y redibujados del tablero. Confirmar GitHub Actions y corregir cualquier regresión antes de extender efectos de ataque.

### Continuidad de campaña tras conquistar el castillo principal — 2026-11-11

- **Código `b25d7dd`:** la victoria contra el defensor del castillo principal deja de fijar `s.done=true`. Tras otorgar experiencia, inicia una nueva etapa con `campaignLevel` incrementado (máximo 50), preserva tropas supervivientes, experiencia, facción y oro y reinicia el mapa, recursos y conquistas de la nueva etapa.
- **Dificultad inicial:** el rival recibe +4 soldados, +2 arqueros y +80 de oro por cada nivel adicional. La campaña antigua sin `campaignLevel` se interpreta como nivel 1.
- **Límites:** aún no hay mapas diferentes, pantalla de elección de siguiente nivel, ni escalado exhaustivo de guarniciones y comandantes secundarios; el nivel 50 es un tope provisional.
- **Pendiente prioritario:** verificar en navegador que la victoria no bloquea el movimiento, que el nuevo nivel persiste tras recargar y que el escalado de dificultad se aplica de forma consistente. Añadir pruebas automáticas específicas y comprobar GitHub Actions.

### Regresión automatizada de progresión de campaña — 2026-11-11

- **CI confirmado:** ejecución `42995545553` verde para la primera implementación de continuidad `b25d7dd`.
- **Pruebas `908e225`:** nuevo `tests/p0-campaign-progression.test.cjs` comprueba la transición del nivel 1 al 2, continuidad de tropas, experiencia y oro, desbloqueo del estado `done`, aumento de soldados, arqueros y oro rivales y compatibilidad con partidas antiguas sin `campaignLevel`.
- **Pendiente:** confirmar la nueva ejecución CI, realizar prueba manual completa de conquista y recarga, revisar escalado de comandantes y guarniciones, y evitar que el nivel 50 se repita sin un objetivo nuevo.

### Escalado de fortalezas secundarias en niveles posteriores — 2026-11-11

- **Regresión validada:** `42996439344` verde para `tests/p0-campaign-progression.test.cjs`.
- **Código `bbd4edd`:** los comandantes secundarios nuevos reciben +2 soldados y +1 arquero por cada nivel adicional. El asedio del castillo principal sin comandante presente recibe +8 puntos de resistencia por nivel adicional. Los cálculos admiten partidas antiguas sin `campaignLevel` y respetan el máximo provisional de nivel 50.
- **Importante:** los comandantes ya existentes en una partida guardada no se refuerzan retroactivamente; solo se aplica a su creación, evitando duplicar tropas en cada carga o renderizado.
- **Pendiente:** validar CI de este cambio y la dificultad real en navegador, añadir pruebas de escalado de guarniciones y equilibrio de recompensas.

### Guarniciones de castillos con dificultad progresiva — 2026-11-11

- **Código `a4f2aff` y `fb20c44`:** las guarniciones nuevas de castillos secundarios escalan por nivel: +3 soldados y +2 arqueros por nivel adicional, +1 grifo cada 2 niveles y +1 dragón cada 4 niveles. El asedio calcula la resistencia con esa guarnición escalada, no con el perfil fijo original.
- **Compatibilidad:** el nivel 1 conserva las cifras anteriores; las guarniciones guardadas mantienen su estado y no reciben refuerzos duplicados al volver a entrar.
- **Pendiente:** verificar pruebas automáticas y equilibrar los recursos, la experiencia y las recompensas. La ventana de victoria entre niveles y la comprobación manual en navegador siguen pendientes.

### Corrección de regresión en guarniciones — 2026-11-11

- **Incidencia:** las ejecuciones `42998647201` y `42998671829` fallaron en `p0-corrupt-garrison-recovery.test.cjs` porque el cálculo del nivel accedía a `s` en un entorno aislado sin ese estado.
- **Corrección `352115b`:** cuando el estado de campaña no existe, el cálculo usa nivel 1. Mantiene el escalado real en partidas normales y la recuperación de guarniciones corruptas.
- **Estado:** pendiente de confirmación verde en la ejecución posterior a esta corrección. No dar por completada la validación visual ni funcional.

### Ventana de victoria entre niveles — 2026-11-11

- **Código `626ae69` y `5a748fb`:** tras derrotar al castillo principal se presenta un diálogo superpuesto del sistema `realmDialog`, con nivel completado, experiencia recibida, tropas y oro conservados y nivel siguiente. Botón «Continuar la campaña»; el nivel ya se ha preparado y guardado antes de mostrar el diálogo, evitando pérdidas si el jugador sale.
- **Presentación:** detalles multilínea mediante `white-space:pre-line`; se reutiliza el diseño y la accesibilidad del sistema de diálogos del juego.
- **Pruebas:** regresión de guarniciones `42998729259` verde; pendiente confirmar CI de la nueva ventana y comprobar visualmente en navegador su aparición, enfoque y cierre.

### Corrección: ventana de victoria ausente en la demostración — 2026-11-11

- **Incidencia reportada por jugador:** no apareció la ventana al conquistar el castillo principal.
- **Causa identificada:** `juego/combate-demo.html` conservaba el antiguo `hitResolveVictory` que fijaba `s.done=true` y terminaba la partida sin diálogo; la mejora previa solo se había aplicado a `juego/index.html`.
- **Corrección `846ba70`:** sincronizado el bloque de victoria de la demostración con la versión principal: progresión al nivel siguiente, conservación de ejército/experiencia/oro y diálogo de victoria. Se aplica formato multilínea al diálogo.
- **Pendiente:** confirmar CI y reproducir manualmente la victoria en ambas páginas; verificar que el jugador recarga la versión nueva (sin caché).

### Condición definitiva de victoria de campaña: héroe y castillo — 2026-11-11

- **Regla acordada:** cada nivel termina solo cuando el héroe principal enemigo está derrotado **y** el castillo principal está conquistado. Ambos objetivos pueden cumplirse en cualquier orden.
- **Plazo de recuperación:** si el castillo sigue bajo control rival, el héroe principal se recupera tras tres turnos; el jugador debe capturarlo antes de su regreso. Con el castillo conquistado, el héroe derrotado no reaparece desde esa fortaleza.
- **Asedio:** derrotar al héroe defensor del castillo no conquista automáticamente la fortaleza: hace falta el asedio posterior. Conquistar el castillo con el héroe fuera tampoco finaliza la campaña.
- **Implementación:** `juego/index.html` (`9534206`, `4cadcf1`, `a017f0d`) y `juego/combate-demo.html` (`3fe5a28`, `5a44baa`).
- **Regresión:** `tests/p0-campaign-progression.test.cjs` (`751d98d`) comprueba ambas órdenes, condiciones incompletas y asedio del héroe defensor en las dos páginas.
- **Pendiente:** CI verde para las nuevas pruebas, revisión en navegador y verificación de la ventana de victoria real. No dar por validado hasta comprobarlo.

### P0: partida bloqueada tras supuesta victoria — 2026-11-11

- **Reporte con captura móvil:** el jugador derrota al héroe y conquista un castillo, no ve ventana de victoria y pierde capacidad de movimiento y de finalizar turno.
- **Causa adicional identificada:** la ruta antigua `hitResolveVictory()` de combate genérico `battle.fort` seguía fijando `s.done=true` sin evaluar la doble condición de victoria; además, `load()` reabría partidas antiguas con `done=true`, manteniendo los controles bloqueados.
- **Correcciones:** `juego/index.html` commit `3f19277` y `juego/combate-demo.html` commit `7c04227`. Las fortalezas genéricas ya no terminan la campaña; la carga principal y la recuperación desde backup desactivan el bloqueo `done` de partidas antiguas y muestran un mensaje de recuperación.
- **Protección de datos:** no se fuerza nueva campaña ni se borran las partidas; se mantiene el estado del héroe y recursos.
- **Pendiente:** verificar CI, comprobar la partida del usuario tras recarga y probar manualmente ambos órdenes de objetivos, el diálogo y los controles.

### Visibilidad del objetivo real de campaña — 2026-11-11

- **Reporte:** el usuario puede continuar jugando tras corregir el bloqueo, pero no observa la ventana de victoria.
- **Diagnóstico:** hay castillos independientes, incluido `fort-south` en `4,7`, distintos del castillo principal `rival` en el extremo inferior izquierdo `0,9`; la interfaz aún decía vagamente «conquista las fortalezas hasta alcanzar el castillo final». El indicador visual del castillo rival dependía de `s.done` (bandera antigua) en vez de la propiedad real.
- **Cambios:** `juego/index.html` (`50c2319`) muestra en «Objetivo de campaña» el nivel, estado del héroe principal y estado del castillo principal, con aviso de recuperación y ubicación; el estandarte del castillo principal usa `verifiedSiteState().rival`. `juego/combate-demo.html` (`f4f2362`) corrige el estandarte.
- **Pendiente:** comprobar en partida real si se cumplen ambos objetivos; si ya aparecen marcados ambos sin ventana, investigar transición y estado guardado sin reiniciar campaña.

### P0: victoria pendiente tras recargar — 2026-11-11

- **Reporte:** después de derrotar a un héroe y conquistar su castillo no aparece el diálogo; un castillo vuelve a manos enemigas.
- **Corrección de recuperación:** `juego/index.html` (`29401cb`) y `juego/combate-demo.html` (`4c0641f`) detectan al cargar partidas con los dos objetivos del castillo principal cumplidos (`verifiedSites.rival='player'` y `rival.defeated=true`) y reanudan la transición con su ventana. No se reinicia la partida si falta alguno de los dos objetivos.
- **Diagnóstico pendiente:** distinguir castillo principal `rival` de los cinco castillos secundarios `fort-*`; estos últimos pueden sufrir reconquistas de IA. Solicitar identificación del castillo que cambia de dueño para verificar si hubo un asedio real o un cambio de propiedad indebido.
- **Pendiente:** CI y validación manual de la recuperación en móvil.

### P0 corregido: doble ruta del castillo principal — 2026-11-11

- **Confirmación del usuario:** el castillo que vuelve a control enemigo es el **castillo principal** (coordenada lógica `0,9`), no un castillo secundario.
- **Causa verificada:** coexistían la interacción de sitio verificado `battle.rivalCastle` y la ruta heredada de combate por casilla `battle.fort`. Esta última otorgaba la victoria de combate pero no actualizaba `verifiedSites.rival`, y `hostileAt('0,9')` seguía dependiendo de `s.done`, por lo que el castillo parecía enemigo de nuevo y no se abría el diálogo.
- **Corrección:** `juego/index.html` commit `7857593` y `juego/combate-demo.html` commit `d04f9cb`. La ruta heredada marca `verifiedSites.rival='player'`, evalúa `completeCampaignIfReady()` y `hostileAt` usa la propiedad real en vez de `s.done`. Se mantiene la doble condición de victoria.
- **Pendiente:** confirmar CI y prueba manual de conquista en ambas rutas, persistencia tras recarga y diálogo de victoria.

### Corrección visual confirmada por captura: ventana de victoria — 2026-11-11

- **Validación del usuario:** la ventana de victoria aparece correctamente y anuncia el nivel 2 tras cumplir los dos objetivos.
- **Defecto visual:** el texto del diálogo mostraba literalmente `\\n\\n` en lugar de separar los párrafos.
- **Corrección:** `juego/index.html` (`890a9e1`) y `juego/combate-demo.html` (`fbfe83c`) sustituyen las secuencias escapadas dobles por saltos de línea interpretables por JavaScript; se conserva el estilo `white-space:pre-line` del diálogo.
- **Pendiente:** CI verde y revisión de presentación en navegador móvil; singular/plural de unidades y texto de recompensas para una fase posterior.

### Economía y dificultad progresiva por nivel — 2026-11-11

- **Objetivo:** los niveles posteriores deben exigir más estrategia y hacer más difícil acumular oro, sin afectar al nivel 1 ni destruir el progreso del héroe.
- **Implementado:** factor de ingresos de oro del jugador `max(0.45, 1 - 0.08*(nivel-1))` hasta nivel 8. Se aplica a la renta al terminar el turno y a la renta de castillos secundarios; el nivel 1 mantiene el 100 %, el nivel 2 recibe el 92 %, nivel 3 el 84 %, nivel 4 el 76 %, nivel 5 el 68 %, nivel 6 el 60 %, nivel 7 el 52 % y nivel 8+ el 45 %.
- **Rival:** recibe +12 de oro por turno por nivel adicional (limitado a 20 niveles de incremento), además de los refuerzos de tropas y guarniciones ya existentes. No se reducen las recompensas de victoria ni el oro acumulado del héroe.
- **Archivos:** `juego/index.html` (`d34f37d`) y `juego/combate-demo.html` (`33acf7c`).
- **Pendiente:** CI, pruebas de balance en niveles 2–8 y controles de costes de reclutamiento; ajustar según experiencia real de juego.

### Experiencia progresivamente más escasa — 2026-11-11

- **Solicitud:** aplicar a la experiencia del héroe la misma reducción progresiva que a los ingresos de oro en niveles posteriores.
- **Implementado:** `awardHeroExperience(amount)` calcula la experiencia ganada con factor `max(0.45, 1-0.08*min(7,nivel-1))`: nivel 1 100 %, nivel 2 92 %, nivel 3 84 %, nivel 4 76 %, nivel 5 68 %, nivel 6 60 %, nivel 7 52 %, nivel 8+ 45 %. Se redondea hacia abajo y toda recompensa positiva otorga al menos 1 XP. La experiencia acumulada no se reduce.
- **Cobertura:** todas las fuentes de experiencia que usan la función central, incluidos combates, conquistas y recompensas; `juego/index.html` (`3718bc5`) y `juego/combate-demo.html` (`5e3642b`).
- **Pendiente:** confirmar CI y revisar balance de progresión de héroes en niveles altos.


## Fase 6 — Integración de NVRA y economía tokenizada (planificada, no implementada)

**Objetivo:** incorporar el token NVRA del ecosistema NovaRise en Reinos de Leyenda sin confundir las monedas de oro, los cristales o la experiencia del juego con activos transferibles.

**Dependencias:** completar la auditoría de estabilidad, verificar el contrato y la red Base del token real, documentar tesorería y asignación de recompensas, y validar riesgos legales, de seguridad y económicos antes de habilitar pagos o retiros.

**Tareas:**
1. Verificar la dirección y el código del contrato NVRA en Base, su suministro, permisos administrativos y estado de seguridad; no suponer que está auditado.
2. Diseñar conexión opcional de carteras compatibles con Base, sin custodiar ni solicitar frases semilla o claves privadas.
3. Diferenciar la minería y los recursos internos de cualquier derecho a recibir NVRA real; definir conversiones, límites, temporadas y controles contra automatización y cuentas múltiples.
4. Diseñar un sistema de recompensas con presupuesto máximo, tesorería financiada y registro verificable de operaciones. No prometer rentabilidad, liquidez ni valor de mercado.
5. Evaluar utilidades opcionales de NVRA dentro del juego sin impedir la progresión de jugadores gratuitos ni introducir ventajas desproporcionadas.
6. Crear pruebas de seguridad, integridad de partidas, resistencia a duplicaciones y recuperación de errores de red, además de revisión legal y económica previa al lanzamiento.
7. Activar primero una modalidad informativa o simulada sin transferencias reales; habilitar operaciones en cadena únicamente tras las verificaciones anteriores.

**Criterio de cierre:** integración funcional, documentada y probada, con límites económicos explícitos y sin comprometer el guardado de partidas. **Estado: pendiente.**

### Fase 1 — Auditoría del equilibrio: primera batería de pruebas (2026-11-11)

- **Auditoría iniciada:** identificadas las fórmulas centrales `campaignGoldFactor()`, `campaignGoldIncome()` y `awardHeroExperience()`. El nivel 1 mantiene recompensas completas; niveles 2–8 reducen progresivamente hasta el suelo del 45 %.
- **Pruebas incorporadas:** `tests/p0-campaign-economy-balance.test.cjs` (commit `3cc82c6`) comprueba oro y experiencia en niveles 1–8 y 20, recompensa mínima positiva de 1 XP y compatibilidad con partidas antiguas sin `campaignLevel`, en `juego/index.html` y `juego/combate-demo.html`.
- **Estado:** pendientes resultados de CI y simulaciones completas de capacidad de reclutamiento, gasto, guarniciones, recuperación del enemigo y ritmo de experiencia. Esta batería prueba fórmulas, no demuestra todavía que el juego esté equilibrado en partidas reales.

### Fase 1 — Corrección de recuperación del héroe rival (2026-11-11)

- **Error de equilibrio detectado:** cuando el héroe principal enemigo era derrotado y se recuperaba tres turnos después, reaparecía con solo 4 soldados y 1 arquero incluso en campañas avanzadas. Esto anulaba parte del aumento de dificultad.
- **Corregido en ambas páginas:** la recuperación ahora restablece `4+4*(nivel-1)` soldados y `1+2*(nivel-1)` arqueros, respetando el nivel de campaña (1–50). El comportamiento del nivel 1 se mantiene.
- **Prueba de regresión añadida:** `tests/p0-campaign-economy-balance.test.cjs` comprueba que la fórmula de recuperación no vuelva a los valores fijos.
- **Pendiente:** validar CI, evaluar ingresos netos, costes de reclutamiento y capacidad real de victoria en campañas avanzadas.

### Fase 1 — Auditoría de asequibilidad del reclutamiento (2026-11-11)

- **Datos del código:** coste de reclutamiento básico: soldado 30 de oro, arquero 50; renta base inicial 40 de oro/turno, antes de edificios y castillos. La renta reducida es de 27 de oro/turno en nivel 5 y 18 de oro/turno en niveles 8+.
- **Comparación de niveles 5, 10 y 20:** sin fuentes adicionales de oro, un soldado exige 2 turnos de renta en los tres niveles; un arquero exige 2 turnos en nivel 5 y 3 turnos en niveles 10 y 20. Se trata de capacidad de compra teórica, no de simulación completa de combates.
- **Protección automatizada:** nueva prueba en `tests/p0-campaign-economy-balance.test.cjs` (commit `e0679d8`) verifica que un soldado siga siendo asequible con un máximo de dos turnos de renta base y un arquero con un máximo de tres en niveles 5, 10 y 20.
- **Riesgo pendiente:** la reposición de unidades del enemigo puede superar la capacidad de compra del jugador, especialmente si pierde las tropas veteranas que conserva entre campañas. Hace falta una simulación integral de campañas, tropas y victorias antes de declarar equilibrados los niveles altos.

### Fase 1 — Recuperación de comandantes secundarios (2026-11-11)

- **Hallazgo:** en la página principal, los comandantes de castillos secundarios reaparecían con 3 soldados y 1 arquero después de tres turnos, ignorando el nivel de campaña y debilitando artificialmente al enemigo en niveles altos.
- **Corrección:** al recuperarse, su ejército se reconstruye con la misma fórmula de soldados y arqueros escalados que al crearse inicialmente, según el perfil del castillo y el nivel de campaña; sin duplicar tropas de comandantes existentes.
- **Cobertura:** `juego/index.html` (commit `3dec29a`) y prueba `tests/p0-campaign-economy-balance.test.cjs` (commit `514dd3a`). La demo no implementa `enemyCastleHeroTurns`, por lo que no corresponde modificar ese módulo allí.
- **Pendiente:** confirmar CI y simular combates prolongados para calibrar la recuperación de los ejércitos frente a la economía del jugador.


## Cierre operativo de fases — 2026-11-11

**Nueva regla de ejecución acordada:** no fragmentar indefinidamente una fase en pequeñas revisiones. Analizar la fase de manera integral, corregir los problemas verificables, ejecutar las pruebas, registrar lo que quede fuera del alcance y pasar inmediatamente a la siguiente. No declarar superadas pruebas que no se hayan ejecutado.

### Fase 1 — Auditoría de equilibrio y dificultad progresiva: CERRADA para el alcance técnico definido

**Revisado y corregido:** escalado del oro y la experiencia por nivel, asequibilidad mínima de reclutamiento en niveles 5/10/20, fuerza y recuperación del héroe principal y de comandantes secundarios, y compatibilidad de fórmulas con partidas antiguas. La batería de regresión del juego terminó correctamente en GitHub Actions, ejecución `43019564196`.

**Alcance del cierre:** validación de reglas y pruebas automáticas existentes; **no equivale a afirmar que se hayan completado partidas reales de principio a fin en los niveles 10 y 20**. El balance fino de campañas prolongadas queda como seguimiento transversal en pruebas integrales (fase 5), sin bloquear la siguiente fase.

### Fase 2 — Castillos y ejércitos estratégicos: ACTIVA

**Objetivo de cierre:** auditar de forma conjunta guarniciones, comandantes, reclutamiento, defensas y capturas de castillos; corregir errores reproducibles y añadir pruebas de regresión; actualizar el plan y pasar a fase 3 sin prolongar la fase 2 por mejoras opcionales.

**Secuencia pendiente:** fase 2 castillos y ejércitos → fase 3 economía y recompensas → fase 4 variedad de niveles → fase 5 estabilidad integral → fase 6 integración segura del token NVRA.

### Fase 2 — Castillos y ejércitos estratégicos: cierre técnico (2026-11-11)

**Auditoría conjunta:** revisados los mecanismos de guarnición y reclutamiento del castillo, conservación de comandantes al recargar, propiedad de castillos, recuperación y reclutamiento de comandantes secundarios y resolución de asedios.

**Corrección aplicada:** los comandantes secundarios tenían topes fijos de reclutamiento de 40 soldados y 15 arqueros, aun en niveles donde comenzaban con ejércitos mayores. Los topes pasan a `40+2*(nivel-1)` soldados y `15+(nivel-1)` arqueros, con nivel limitado a 50, y siguen pagando sus tropas con la tesorería propia. Cambio en `juego/index.html` (commit `bad817d`), protegido por prueba de regresión `tests/p0-campaign-economy-balance.test.cjs` (commit `0bd0bbd`).

**Cierre:** fase 2 cerrada para las reglas auditadas y las correcciones concretas. La aprobación de CI de esta última modificación debe verificarse; la fase no se considera validada hasta entonces. La experiencia real de asedios y el balance prolongado siguen dentro de la fase 5.

### Fase 3 — Economía y recompensas: ACTIVA

**Alcance inmediato:** auditar recompensas de conquistas, tesoros, ingresos de minas y mercados, precios y posibilidades de explotación repetida; corregir fallos reproducibles, añadir pruebas y cerrar sin alargar revisiones opcionales.

### Fase 3 — Ampliación del mapa real (2026-11-11)

Se recibió y examinó visualmente el archivo original `mapa-grande.png`. Se mantiene el criterio obligatorio de **no inventar objetos ni construcciones**. Primera ampliación implementada en `juego/index.html`: tres puntos interactivos transparentes superpuestos a elementos identificados en la imagen: pozo antiguo del desierto (experiencia), cabaña del bosque central (tres soldados) y ruinas orientales del desierto (oro ajustado a la dificultad). Cada recompensa se entrega **una sola vez por nivel**, mediante `s.landmarkRewards`, y se conserva con el estado de la partida; la siguiente campaña reinicia el mapa y permite nuevas visitas. Prueba añadida en `tests/p0-map-landmark-rewards.test.cjs`. Confirmar resultado CI y posición exacta en el juego antes de dar por concluida la fase 3. Se mantienen intactas las minas y los molinos anteriores.

### Fase 3 — Cierre de la ampliación inicial de exploración del mapa (2026-11-11)

La inspección de `mapa-grande.png` permitió añadir dos construcciones reales más: refugio del desierto occidental (reclutamiento) y refugio entre las montañas centrales (experiencia). Se dispone ahora de **cinco puntos adicionales** (dos de experiencia, dos de reclutamiento y uno de oro) sobre elementos identificables del mapa original, con activación transparente sin dibujar edificios ficticios. La recompensa es única por lugar y campaña, guardada en `s.landmarkRewards`. La fase 3 queda **cerrada en este alcance de ampliación y reglas de recompensa**, condicionada a que pase CI; el ajuste visual fino de coordenadas y el ensayo manual completo permanecen para fase 5.

### Fase 4 — Variedad de niveles y objetivos: ACTIVA

Siguiente fase: revisar la transición entre campañas, conservación de tropas y experiencia, objetivos de victoria y diferenciación de niveles; corregir defectos verificables, probar y cerrar en un bloque.

### Fase 4 — Cierre técnico de progresión de campañas (2026-11-11)

**Auditoría:** condiciones de victoria (héroe principal derrotado y castillo principal conquistado), continuidad de tropas, experiencia, facción y oro; reinicio del mapa y progresión del nivel 1 al 50. **Defecto detectado:** al completar el nivel 50, el juego reiniciaba el mismo nivel indefinidamente, permitiendo repetir recompensas y sin final de campaña.

**Corrección:** al completar el nivel 50 se marca `s.done=true`, se cierra el combate y aparece una ventana de victoria definitiva, sin reiniciar la campaña ni duplicar recompensas. Se aplicó a `juego/index.html` y `juego/combate-demo.html`. La transición habitual de niveles 1–49 permanece intacta. Prueba añadida a `tests/p0-campaign-economy-balance.test.cjs`.

**Cierre:** fase 4 cerrada en su alcance técnico, pendiente de verificar CI del cambio final. Las pruebas de partida completa y verificación visual quedan en fase 5.

### Fase 5 — Estabilidad y pruebas integrales: ACTIVA

Comprobar la suite automática, persistencia, navegación, combate y progresión sin introducir regresiones. Corregir defectos reproducibles antes de pasar a la fase 6.

### Fase 5 — Auditoría de persistencia y victoria final (2026-11-11)

**Error crítico identificado y corregido:** el cargador de partidas desbloqueaba automáticamente **cualquier** partida marcada como `done`, incluso una victoria legítima del nivel 50. Al volver a entrar, la campaña podía reabrirse o volver a ejecutar la comprobación de victoria. Corregido en `juego/index.html` y `juego/combate-demo.html`: se preserva `done` cuando el nivel guardado es 50 y consta que el castillo principal está conquistado y el rival principal derrotado; se mantiene la recuperación de partidas antiguas marcadas como finalizadas sin cumplir ambos objetivos. La corrección se aplica tanto a la carga principal como a la copia de seguridad. La página principal tampoco reejecuta la transición de campaña si `s.done` es verdadero. Prueba de regresión añadida a `tests/p0-campaign-economy-balance.test.cjs`.

La batería anterior de regresión del juego finalizó correctamente (ejecución `43027719715`). **Fase 5 continúa activa** hasta verificar la CI de esta corrección y completar comprobaciones restantes. No se considera validada una partida completa de 50 niveles únicamente con pruebas estáticas.

### Fase 5 — Protección adicional del guardado (2026-11-11)

Se detectó que `validGame()` no validaba el nivel de campaña ni el registro de recompensas únicas de los cinco lugares reales del mapa. Corregido en el juego y la demo: el nivel opcional debe ser entero de 1 a 50, y `landmarkRewards` opcional debe ser un objeto de identificadores `relic-...` con valores booleanos `true`; se mantiene la compatibilidad con partidas antiguas que carecen de esos campos. La validación protege la carga, exportación/recuperación y persistencia frente a estados corruptos o recompensas repetidas mediante valores inválidos. Prueba de regresión añadida.

**Fase 5:** sigue pendiente la comprobación de CI de la última modificación y el recorrido manual completo de navegación/combate. No cerrar por adelantado ni iniciar la fase 6 hasta verificar las pruebas disponibles.

### Fase 5 — Validación estricta de lugares del mapa (2026-11-11)

Se ha reforzado la comprobación de partidas importadas y guardadas: ya no basta con que el identificador de una recompensa siga el patrón `relic-...`. Ahora debe coincidir con uno de los cinco lugares reales registrados en `mapa-grande.png`; las entradas desconocidas o con valores distintos de `true` invalidan el estado, activando los mecanismos de recuperación existentes. Aplicado a `juego/index.html` y `juego/combate-demo.html`, con prueba de regresión adicional. La compatibilidad con partidas sin `landmarkRewards` se mantiene. **CI pendiente:** GitHub Actions permanecía en cola durante esta revisión; no se declara cierre definitivo de fase 5 hasta confirmar resultados.

### Fase 5 — Prevención de dobles cierres de campaña (2026-11-11)

Se añadió una guarda de idempotencia al inicio de `completeCampaignIfReady()`: si `s.done` ya indica campaña finalizada, no vuelve a ejecutarse la victoria ni se abre otro diálogo. Aplicada al juego y la demo, con prueba de regresión. Las ejecuciones de GitHub Actions permanecían en cola al consultar; por tanto, la fase sigue abierta y sin validación integral manual.


### Reanudación y auditoría de CI — 2026-11-12

- Se confirma como **fase activa la fase 5 (estabilidad y pruebas integrales)** del plan operativo de seis fases. Las cuatro primeras tienen cierre técnico documentado, sin que ello sustituya las pruebas manuales pendientes.
- Última regresión del juego consultada: **verde**, ejecución GitHub Actions `43106340840` (commit `95bd854e`). El despliegue Pages del commit `39345cede` fue correcto (`43106364353`).
- La validación estática general de NovaRise fallaba en `43106364269` porque `tests/site-integrity.test.cjs` interpretaba una URL con caracteres porcentualmente codificados como nombre literal de archivo. Se comprobó que el archivo real `assets/Logotipo circular N verde neón.png` sí existe. Corregido el test para decodificar la ruta y rechazar codificaciones inválidas (commit `1d53818b`); **verificar el resultado del nuevo CI antes de declararlo verde**. No se modificó la imagen ni el diseño público.
- Aceptación pendiente: recorrido de campaña en navegador, persistencia de guardados y copias, asedios principales/secundarios, condiciones de victoria y recarga, posición de los cinco lugares reales, compatibilidad móvil y dos sesiones para nube. No declarar estas pruebas superadas por una suite Node.
- La fase 6 (NVRA) permanece sin activar hasta superar las salvaguardas pertinentes; el índice histórico inicial de cuatro fases se conserva como historial, pero el plan operativo vigente es el de seis fases.


### Verificación CI y revisión de persistencia — 2026-11-12

- **CI confirmado verde en commit `ac639ab3`**: regresión del juego `43190354415`, validación estática general `43190354301`, despliegue GitHub Pages `43190354137` y Pages build `43190351472`.
- Se corrigió la aserción obsoleta de `tests/site-integrity.test.cjs` que exigía un umbral de tesorería `3 de 5`, cuando la divulgación actual bilingüe indica **Safe previsto 2 de 3** (commit `ac639ab3`). Es una actualización de test, **no** una validación on-chain de la configuración real. Antes de operar fondos NVRA, conciliar documentación de seguridad histórica y control real.
- Revisión estática adicional de `juego/index.html` y `juego/combate-demo.html`: ambas variantes contienen guardia de victoria idempotente, límite final en nivel 50, validación de niveles y de cinco ubicaciones del mapa; el cargador principal intenta restaurar un backup válido si el guardado principal falla. Son observaciones del código, **no pruebas de ejecución en navegador**.
- El workflow de anuncio especial Telegram `telegram-nvra-announcement-20261107.yml` sigue fallando; no afecta al estado verde de los tests de juego y web, pero requiere tratamiento independiente.
- **Fase 5 permanece abierta** hasta completar pruebas reales de navegador: guardado/recarga y recuperación, combates y asedios, continuidad de los 50 niveles, mapa y pantallas móviles. No iniciar recompensas tokenizadas en producción antes de esta aceptación.


### Fase 5 — Pruebas de ejecución de funciones críticas (2026-11-12)

- Añadido `tests/p0-final-victory-runtime.test.cjs` (commit `89539392`): prueba con `node:test` y `vm` la función real `completeCampaignIfReady` extraída de las dos variantes del juego. Verifica que la victoria en nivel 50 termine la campaña, no reinicie el mapa, y no abra dos diálogos ni ejecute dos cierres.
- El mismo archivo ejecuta `validGame` de ambas variantes y comprueba el rechazo de niveles 0, 51 y decimales, de recompensas en lugares ficticios y de reclamaciones malformadas; también acepta un estado legítimo del nivel 50.
- **Estado de aceptación:** pruebas añadidas al repositorio; confirmar resultado de CI que las ejecute antes de marcarlas aprobadas. Estas pruebas de funciones aisladas no sustituyen un recorrido completo de navegador.


### Fase 5 — Validación manual de campaña comunicada por el jugador (2026-11-12)

- **Comprobación manual positiva informada por el jugador:** jugó una partida real hasta completar el nivel; confirmó que **los datos se guardan correctamente** y que **la campaña cambia al nivel siguiente**.
- Esta evidencia permite marcar como **validados manualmente en el escenario probado** el cierre de nivel, la persistencia observada y la transición de campaña. No implica que se hayan recorrido los 50 niveles ni todas las rutas de carga, recuperación, combate y asedio.
- Las pruebas automáticas añadidas en `89539392` terminaron **verdes**: `Game regression tests` ejecución `43190924820`. También quedaron verdes las pruebas estáticas `43190948587` y el despliegue Pages `43190948852` del commit de documentación `3094853f`.
- **Pendientes para cierre integral de fase 5:** recuperación de guardado corrupto/backup en navegador, asedios principales y secundarios con guardado/reanudación, visualización y clics de las cinco ubicaciones reales, compatibilidad móvil y aceptación del nivel 50. No repetir la prueba de avance de nivel ya superada salvo regresión.


### Fase 5 — Prioridad: interacciones con elementos reales del mapa (2026-11-12)

- Por decisión del jugador, se priorizan **únicamente** las interacciones con construcciones/objetos ya visibles en `juego/mapa-grande.png`. No añadir edificios, minas ni artefactos ficticios sobre la ilustración.
- Auditoría del código: `VERIFIED_MAP_SITES` define cinco reliquias, minas, molinos y castillos; `drawWorldLandmarks()` sitúa botones transparentes sobre coordenadas porcentuales; `interactVerifiedSite()` permite caminar hacia ellos y aplica recompensas, propiedad o provisiones. Los cinco lugares de recompensa se reclaman una sola vez por nivel.
- Se incorpora `tests/p0-map-interaction-runtime.test.cjs` (commit `dcbef13b`): pruebas ejecutables de las cinco reliquias, prohibición de doble recompensa, propiedad de minas sin emisión de NVRA y límite semanal de molinos. **Pendiente confirmar CI**.
- Aceptación visual pendiente: contrastar manualmente cada hotspot con el píxel exacto del elemento de `mapa-grande.png`, verificar acceso y distancia de interacción desde el héroe en navegador y probar los puntos táctiles en móvil. No considerar las coordenadas verificadas visualmente solo por existir en el código.


### Auditoría visual contra imagen original proporcionada por el jugador (2026-11-12)

- Se recibió e inspeccionó `mapa-grande.png` (imagen original de 1254 × 1254 píxeles) y se generó una superposición numerada de las **20** zonas registradas en `VERIFIED_MAP_SITES` (7 castillos, 3 minas, 5 molinos y 5 reliquias). La superposición de revisión se entrega por separado al jugador; **no** se modificó el mapa original.
- Los cinco hotspots de recompensa corresponden aproximadamente a elementos visibles: pozo del desierto, cabaña del bosque, ruinas orientales, refugio del desierto y cabaña/refugio de montaña. Los cinco molinos coinciden aproximadamente con molinos visibles. Mantener revisión fina de sus áreas clicables y accesibilidad del héroe.
- **Discrepancia visual concreta detectada:** `fort-north` (`x:79.3,y:8.2`) está situado sobre una casa de madera en la zona norte, **no sobre un castillo dibujado**. No considerarlo castillo verificado. Resolver sin añadir castillos ficticios: decidir si reconvertir esa construcción existente en un lugar interactivo distinto o rediseñar su papel en la campaña, comprobando dependencias de guarniciones y asedios antes de cambiar lógica.
- Revisar con mayor detalle las minas (`mine-west`, `mine-center`, `mine-east`) para confirmar que cada hotspot coincide con una entrada de mina real y no solo con terreno rocoso, y el acceso del héroe desde casillas transitables.
- **Estado:** auditoría visual iniciada y discrepancia documentada; no declarar validadas las 20 ubicaciones ni modificar coordenadas sin confirmación visual y pruebas de interacción. La suite automática del mapa `43193423459` finalizó verde, así como la validación estática `43193441174` y Pages `43193441272`.


### Ampliación de interacciones basada en los círculos blancos del jugador (2026-11-12)

- El jugador proporcionó un mapa anotado con **10 nuevas construcciones/lugares visibles**, además de los 20 puntos anteriores. Por instrucción expresa, **se mantienen intactos los 20 hotspots existentes** (incluido `fort-north`), sin cambiar posiciones, funciones ni arte original.
- Añadidos **10 hotspots nuevos** de tipo `relic` en ambas variantes `juego/index.html` y `juego/combate-demo.html`: `relic-north-mountain-dwelling` (29.1%,11.3%, soldados), `relic-north-wooden-hall` (46.1%,18.3%, soldados), `relic-east-mountain-shelter` (59%,25%, experiencia), `relic-northeast-desert-cabin` (80%,18.1%, soldados), `relic-central-stone-arch` (56.5%,37.7%, experiencia), `relic-west-lake-shelter` (10.9%,66.2%, oro), `relic-south-lake-cottage` (33.7%,74.3%, soldados), `relic-southwest-forest-hut` (12%,83.1%, soldados), `relic-southeast-lava-site` (91.3%,84.3%, experiencia), `relic-far-southeast-house` (92.5%,93.8%, oro).
- Se reutiliza la mecánica existente de interacción por proximidad/ruta y recompensa **una vez por nivel** (+3 soldados, +55 PX base o +100 oro ajustado por campaña). Sin token NVRA ni gráficos añadidos al mapa. Total nuevo: **30 hotspots, 15 de recompensa**.
- El validador de partidas acepta las 10 claves nuevas de recompensa, manteniendo el rechazo de claves desconocidas; prueba de ejecución ampliada a 15 reliquias. Commits `42949ba6`, `108ff9bd`, `48bc983b`.
- **Verificación pendiente:** resultado de CI del commit `48bc983b`, y prueba visual/manual de los diez clics y caminos transitables. Los centros y tamaños se estimaron sobre el mapa anotado; ajustar únicamente tras observar errores reales.


### Fase 5 — Verificación de rutas hacia los diez lugares añadidos (2026-11-12)

- Confirmado **verde** en commit `48bc983b`: `Game regression tests` `43199035277`, y pruebas estáticas `43199037369`. En commit `76ff46e8`, también verdes validación estática `43199069151` y publicación Pages `43199069655`.
- Auditoría de `interactVerifiedSite()` y `walkTo()`: los clics a distancia buscan una casilla transitable próxima al elemento, dejan una interacción pendiente y solo entregan la recompensa tras llegar; si no existe ruta, informan del obstáculo sin entregar recompensa.
- Añadidas pruebas ejecutables de **ruta disponible** y **lugar inaccesible** a `tests/p0-map-interaction-runtime.test.cjs` (commit `b0efd1f`), verificando que no se entregue recompensa por anticipado ni se teletransporte el héroe. **Resultado de esta nueva ejecución de CI aún pendiente**.
- Falta aceptación manual en navegador de las diez rutas con el mapa original y del movimiento por turnos; estas pruebas con rutas simuladas no garantizan que todas las rutas físicas sean transitables en la imagen real.


### Diagnóstico de respuesta de las nuevas ubicaciones (2026-11-12)

- A petición del jugador se revisó que los diez lugares nuevos se creen como botones reales en `drawWorldLandmarks()`, con coordenadas del catálogo y `onclick=()=>interactVerifiedSite(site)`. La existencia de un botón invisible no garantiza que un clic real del navegador lo alcance si hay capas superpuestas.
- Añadido `tests/p0-map-hotspot-clicks.test.cjs` (commits `9275eb1c` y `dbaaa4a6`): ejecuta la creación de hotspots para ambas variantes, comprueba los 30 botones y pulsa los diez nuevos para verificar el despacho al lugar correcto. **CI pendiente** al registrar este punto.
- **No afirmar aún aceptación en navegador:** falta comprobar orden de capas y captura real de eventos táctiles/ratón, distancias, obstáculos y mensajes al usuario en las diez ubicaciones. Las pruebas VM comprueban el cableado de eventos, no un navegador gráfico.


### Corrección de regresión en comprobación de clics (2026-11-12)

- Se analizó el fallo real de GitHub Actions `43204317174`: `tests/p0-map-hotspot-clicks.test.cjs` exigía **30** botones en `combate-demo.html`, pero su catálogo tenía **15** lugares anteriores más **10** nuevos = **25**. La variante principal `juego/index.html` sí tiene 20 anteriores más 10 nuevos = 30.
- Se corrigió el test (commit `50ba3788`) para comprobar el total correcto de cada variante y seguir pulsando y validando los **diez lugares nuevos** en ambas. No se alteraron ubicaciones, mapa ni lógica del juego. CI de corrección `43204513064` pendiente al documentarlo.


### Confirmación de CI de hotspots — 2026-11-12

- La ejecución de regresión `43204513064` correspondiente al commit `50ba3788` finalizó **completed / success** según GitHub Actions. La captura del jugador también mostraba el job `game-regression` verde.
- Se considera **corregido y cerrado el fallo del test de recuento** entre las variantes principal (30 puntos) y demo (25 puntos). Los diez nuevos hotspots pasan las comprobaciones automatizadas de creación de botones y despacho de clics en ambas variantes.
- Esta validación automática **no sustituye** la comprobación manual de que los clics lleguen a través de las capas del navegador y de que las rutas sean transitables en partida real.


### Corrección de respuesta perceptible de hotspots (2026-11-12)

- Tras el reporte del jugador de que los lugares nuevos no parecían funcionar, se modificaron `juego/index.html` (`eca7e0f2`) y `juego/combate-demo.html` (`f27eec3d`).
- `interactVerifiedSite()` ya no ignora silenciosamente los clics durante la marcha: explica que debe esperarse al fin del movimiento. Si no quedan puntos de movimiento, pide finalizar turno antes de volver a seleccionar el lugar.
- Los hotspots de recompensa reciben un área mínima de pulsación de 34×34 px, resaltado solo al pasar el cursor/enfocarlos, y los clics detienen propagación para evitar que una casilla inferior reciba el mismo evento. Se mantiene intacta la ilustración original y el catálogo de 30/25 lugares de las dos variantes.
- **Pendiente**: confirmar CI de `f27eec3d` (regresión `43204982997`) y prueba real del usuario. No afirmar que el problema de acceso a todos los lugares esté resuelto hasta confirmar clic y movimiento en navegador.


### Reparación de regresión tras mejora de hotspots (2026-11-12)

- El jugador aportó captura de `Game regression tests` en rojo para commit `eca7e0f2`. Se inspeccionaron registros de la ejecución `43204990177` (`f27eec3d`), que mostraron dos fallos de tests: mock DOM sin `classList.add()` en `p0-map-hotspot-clicks.test.cjs`, y aserción desactualizada del antiguo `b.onclick=()=>interactVerifiedSite(site)` en `p0-map-landmark-rewards.test.cjs`.
- Se corrigieron ambos tests sin deshacer las mejoras del juego: commits `5f033098` y `17894bbf`. La nueva ejecución de regresión `43208953858` queda **pendiente de resultado** al registrar este cambio.
- Mantener pendiente la aceptación manual del usuario: un CI verde comprueba el cableado, pero no garantiza por sí solo que todos los nuevos hotspots reciban clics en un navegador real.


### Confirmación de pruebas de clics y recompensas — 2026-11-12

- El jugador mostró captura de la ejecución `Game regression tests` del commit `17894bbf` en verde; comprobación adicional por API: ejecución `43208953858` con `status=completed` y `conclusion=success`.
- Se cierra la incidencia **de regresión automática** causada por mocks DOM y aserciones obsoletas tras cambiar los controladores de clic. No se da por cerrada la incidencia **de uso real** hasta que el jugador confirme que las nuevas ubicaciones responden en el mapa publicado.


### Corrección adicional: clics invisibles en diez ubicaciones (2026-11-12)

- El jugador confirmó que, pese a CI verde, al pulsar los nuevos elementos **no sucedía absolutamente nada**. No se considera validada la interacción real.
- Implementada captura de clic en el contenedor del mapa para las diez ubicaciones añadidas, calculando coordenadas porcentuales del clic y despachando `interactVerifiedSite(site)` cuando una casilla del mapa intercepta la pulsación. Se evita duplicar el evento si el objetivo ya es un `.world-hotspot`. Se mantienen los veinte puntos anteriores intactos y no se altera `mapa-grande.png`. Commits `7f5ffd37`, `880f283f`.
- Prueba ampliada en `tests/p0-map-hotspot-clicks.test.cjs` para simular clic sobre una casilla superpuesta (commit `75a301f8`). **CI pendiente:** ejecución `43210048136`.
- **Pendiente indispensable:** comprobar en navegador real con versión publicada que un clic en una de las diez ubicaciones produce movimiento o mensaje; si no, investigar capas fuera del contenedor, escala/offset del mapa y controles táctiles.


### Aceptación manual de los nuevos lugares del mapa — 2026-11-13

- **El jugador confirma expresamente que los nuevos elementos interactivos ya funcionan en una partida real** después de la corrección de captura de clics del mapa. Se cierra la incidencia concreta «al pulsar los diez nuevos lugares no sucede nada».
- La ejecución de regresión del commit `75a301f8` (`43210048136`) terminó en verde y la publicación de GitHub Pages del commit `8f57d8f1` (`43210082989`) terminó correctamente.
- El mapa principal conserva sus 20 ubicaciones previas y suma 10 nuevos lugares señalados por el jugador: **30 hotspots en total, 15 de recompensa**, sin modificar la imagen original.
- **Alcance de aceptación:** respuesta a la pulsación en los nuevos lugares confirmada por el jugador. No implica una validación individual de cada ruta, recompensa o comportamiento en todos los dispositivos; mantener esas verificaciones como tareas independientes si resultan necesarias.


### Balance de los diez nuevos lugares — 2026-11-13

- Tras la aceptación del jugador de los clics reales, se revisaron las recompensas de los diez lugares añadidos. Los cinco lugares originales conservan sus valores (**3 soldados, 55 PX base o 100 oro base**); los diez nuevos otorgan **2 soldados, 45 PX base o 80 oro base**, según su tipo. Siguen aplicándose los factores de campaña para oro y experiencia, y la recompensa se limita a una vez por nivel.
- Se detectó y corrigió una diferencia funcional: `juego/combate-demo.html` tenía los hotspots de tipo `relic`, pero no una rama `interactVerifiedSite()` que concediera sus recompensas. Se incorporó esa lógica, equivalente a la del juego principal. Commits `a92f2534`, `84a1cad3`.
- Añadido `tests/p0-landmark-reward-balance.test.cjs` para ejecutar las recompensas de los **15 lugares** en ambas variantes, comprobar valores originales/nuevos y evitar doble cobro (commit `ebfb108f`). **CI aún pendiente:** `43396537953`.
- Los 20 lugares antiguos y las posiciones de los 10 nuevos permanecen intactos; tampoco se altera `mapa-grande.png`. La aceptación manual de los clics continúa vigente; el balance de recompensas modificado requiere la nueva validación automática.


### Corrección de pruebas de balance tras reporte del jugador — 2026-11-13

- Captura de GitHub Actions del commit `ebfb108f` mostró regresión roja. Los registros de la ejecución `43396537953` identificaron dos causas: el test nuevo esperaba cinco reliquias originales en la demo, aunque su catálogo contiene solo las diez añadidas (`0 !== 5`), y el test estático antiguo exigía expresiones literales `campaignGoldIncome(100)`, `awardHeroExperience(55)` y `s.soldiers+=3` que fueron reemplazadas por cantidades condicionadas al origen del lugar.
- Ajustados los tests, **sin alterar la lógica de recompensas**: commits `44d3e709` y `7ffeedbd`. El test nuevo comprueba 5 originales + 10 nuevos en el juego principal, y 10 nuevos en la demo; el test antiguo acepta las nuevas expresiones de recompensa.
- Nueva regresión `43397261213` **pendiente** al registrar este cambio. No declarar verde hasta consultar su resultado.


### Cierre de verificación automática de balance — 2026-11-13

- El jugador presentó captura de la ejecución `#393` de `Game regression tests` correspondiente al commit `7ffeedbd`, en verde. Comprobación independiente en GitHub Actions: ejecución `43397261213` con `status=completed` y `conclusion=success`.
- Se **cierra la incidencia de pruebas de balance**: los valores de recompensa diferenciados entre los lugares originales y los diez nuevos superan la regresión automática en ambas variantes del juego. No se alteraron los 30 puntos del mapa principal ni la ilustración.
- La validación automática no sustituye una comprobación manual de cantidades recibidas durante una partida; mantenerla como verificación opcional antes del cierre completo de la fase 5.


### Fase 5 — Auditoría económica integral, primera pasada (2026-11-13)

- Revisadas fuentes reales de ingresos: minas tradicionales con trabajadores y mejoras (niveles 1/2/3: **10/25/50 cristales por turno** con tres trabajadores), tres minas visibles capturadas (**10 cristales/turno por mina**), castillos capturados (**15 oro base/turno por castillo**, ajustado por campaña), ingresos básicos por turno (40 oro base +25 por posesión de emplazamientos de campaña +mercado/facción), y cinco molinos visibles que generan provisiones para hasta **dos movimientos extra por turno**, con máximo total de siete.
- Reclutamiento: unidades de castillos con costes **30/50/110/300 oro** para soldados/arqueros/grifos/dragones; también existe reclutamiento básico y crecimiento de reservas de castillos. Los diez lugares añadidos aportan recompensas únicas (2 soldados, 45 PX base o 80 oro base), no ingresos periódicos.
- Añadida prueba de invariantes `tests/p0-economy-audit.test.cjs` (commit `57cf2920`) para verificar producción minera según nivel y trabajadores, escalado de oro de niveles 1–50, acumulación y límite de movimientos de molinos, y ausencia de ingresos de sitios no capturados. **CI pendiente:** `43398288042`.
- **Hallazgo de balance a vigilar:** al controlar los cinco molinos, se generan cinco provisiones por turno pero solo se consumen hasta dos; la reserva puede crecer hasta 20, aunque los movimientos están limitados a siete. No se modifican todavía los valores ni se reduce el beneficio de lugares ya aceptados sin una prueba comparativa de progresión.
- Pendiente simular progresión económica completa en los 50 niveles y comparar costes/ingresos en escenarios con pocos y muchos castillos; no declarar la auditoría integral cerrada solo con invariantes unitarios.
