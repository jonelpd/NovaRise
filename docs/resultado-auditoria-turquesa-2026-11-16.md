# Resultado de la auditoría topológica (16-11-2026)

Fuente: artefacto real `turquoise-audit-report.json` del workflow **Audit turquoise map #3**, facilitado por el usuario.

## Resultados comprobados

- Resolución: **160 × 160**
- Celdas de ruta: **2.404**
- Componentes declaradas en JSON: **4**
- Componentes efectivas con las reglas de diagonales del juego: **9**
- Objetos del catálogo examinados: **44**
- Distribución de accesos por componente: **0: 28, 1: 1, 2: 4, 3: 1, 4: 2, 5: 0, 6: 1, 7: 6, 8: 1**.
- Tamaños de componentes: **0: 1604, 1: 1, 2: 256, 3: 1, 4: 119, 5: 16, 6: 12, 7: 394, 8: 1**.

## Cortes de menor distancia entre componentes

| Componentes | Distancia en celdas | Extremos de la máscara 160×160 | Interpretación |
| --- | ---: | --- | --- |
| 0 y 2 | 1,414 | (117,12) ↔ (116,11) | Diagonal no transitable con la regla antiesquinas |
| 0 y 4 | 1,414 | (29,62) ↔ (28,61) | Diagonal no transitable |
| 0 y 8 | 1,414 | (49,119) ↔ (48,118) | Píxel aislado |
| 1 y 2 | 1,414 | (63,8) ↔ (64,9) | Píxel aislado |
| 3 y 4 | 1,414 | (41,24) ↔ (42,25) | Píxel aislado |
| 0 y 5 | 7,000 | (158,76) ↔ (158,83) | Brecha mayor; requiere revisión visual |
| 0 y 6 | 7,280 | (84,92) ↔ (77,90) | Brecha mayor; requiere revisión visual |
| 0 y 7 | 7,280 | (137,103) ↔ (139,110) | Brecha mayor; requiere revisión visual |

**Nota:** no se debe unir automáticamente ningún par. La cercanía de los extremos no prueba que el autor haya dibujado una conexión.

## Elementos más alejados del camino más cercano

| Elemento | Distancia en celdas | Componente asignada |
| --- | ---: | ---: |
| castillo-costero | 13,72 | 3 (píxel aislado) |
| castillo-central | 7,41 | 2 |
| castillo-isla | 7,38 | 7 |
| mina-cueva-oeste | 6,84 | 4 |
| mina-suroeste | 5,86 | 0 |
| torre-centro-este | 5,82 | 0 |
| mina-oeste | 5,71 | 0 |
| castillo-suroeste | 5,51 | 0 |
| castillo-nevado | 5,37 | 0 |

**Hallazgo crítico:** el algoritmo `nearestTurquoise` puede seleccionar una componente de una sola celda como acceso a un castillo. El caso más evidente es `castillo-costero`, asignado a la componente 3, que solo tiene un píxel. Esa entrada no puede ser recorrida desde la red principal.

## Estado y acciones

1. Confirmar visualmente el trazado turquesa en los cortes identificados; usar la última imagen marcada por el usuario, no reconstruir rutas imaginarias.
2. Impedir que un píxel aislado se considere una entrada válida de edificio.
3. Asegurar que las entradas elegidas pertenezcan a componentes navegables y sean accesibles desde el héroe.
4. Regenerar la máscara solo tras verificar la geometría y repetir la auditoría.
5. Probar manualmente interacción y rutas de los 44 elementos.

La ejecución verde **solo valida la generación del informe**, no la conectividad ni la jugabilidad.
