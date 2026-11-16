# Revisión visual de accesos de castillos — 2026-11-16

## Material examinado
- Imagen original marcada por el usuario: `mapa-rutas-marcadas(2).png` (1254 × 1254).
- Inventario `grupos-uniones-turquesas-2026-11-16.json` (29 zonas, 78 celdas candidatas de puente).
- Diagnóstico de proximidad `turquoise-candidate-sites-2026-11-16.json`.

La inspección es **visual**, no una prueba de desplazamiento ejecutada en navegador. Los círculos magenta del montaje son **puntos de revisión**, no entradas aprobadas. Las líneas de colores de otros elementos son anotaciones del usuario y no deben convertirse en rutas.

| Castillo | Centro en imagen | Componente más cercana en candidata | Tamaño | Distancia al trazo (celdas) | Observación visual y acción |
| --- | --- | ---: | ---: | ---: | --- |
| Costero | (235,124) | 2 | 16 | 4,11 | El trazado turquesa visible se aproxima por el sureste, mientras hay puntos de revisión 6 y 16 en bordes del castillo. No seleccionar automáticamente un fragmento de 16 celdas como puerta. |
| Central | (641,303) | 1 | 1237 | 6,00 | Revisar la conexión del camino turquesa junto al puente y la entrada sur/este; no atravesar el río ni la fortaleza por proximidad. |
| Isla | (685,1052) | 11 | 606 | 7,38 | El trazo visible se acerca por el lado oriental; revisar el paso real. La zona 25 está más al norte y no prueba una puerta en el castillo. |
| Suroeste | (172,710) | 6 | 1934 | 4,71 | Zonas 9, 10 y 20 cercanas a los caminos de aproximación; comprobar que la dilatación no cruce la montaña ni el salto de agua. |
| Nevado | (1113,86) | 1 | 1237 | 4,10 | Zonas 13, 14 y 15 cercanas a los caminos del entorno; no abrir atajos entre lago, hielo y montaña. |
| Volcán | (1140,618) | 6 | 1934 | 1,91 | Zonas 11 y 19 próximas; mantener el paso por el trazo turquesa, sin conectar sobre lava o roca. |

## Resultado

- Se preparó un montaje de seis ampliaciones sobre el mapa marcado para contrastar los trazos y las 29 zonas de posible unión.
- **Ninguna entrada se considera validada todavía.** Las distancias calculadas se refieren al centro visual del edificio, no a una puerta confirmada.
- La candidata ensanchada de 14 componentes **sigue rechazada para despliegue**. No se modifica `juego/rutas-turquesa-160.json`.
- Siguiente tarea técnica: determinar coordenadas de puertas sobre el trazo visible, verificar conectividad con las reglas antiesquinas y ejecutar pruebas de rutas e interacciones de los 44 elementos.
