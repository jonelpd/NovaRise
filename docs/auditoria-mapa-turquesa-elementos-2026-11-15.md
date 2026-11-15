# Auditoría técnica del mapa turquesa y de sus 44 elementos
Fecha: 2026-11-15 · Estado: **abierta, no certificada**.

## Fuente de verdad y alcance
- Plan maestro: `docs/plan-maestro-reinos-de-leyenda.md`.
- Fondo en uso: `juego/mapa-reinos-2048.jpg`.
- Máscara de rutas aprobada como *fuente visual*: `juego/rutas-turquesa-160.json` (160×160, 2404 celdas, cuatro componentes).
- Inventario de elementos: `docs/catalogo-elementos-mapa-nuevo.json`, derivado del mapa anotado del usuario, con centros **estimados** en coordenadas de la imagen de 1254×1254.
- Colores: rojo castillos (7), amarillo minas (10), azul molino (1), verde recompensas (15), morado reclutamiento (11).
- Los círculos indican construcciones, no necesariamente puertas ni puntos de acceso. La imagen marcada original no está versionada en este repositorio; **no se puede certificar visualmente la exactitud de los 44 centros sin contrastarla**.

## Hallazgos confirmados por lectura del código y el plan
| ID | Severidad | Hallazgo | Evidencia en código | Acción exigida |
| --- | --- | --- | --- | --- |
| MAP-01 | Crítica | La máscara turquesa contiene cuatro componentes. No es una red continua aprobada. | `rutas-turquesa-160.json` declara `connected_components:4`; `turquoiseRoadRoute` devuelve null si no hay conexión. | Revisar las cuatro componentes sobre la imagen marcada y **solo** unir pasos realmente trazados, puertas y puentes existentes. |
| MAP-02 | Alta | `fineRoute` permite `tracedRoadRoute` y `terrainFineRoute(a,b,true)` si no existe trayecto turquesa; la penalización no prohíbe salir de la ruta. | `juego/index.html`, función `fineRoute`. | Eliminar el fallback fuera de las rutas **cuando la red haya sido validada y conectada**; mientras tanto, no anunciar navegación estricta. |
| MAP-03 | Alta | Los accesos de los 44 elementos se infieren automáticamente mediante `nearestTurquoise` desde el centro del círculo, con radio máximo 32 celdas. Puede seleccionar una vía cercana que no sea la puerta real. | `siteAccessPoint`, `nearestTurquoise`. | Crear coordenadas de puerta/acceso explícitas y revisadas para cada ID, con componente de ruta y distancia a la puerta. |
| MAP-04 | Alta | La cuadrícula estratégica heredada 10×10 y la malla de obstáculos 80×80 siguen determinando trayectos y alcance, aunque la fuente visual es 160×160. | `findRoute`, `terrainFineRoute`, `safeHeroPoint`, `interactVerifiedSite`. | Verificar que los 44 destinos son alcanzables desde una partida nueva y una restaurada, sin saltos entre caminos. |
| MAP-05 | Alta | `interactVerifiedSite` elige el candidato con **menor coste de ruta** entre casillas a menos de 7,5 puntos porcentuales del acceso, sin priorizar cercanía final al acceso. Puede parar en una casilla que no alcance el edificio. | `interactVerifiedSite`, `candidates.sort((a,b)=>a.score-b.score)`. | Ordenar por alcance final y después coste; rechazar candidatos que no permitan activar la interacción. |
| MAP-06 | Media | La autoridad de minas del servidor almacena las posiciones de los centros estimados, no las puertas turquesas. | `server/nvra-authoritative-mines.cjs`, `MAX_INTERACTION_DISTANCE=8`. | Alinear validación de interacción del servidor con puertas revisadas, sin permitir capturas remotas. |
| MAP-07 | Alta | El catálogo declara `integrated_approximate_access_auto_snapped` en las 44 entradas; el nombre no implica accesos aprobados. | `docs/catalogo-elementos-mapa-nuevo.json`. | No cerrar integración hasta verificar cada puerta y su efecto. |
| MAP-08 | Alta | La versión itch.io y los guardados requieren pruebas en navegador real, no solo paridad de archivos. | Pendientes del plan maestro. | Ejecutar la matriz E2E en ambas ediciones y comprobar persistencia y duplicados. |

## Matriz funcional por categoría
- **7 castillos rojos:** entrada por puerta/camino, ocupación, asedio, defensores, cambio de propietario, persistencia.
- **10 minas amarillas:** acceso físico, conquista, propiedad, 10 cristales por turno por mina controlada según el plan vigente, sin doble producción, coherencia cliente-servidor.
- **1 molino azul:** acceso y recompensa/producción conforme a la regla existente, sin entrega duplicada.
- **15 recompensas verdes:** acceso, elección de oro/experiencia/tesoro según cada evento, una sola recogida y persistencia tras recarga.
- **11 edificios morados:** acceso, reclutamiento una vez por semana, bloqueo de segunda visita, nueva disponibilidad la semana siguiente, persistencia.

## Procedimiento de aceptación (repetir para cada uno de los 44 IDs)
1. Identificar el edificio real sobre el **mapa marcado original** y registrar centro, puerta, camino turquesa de entrada y componente conectada.
2. Comprobar que el marcador y el área clicable corresponden al edificio y no al círculo de otra categoría.
3. Trazar ruta desde el héroe y comprobar cada paso, incluidos puentes, agua, murallas y obstáculos.
4. Llegar a la puerta sin atravesar terreno prohibido, activar la función y verificar los recursos/unidades/propiedad.
5. Guardar, recargar y repetir para descartar duplicados; comprobar la misma secuencia en itch.io.
6. Guardar captura, resultado y commit. Marcar **APROBADO** solo después de ejecución real.

## Política de corrección
No conectar automáticamente componentes por cercanía geométrica; no cambiar IDs existentes ni el esquema de guardado sin migración; no usar imágenes con anotaciones como fondo de juego; no publicar resultados no verificados. Los cambios de navegación deben tener pruebas automatizadas y validación interactiva, con reversión sencilla.

## Estado de cierre
**PENDIENTE**: contraste visual directo con el mapa marcado original, puertas de 44 sitios, rutas entre componentes, ejecución de pruebas completas y validación en navegadores de NovaRise/itch.io. Esta auditoría documental no acredita todavía corrección funcional.


## Contraste visual con imagen original marcada (recibida 2026-11-15)
Se ha recibido y abierto `mapa-rutas-marcadas(2).png` (1254×1254, RGBA). Esta es la referencia visual primaria de esta auditoría; no se deben inferir puertas a partir de centros de círculos. La leyenda se confirma directamente: rutas turquesas, castillos rojos, minas amarillas, molino azul, recompensas verdes, reclutamiento morado.

### Zonas de riesgo observables que requieren pruebas por trayecto
1. **Castillo costero noroeste**: entrada al sur/sureste del recinto; comprobar continuidad del camino turquesa y que el héroe no cruce murallas.
2. **Castillo central y puente oriental**: el acceso está vinculado al puente sobre agua; verificar que la ruta usa el puente y no el río ni el cuerpo del castillo.
3. **Castillo nevado noreste**: verificar el acceso a través del corredor de montaña y no por el lago helado o la ladera.
4. **Castillo suroeste**: acceso junto a agua/cascada; revisar puente, puerta y conectividad con la ruta principal.
5. **Castillo isla sur**: camino por puente estrecho desde tierra; comprobar no permitir cruzar agua.
6. **Castillo volcánico oriental**: la ruta pasa entre lava, riscos y fortaleza; evitar accesos por la ladera o sobre lava.
7. **Castillo del desierto sureste**: comprobar la entrada por el camino turquesa del oasis, no por las murallas ni las dunas.
8. **Molino oriental**: hay una ruta que rodea el molino y pasa por edificaciones; comprobar que la zona clicable corresponda al molino azul y no a la casa/torre adyacente.
9. **Minas amarillas en cuevas y montañas**: comprobar que cada acceso termine en la boca de la mina, no en el centro de la montaña; atención a la mina al noroeste, la central y las del noreste.
10. **Recompensas verdes y reclutamiento morado próximos a rutas**: algunas torres/casas están pegadas a bifurcaciones; verificar que los clics no activen edificios vecinos y que cada entrada esté conectada al tramo correcto.

### Comprobación cruzada con el catálogo actual
- El catálogo contiene exactamente **7 castillos, 10 minas, 1 molino, 15 recompensas y 11 reclutamientos**, coherente con el inventario de trabajo previo.
- Se preservan sus 44 IDs de juego para no invalidar guardados.
- Se observan identificadores heredados semánticamente discordantes: `molino-oriental` usa `game_id:mill-west`; `templo-norte` usa `game_id:relic-desert-well`; `casa-oeste` usa `game_id:relic-east-ruin`. **No renombrar directamente**: primero separar nombre visual de ID persistente y verificar qué recompensa corresponde a cada objeto.
- La imagen no demuestra por sí sola que cada centro o puerta sea exacto. Mantener `access_pending` hasta pruebas.

### Orden de corrección aprobado
1. Capturar y revisar explícitamente las **44 puertas** contra esta imagen, registrando coordenada de entrada, segmento turquesa y componente.
2. Auditar los cuatro componentes de máscara para identificar cortes de extracción versus discontinuidades reales, **sin unir automáticamente por proximidad**.
3. Corregir las rutas estrictas y la interacción de entrada, con pruebas de navegación, obstáculos y guardado.
4. Validar efectos de cada elemento (asedios, minas, molino, recompensas y reclutamiento) y paridad NovaRise/itch.io.
5. Mantener congelada la animación del caballo mientras se estabiliza esta fase.

**Estado:** revisión visual preliminar efectuada; accesos aún no aprobados individualmente. Ningún resultado de navegador o CI nuevo se da por comprobado en este apartado.
