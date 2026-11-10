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
