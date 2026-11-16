# Auditoría de la máscara candidata mejorada — 16 de noviembre de 2026

**Fuente:** imagen del usuario `mapa-rutas-marcadas(2).png` (1254 × 1254) y las posiciones de los 44 elementos del informe de GitHub Actions. **No es la máscara activa del juego.**

## Extracción reproducible

```bash
python scripts/extract-turquoise-candidate.py "mapa-rutas-marcadas(2).png" --threshold 12 --expand --output turquoise-candidate.json
node scripts/audit-turquoise-map.cjs --mask=turquoise-candidate.json --json
```

Se corrigió además un posible desbordamiento de `uint8` en la comparación `b > g + 20` (commit `32759a46`).

## Resultado medido localmente

- **4.146 celdas de camino**, resolución 160 × 160.
- **14 componentes estrictas** con la regla antiesquinas utilizada por el juego.
- Tamaños de componentes: **1934, 1237, 606, 106, 80, 31, 24, 22, 17, 16, 14, 11, 11, 10**.
- 44 de 44 elementos analizados, pero **ninguna entrada queda visualmente aprobada por este cálculo automático**.
- Distribución de la componente más cercana a los elementos: componente 6 → 21 sitios; 1 → 14; 11 → 6; 10 → 2; 2 → 1.
- Tres edificios están asociados a fragmentos pequeños: **castillo-costero** (componente 2, 16 celdas), **torre-isla** y **ruinas-isla** (componente 10, 22 celdas).

## Entradas prioritarias

| Elemento | Distancia a la ruta más cercana (celdas) | Componente | Observación |
| --- | ---: | ---: | --- |
| mina-cueva-oeste | 7,77 | 6 (1934 celdas) | Entrada alejada |
| castillo-isla | 7,38 | 11 (606 celdas) | Revisar puente y acceso |
| castillo-central | 6,00 | 1 (1237 celdas) | Revisar entrada junto al puente |
| mina-suroeste | 5,87 | 6 (1934 celdas) | Entrada alejada |
| torre-centro-este | 5,82 | 1 (1237 celdas) | Entrada alejada |
| mina-oeste | 5,70 | 6 (1934 celdas) | Entrada alejada |
| castillo-costero | 4,11 | 2 (16 celdas) | **Fragmento corto**; componente 0 (106 celdas) a 4,93 celdas |

**Importante:** estas distancias se miden desde el centro visual de cada edificio, no desde una puerta identificada manualmente. No equivalen a accesibilidad real.

## Decisión de despliegue

**NO desplegar todavía.** La reducción de 63 a 14 componentes se consiguió mediante expansión 2 × 2 y puede producir uniones falsas. Deben revisarse en el mapa original todos los enlaces creados por esa expansión, definir puertas verificadas y comprobar el recorrido de cada uno de los 44 elementos antes de sustituir `juego/rutas-turquesa-160.json`.
