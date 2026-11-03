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
