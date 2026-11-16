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


## Decisión del usuario — 2026-11-16

El usuario ha elegido explícitamente **prolongar el camino turquesa hasta la escalinata** del castillo costero, en lugar de permitir interacción desde el camino situado en la ladera. Este criterio debe guiar las entradas de los demás castillos.

### Condiciones de implementación

- Ramal local desde el camino turquesa de la ladera oriental hacia la escalinata, sin modificar los caminos existentes ni abrir atajos hacia otras zonas.
- Las coordenadas visuales aproximadas `(335,218)` para la aproximación y `(275,173)` para la escalinata son **referencias de diseño**, no una polilínea aprobada píxel por píxel.
- Antes de publicar la máscara, trazar y revisar la geometría sobre la imagen original, comprobar que no cruza elementos no transitables y confirmar que conecta con una componente utilizable de la máscara activa.
- Actualizar el mapa y el acceso del juego conjuntamente; verificar que el héroe recorre el ramal y llega hasta la escalinata antes de activar la interacción.

**Estado:** criterio aprobado por el usuario; geometría exacta, implementación y pruebas pendientes.
