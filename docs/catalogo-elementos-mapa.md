# Catálogo de elementos del mapa — anotación del usuario (2026-11-01)

Fuente de referencia: imagen del mapa señalada por el usuario en la conversación. **Las marcas son anotaciones externas, no forman parte del mapa jugable.** Se conserva la ilustración original, dimensiones y posiciones.

## Clasificación autorizada

| Marca | Identificación | Función prevista |
|---|---|---|
| Doble círculo blanco, extremo superior izquierdo | Castillo principal del jugador | Base, construcción, reclutamiento y defensa |
| Doble círculo blanco, extremo inferior izquierdo | Castillo principal enemigo | Base del rival, objetivo estratégico |
| Círculos blancos simples | Castillos independientes conquistables | Recursos, guarnición y nuevas criaturas |
| Círculos rojos | Minas de oro o cristales | Producción tras control o conquista |
| Círculos amarillos | Molinos | Producción de comida para recuperar puntos de movimiento diarios |

## Observaciones visuales de la imagen anotada

- Los castillos independientes señalados incluyen estructuras en el sector superior derecho, centro-izquierda, centro, centro-derecha y sector sur junto al lago.
- Los círculos rojos señalan estructuras en la zona árida central y oriental; el mineral concreto de cada una **no está todavía asignado**.
- Los círculos amarillos señalan molinos alrededor del lago central y uno junto al lago inferior.
- Las ubicaciones anteriores son descripciones visuales, **no coordenadas de casilla verificadas**. No usar automáticamente las coordenadas existentes del código sin cotejarlas con la imagen.

## Reglas para implementación

1. Identificar coordenadas precisas sobre la imagen y transformarlas al sistema de navegación real del juego.
2. No inventar ni duplicar edificios. No dibujar los círculos de anotación en el juego.
3. Mantener separados castillos, minas y molinos del catálogo de tesoros existente.
4. Castillos: conquista mediante combate o rendición, propiedad persistente, ingresos y reclutamiento con límites.
5. Minas: producción de oro/cristales por turno, persistencia del propietario, sin cobros duplicados.
6. Molinos: generar comida por turno; comida puede reponer movimiento al comenzar turno o mediante acción limitada. Definir y probar topes para impedir movimiento infinito.
7. NVRA: **no** existe intercambio real en esta fase. La eventual conversión de recursos del juego a NVRA requiere backend autoritativo, límites, presupuesto tokenómico y antifraude; nunca se reconocerán como saldos reales las cifras del guardado local.
8. Comprobar en navegador navegación, combate, propiedad, turnos, guardado/carga y compatibilidad con partidas anteriores antes de publicar mecánicas.

## Nota de compatibilidad

La versión actual usa un mapa lógico de 10×10 y un conjunto de coordenadas de minas y fortalezas ya codificado. **No reemplazar a ciegas** esas coordenadas: primero revisar su correspondencia con los lugares marcados.
