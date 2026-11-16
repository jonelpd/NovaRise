# Diagnóstico de 44 accesos sobre la máscara candidata — 2026-11-16

## Fuente y alcance

Cálculo local sobre la imagen del usuario `mapa-rutas-marcadas(2).png` (1254×1254), la máscara candidata `turquoise-candidate-2026-11-16.json` (4146 celdas) y los centros de los 44 elementos del catálogo. La conectividad se recalculó con la regla antiesquinas del juego, obteniendo **14 componentes**.

**IMPORTANTE:** se ha medido proximidad geométrica desde el **centro del edificio**, no desde una puerta marcada; estos resultados **no autorizan rutas ni interacciones**.

## Riesgos de fragmentos cortos

| Elemento | Tamaño de componente más cercana | Riesgo |
|---|---:|---|
| castillo-costero | 16 celdas | La entrada automática podría seleccionar una ruta muy corta, aislada del camino útil |
| torre-isla | 22 celdas | Revisar conexión con la red principal |
| ruinas-isla | 22 celdas | Revisar conexión con la red principal |

## Elementos alejados de la ruta más cercana

| Elemento | Distancia (celdas de 160×160) |
|---|---:|
| mina-cueva-oeste | 7,77 |
| castillo-isla | 7,38 |
| castillo-central | 6,00 |
| mina-suroeste | 5,87 |
| torre-centro-este | 5,82 |
| mina-oeste | 5,70 |
| templo-norte | 5,27 |

Se ha generado el artefacto local `revision-44-entradas-candidatas-2026-11-16.json` con un registro para cada elemento (identificador, centro, celda más cercana, componente, tamaño y candidato alternativo de componente extensa), y `revision-44-entradas-candidatas-2026-11-16.png` con los 44 puntos sobre el mapa original.

## Decisión

- **No modificar** `juego/rutas-turquesa-160.json`: la candidata sigue fragmentada y puede contener puentes creados por dilatación.
- No presentar los puntos más cercanos como puertas verificadas.
- Priorizar castillo costero, castillo central, castillo isla, torre isla, ruinas isla y mina cueva oeste.
- Para cada elemento, verificar visualmente la puerta sobre el pincel turquesa, comprobar la componente y después ejecutar la interacción en navegador.
- Repetir la auditoría automática tras cualquier modificación del trazado.

**Estado:** diagnóstico de proximidad completado, **0 de 44 puertas aprobadas funcionalmente** en esta revisión.
