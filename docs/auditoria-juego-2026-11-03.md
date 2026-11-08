# Auditoría técnica y de jugabilidad — NovaRise: Reinos de Leyenda
Fecha: 2026-11-03
Base: rama main; revisión estática de juego/index.html y juego/combate-demo.html. Referencia de diseño: experiencia de exploración, gestión y combate por turnos de Heroes of Might and Magic III, sin copiar recursos protegidos.

## Alcance verificado
- Inspección del código de movimiento, interacción con tesoros, diálogos, castillos, molinos, héroes, combate, guardado local e importación.
- Comparación estructural de la implementación de las dos páginas.
- Búsqueda de llamadas nativas a confirm() y prompt(): 0 en ambas páginas después de los cambios recientes.
- Verificación estática de que existen las funciones de protección de importación durante combate, recompensas semanales de molinos, bonificaciones de artefactos y ventanas personalizadas.
- No se ha ejecutado el juego en navegador real ni la batería Node de pruebas; no equivale a una auditoría visual o funcional completa.

## Hallazgo P0 — CORREGIDO
**Desplazamiento automático y elección de tesoros.** La rutina asíncrona de caminar llamaba move(x,y) sin esperar su promesa. Al introducir decisiones asíncronas en cofres, la ruta podía continuar antes de terminar la elección. Se cambió a await move(x,y) y se verifica la vigencia del recorrido después de la espera en las dos páginas. Commits: 3b84e6b (principal) y 7317712 (demo).

## Hallazgos y riesgos pendientes
### P1 — pruebas automatizadas no ejecutadas
Existen pruebas de combate, asedios, importación y restauración de nube, pero no se han ejecutado desde este entorno. Ejecutar Node test runner en CI con registro de resultados y corregir fallos. No cerrar esta tarea por inspección estática.

### P1 — comprobación visual real
Validar escritorio y móvil: overlays de elección de cofres, reclutamiento y guarnición, confirmación de reinicio, importación, nube, apodo y defensa de castillo; foco de teclado, desplazamiento, tamaño, superposición y retorno al mapa. No se dispone de navegador gráfico en esta ejecución.

### P1 — persistencia y compatibilidad
Probar partidas anteriores a las nuevas propiedades opcionales (millVisits, treasureFinds, experience), exportación/importación v10, cambio de usuario y restauración de nube con fallos de almacenamiento. Confirmar que las recompensas no se duplican tras recargar.

### P1 — flujo de elección de cofre
El botón de cierre mediante Escape en una decisión de experiencia/oro se interpreta actualmente como elección de oro. Evaluar una política explícita de cancelación para evitar sorpresas, sin dejar el cofre marcado como recogido por accidente.

### P2 — coherencia visual y UX inspirada en Heroes III
Unificar la iconografía de tesoros, minas y castillos, tipografía y escala de botones, contraste y estados de foco; confirmar que el mapa ilustrado y los elementos interactivos coinciden espacialmente. La comprobación de calidad gráfica necesita capturas reales.

### P2 — profundidad de juego y equilibrio
Medir economía de oro/cristales, frecuencia de molinos, poder de espada y escudo, velocidad de subida de nivel, reclutamiento, guarniciones, asedios, IA rival y dificultad. Evitar recompensas excesivas y distinguir claramente recursos del juego de NVRA.

### P2 — mantenimiento
Las dos páginas contienen gran cantidad de lógica embebida y duplicada. Planificar extracción progresiva a módulos compartidos sin reescribir el juego ni crear fases adicionales del Plan Maestro.

## Criterio de cierre
La auditoría solo estará completa cuando pasen pruebas automatizadas y una matriz manual de exploración, combate, castillos, cuentas, guardado y visual móvil/escritorio. Esta primera entrega es una revisión estática con una corrección P0 integrada.

## Segunda revisión — 2026-11-03

### P1 — CORREGIDO: cierre de selección de cofre
En la versión anterior, pulsar Escape durante la elección de oro/experiencia devolvía null y la lógica interpretaba ese resultado como oro. Ahora la elección del cofre exige pulsar expresamente una de las dos opciones; Escape no descarta esa decisión. Commits: 50dd142 (principal) y 67b4394 (demo).

### P2 — CORREGIDO: confirmación por teclado
Los campos de entrada de los diálogos ahora permiten confirmar mediante Enter, además del botón. Se conserva la navegación por Tab y Shift+Tab.

### P1 — pendiente: cobertura de persistencia en decisiones interrumpidas
El tesoro se marca como recogido antes de abrir la elección; la nueva ventana impide cancelarlo con Escape, pero todavía hay que probar cierre de pestaña, recarga y restauración durante el diálogo. Propuesta: registrar la decisión como transacción lógica y consolidar recompensa y estado del tesoro en el mismo paso, con pruebas de interrupción.

### P1 — pendiente: diferencia de validadores
La carga local y la restauración online tienen validadores de alcance distinto. Deben probarse campos obligatorios, límites de recursos, propiedades opcionales heredadas y compatibilidad de versiones antes de armonizarlos.

### P2 — pendiente: desempeño de mapa
La rutina render() reconstruye los botones de todas las casillas y persiste el estado. Medir frecuencia de redibujado, coste de rutas y respuesta en móviles de gama media antes de optimizar.

### Estado de esta revisión
Los dos arreglos se han integrado en main; siguen sin ejecutarse pruebas en navegador o Node. No se declara finalizada la auditoría.

## Tercera revisión — 2026-11-06

### P1 — CORREGIDO: orden de registro de recompensas
El código registraba `s.taken.push(k)` y `recordMapTreasure(k)` antes de esperar la elección asíncrona de oro o experiencia. Se trasladaron ambas operaciones después de resolver la elección, antes de otorgar los recursos. Esto evita consumir un cofre si la página se cierra antes de que el usuario elija. Commits: 659afd9 (principal), c06afc1 (demo).

### P1 — CORREGIDO: movimiento durante diálogos
La función move() comprueba ahora la presencia de `.realm-dialog` y rechaza nuevos movimientos mientras esté abierto un diálogo, evitando que una interacción externa interfiera con la selección.

### P1 — pendiente de verificación funcional
Comprobar con navegador real: cerrar la pestaña durante una elección, reabrir, volver al cofre, elegir oro o experiencia, guardar y recargar; verificar que no se duplica ni pierde recompensa. Ejecutar pruebas de importación, nube, asedios y combates. La inspección del código no equivale a pruebas ejecutadas.

## Cuarta revisión — 2026-11-06: integridad de guardados

### P0 — CORREGIDO EN CÓDIGO: guardado local inválido
La rutina anterior de load() invocaba start() cuando el JSON no cumplía las condiciones. start() llamaba render(), que escribía el estado nuevo sobre el guardado original. Ahora, ante datos inválidos, intenta guardar una copia con sufijo de recuperación y fecha, anula STORE durante la sesión y muestra una advertencia. El guardado original no se sobrescribe automáticamente. Nota: la copia de recuperación es adicional y puede fallar si el almacenamiento está lleno; el original permanece sin sobrescribir. Commits: 26cfde1 y b249c25.

### P1 — CORREGIDO EN CÓDIGO: validadores inconsistentes
En la página principal se unificó validGame para carga local, importación v10 y restauración en nube, comprobando límites de turnos, recursos, tropas, colecciones y facción. En la demo se incorporó el mismo criterio y validImport. Commit adicional: d293372.

### Riesgos que permanecen
- Validación estática: todavía no se ha ejecutado un navegador con archivos válidos e inválidos ni las pruebas Node.
- Compatibilidad histórica: las partidas antiguas que no incluyan campos exigidos podrían rechazarse y requerir recuperación o migración. Se conservan sin sobrescribir, pero no se migran automáticamente.
- La restauración en nube requiere pruebas con fallo de escritura y rollback, además de verificar titularidad por usuario.
- Los datos de la nube se validan antes de restaurarse, pero no se ha hecho una auditoría de políticas RLS ni de permisos de Supabase.

### Pruebas manuales necesarias
1. Cargar una partida válida, mover héroe, guardar, recargar y comprobar recursos y ubicación.
2. Introducir JSON inválido en la clave local de prueba y comprobar que no se sobrescribe.
3. Importar una partida v10 válida y una con valores fuera de límites; confirmar que la inválida se rechaza.
4. Restaurar una partida desde la nube y comprobar la copia local de seguridad previa.
5. Repetir en móvil y escritorio con cuentas de prueba y sin afectar campañas reales.

## Quinta revisión — 2026-11-06: automatización de regresiones

- Se adaptó tests/p0-import.test.cjs para cargar el validador compartido validGame junto con validImport (commit eff8963).
- Se adaptó tests/p0-cloud-restore-main.test.cjs a realmConfirm asíncrono (commit 7a140e7).
- Se añadió .github/workflows/game-regression.yml para ejecutar node --test tests/p0-*.test.cjs en push y pull requests relevantes (commit e83392f).
- Se añadió tests/p0-local-save-integrity.test.cjs para comprobar conservación del JSON inválido y restauración de partida válida en ambas páginas (commit 916597d).

**Limitación:** el flujo está configurado, pero no se han obtenido ni revisado registros de ejecución; no se puede afirmar que las pruebas hayan pasado. Próximo paso: inspeccionar los resultados de GitHub Actions, corregir cualquier fallo, y realizar pruebas manuales de nube, combate y visualización.

## Sexta revisión — 2026-11-08: auditoría de las pruebas

- Se añadió tests/p0-save-validator.test.cjs con casos válidos e inválidos de guardado y comprobaciones estáticas de movimiento/ventanas.
- Se corrigió el aislamiento de funciones en tests/p0-save-validator.test.cjs (commit da1d140) y tests/p0-import.test.cjs (commit 8f0bc96) para evitar ejecutar inicializadores de la interfaz durante las pruebas de validación.
- La consulta de estados y ejecuciones de GitHub para el commit de pruebas anterior no devolvió registros. Se intentó obtener una copia del repositorio para ejecutar Node localmente, pero la conexión falló por resolución DNS.

**Resultado honesto:** cobertura ampliada y código de pruebas corregido, sin confirmación de ejecución satisfactoria. Abrir GitHub Actions y revisar el flujo Game regression tests; si falla, descargar los logs y reparar los casos concretos antes de declarar completada la fase.

## Incidencia crítica de arranque — 2026-11-08

El usuario informó que el juego no funcionaba. La inspección directa de los scripts embebidos detectó un fallo de sintaxis bloqueante: `async async function rivalTurn()` en ambos HTML. Se corrigió a `async function rivalTurn()` (commits 504be84 y 2b57fdc).

Se detectó también un fallo de ámbito: `load()` del script clásico usaba `validGame()` declarada en un módulo ES separado en la versión principal, por lo que no podía resolver esa función desde el motor clásico. Se trasladó la declaración al script clásico antes de `load()` (commit 1c5748c).

Se compilaron todos los scripts clásicos embebidos en ambas páginas mediante `new Function`, sin errores de sintaxis después de las correcciones. Se añadió una prueba de regresión de compilación y ámbito `tests/p0-game-bootstrap-syntax.test.cjs` (commits f883201, d9ec414).

**Alcance y límites:** la comprobación de sintaxis NO equivale a una prueba de funcionamiento en navegador. No se ha validado el inicio de sesión, carga real desde Supabase, renderizado, movimiento, combates, compatibilidad móvil ni módulos ES. Se requiere prueba de extremo a extremo y revisar consola del navegador antes de considerar resuelta la incidencia de funcionamiento.

## Auditoría de continuación — 2026-11-08
- El usuario confirmó que el juego vuelve a funcionar tras las correcciones de arranque.
- Se encontró un fallo de ejecución en `updateNvraCenter()`: la constante local `mines` (elemento DOM) ocultaba el array `mines` del mapa, y su referencia anterior a la inicialización provocaba un `ReferenceError` al abrir el Centro NVRA.
- Se renombró el elemento DOM a `mineDisplay` en ambas versiones, sin alterar los datos de partida ni los identificadores del mapa (commits b4cdecd y 4034852).
- Se amplió `tests/p0-nvra-ui.test.cjs` para impedir la reintroducción de esa colisión (commit 82c5281).
- Pendiente de verificar en navegador el Centro NVRA, el flujo de combate, guardado/restauración y compatibilidad móvil. No se ha activado ninguna recompensa real de tokens.

## Auditoría del turno rival — 2026-11-08
- Se inspeccionó el flujo del botón «Terminar turno» y la función asíncrona `rivalTurn()`.
- El botón invocaba la función sin gestionar rechazos de la promesa; un error inesperado podía quedar sin comunicar y dificultar la recuperación de la interfaz.
- Se incorporó un manejador `.catch()` que registra el fallo en consola, libera `rivalBusy`, vuelve a dibujar la interfaz y muestra un aviso al jugador. No se repite automáticamente el turno para evitar aplicar ingresos por duplicado.
- Se aplicó a juego principal y demo (commits 93f1a2e, 251df74, 464c676, ed4ba4b).
- Se amplió la prueba `tests/p0-game-bootstrap-syntax.test.cjs` para comprobar la existencia del manejo de rechazos (commit 0c717db).
- **Pendiente:** pruebas reales de turnos, conquistas y asedios con navegador; la prueba estática no valida la ejecución completa de la IA.

## Continuación — 2026-11-08: seguridad de turnos y asedios
- **P1 corregido en ambas versiones:** el bloqueo `rivalBusy` se mantenía solo hasta empezar la decisión asíncrona de defensa de castillo. Durante la ventana de confirmación podía iniciarse otro turno rival, aplicando economía y otros efectos dos veces. Ahora el bloqueo se libera después de resolver la elección y cualquier encuentro pendiente; el control se vuelve a dibujar al finalizar. Commits: `c26b563` y `6d5aa99`.
- **P1 corregido en ambas versiones:** `launchDefensiveSiege` no protegía el caso de guarnición sin criaturas. En ese caso podía sustituir el ejército del héroe por uno vacío antes de iniciar combate. Ahora deriva a la resolución automática y conserva intactas las tropas del héroe.
- Nueva prueba `tests/p0-siege-turn-lock.test.cjs`: comprueba el orden del desbloqueo respecto al `await realmConfirm` y ejecuta el caso de guarnición vacía con el código real aislado (commit `bed0eb5`).
- **Verificación pendiente:** falta confirmar la ejecución exitosa de las pruebas Node/CI y probar el diálogo, asedio dirigido y automático, reconquista, derrota y recarga en navegador real. Se mantiene suspendida cualquier recompensa NVRA real.
