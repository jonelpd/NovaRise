# Castillo costero: identificación visual de la puerta — 2026-11-16

## Fuente

Inspección directa de `mapa-rutas-marcadas(2).png`, mapa original de 1254 × 1254 con anotaciones del usuario. Se realizó un recorte de la zona del castillo costero y una cuadrícula de coordenadas para no confundir el **centro del círculo rojo** con la **entrada del edificio**.

## Hallazgo

- Centro de catálogo del castillo: **(235, 124)** píxeles. Es el centro del área marcada en rojo, **no** la puerta.
- Puerta visual aproximada: **(275, 173)**, en el lado sureste de la construcción, junto a la escalinata.
- Tramo turquesa visible que bordea la ladera este: aproximadamente **(335, 218)**. La separación puerta-trazo es de aproximadamente **75 píxeles**, por lo que no se puede declarar automáticamente que la ruta llegue hasta la puerta.
- El punto turquesa más cercano al **centro** en la máscara activa fue diagnosticado como un **píxel aislado**; por tanto no debe usarse como puerta.
- La imagen original muestra el camino turquesa descendiendo por el lado este y continuando al sur, pero **no hay evidencia suficiente de un tramo turquesa hasta la escalinata**.

## Decisión técnica

1. **No** convertir el centro del círculo rojo en una puerta ni conectar automáticamente la escalinata con una línea recta.
2. **No** sustituir el trazado oficial por la candidata dilatada: puede unir caminos que no se tocan.
3. Registrar por separado `building_center_px`, `visual_gate_px` y `turquoise_approach_px` con estado `PENDING_ROUTE_VERIFICATION`.
4. Antes de activar el acceso, confirmar que la celda de aproximación existe en la máscara oficial, pertenece a una componente transitable y que el héroe puede alcanzarla.
5. Determinar si la interacción desde el camino adyacente a la ladera es la mecánica deseada o si el usuario prefiere extender el trazado turquesa hasta la puerta; no dibujar ese enlace sin autorización.

## Estado

**Puerta identificada visualmente de forma aproximada; acceso jugable NO verificado.** No se ha modificado `juego/rutas-turquesa-160.json` ni el juego en producción.
