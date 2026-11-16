# Revisión de uniones turquesas agrupadas — 2026-11-16

## Alcance y método

Fuente: `mapa-rutas-marcadas(2).png` y el diagnóstico local `revision-uniones-candidata-2026-11-16.json` (78 celdas añadidas que tocan componentes diferentes de la extracción base). Se agrupan las celdas en zonas mediante adyacencia de ocho vecinos **solo para organizar la inspección**, no para autorizar movimiento diagonal.

**Resultado: 78 celdas en 29 zonas.** No equivale a 29 conexiones falsas. Ninguna zona queda aprobada automáticamente.

Las coordenadas siguientes están en la máscara 160 × 160, no en píxeles de la imagen de 1254 × 1254.

| Zona | Centro (x,y) | Celdas sospechosas | Componentes base implicadas |
|---:|---|---:|---|
| 1 | (56.6,116.3) | 7 | 28–35, 30–34, 34–35 |
| 2 | (113.2,138.8) | 5 | 32–36 |
| 3 | (28.0,61.0) | 4 | 18–19, 19–20 |
| 4 | (32.5,63.8) | 4 | 16–20 |
| 5 | (130.0,147.0) | 4 | 32–38 |
| 6 | (20.0,17.0) | 3 | 4–7 |
| 7 | (5.3,28.7) | 3 | 10–13 |
| 8 | (28.0,55.7) | 3 | 15–18 |
| 9 | (18.0,79.3) | 3 | 16–23 |
| 10 | (22.0,82.3) | 3 | 22–23 |
| 11 | (137.0,94.7) | 3 | 21–28 |
| 12 | (92.0,106.7) | 3 | 21–28 |
| 13 | (116.5,11.5) | 2 | 1–2 |
| 14 | (119.5,16.0) | 2 | 1–8 |
| 15 | (148.5,16.5) | 2 | 1–6 |
| 16 | (42.5,25.5) | 2 | 11–12 |
| 17 | (25.5,53.5) | 2 | 12–15 |
| 18 | (103.5,60.5) | 2 | 1–14 |
| 19 | (152.5,85.5) | 2 | 25–26 |
| 20 | (21.5,99.5) | 2 | 22–29 |
| 21 | (49.5,101.5) | 2 | 22–28 |
| 22 | (60.5,107.5) | 2 | 28–30 |
| 23 | (67.5,108.5) | 2 | 30–31 |
| 24 | (72.5,110.5) | 2 | 31–33 |
| 25 | (74.5,111.5) | 2 | 28–33 |
| 26 | (146.5,147.5) | 2 | 32–39 |
| 27 | (148.5,148.5) | 2 | 39–40 |
| 28 | (130.5,152.5) | 2 | 32–40 |
| 29 | (8.0,25.0) | 1 | 9–10 |

## Prioridades visuales

- **Zona noroeste / castillo costero:** 6, 7, 16, 17. La cercanía de un tramo al castillo no acredita que exista puerta transitable.
- **Oeste y castillo suroeste:** 3, 4, 8, 9, 10, 20, 21.
- **Centro y acceso a la isla:** 1, 12, 22, 23, 24, 25.
- **Noreste nevado:** 13, 14, 15.
- **Este y zona volcánica:** 11, 18, 19.
- **Desierto sureste:** 2, 5, 26, 27, 28.

## Decisión

**No sustituir** `juego/rutas-turquesa-160.json`. Para aceptar cada unión, debe verificarse que los píxeles añadidos coinciden con el pincel turquesa visible en el mapa original y que no crean atajos por agua, roca o montaña. Luego repetir la auditoría estricta y comprobar las 44 entradas.
