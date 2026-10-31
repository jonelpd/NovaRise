# NovaRise — criterios de diseño de juego y futura integración NVRA

Estado: especificación de diseño, NO implementación ni activación de recompensas on-chain.

## Identidad y jugabilidad
- Inspiración en la estructura de estrategia fantástica por turnos de Heroes of Might and Magic III, sin copiar sus recursos gráficos, nombres protegidos ni interfaz pixel a pixel.
- Mantener héroes Guerrero, Mago y Guardián, especializaciones permanentes y habilidades de nivel 2 y 4.
- Priorizar exploración, decisiones tácticas, criaturas, progresión y guardado/carga robustos.
- Mantener la imagen original `juego/mapa-grande.jpg` intacta.
- No introducir cofres, minas, espadas, edificios o puntos de interacción que no hayan sido verificados visualmente en la ilustración. Separar la detección visual de la lógica de coordenadas ya programadas.

## Inventario y recompensas (siguiente implementación)
1. Auditar visualmente `mapa-grande.jpg` y cotejar cada lugar con las coordenadas del código.
2. Crear un catálogo de puntos reales: id estable, tipo observado, coordenadas, interacción existente, recompensa, estado de recogida.
3. Los tesoros existentes conservan sus efectos v8.26: +1 daño por cada 2 tesoros (máximo +3), +1 maná máximo por tesoro (máximo +6).
4. No duplicar recompensas tras recargar. Versionar estado de guardado y migrar partidas anteriores.
5. Equipamiento futuro: inventario y ranuras independientes de la imagen del mapa; solo se obtiene mediante puntos verificados. Evitar bonos acumulables sin límite.
6. Verificar habilidades de clase, guardado/carga y combate en navegador antes de publicar nueva versión.

## Diseño futuro NVRA (sin activación)
- Red prevista: Base Mainnet, chainId 8453; suministro fijo previsto de 1.000.000 NVRA con 18 decimales. El token NO se crea al jugar ni se emite por «minería».
- «Minar NVRA» significará, si se aprueba, ganar una fracción de un fondo preasignado y limitado por acciones verificadas del juego; no proof-of-work ni acuñación adicional.
- Separar tres conceptos: recursos ficticios del juego, puntos de actividad sin valor transferible, y NVRA real en cadena.
- Ninguna recompensa NVRA se concede por datos de localStorage o guardados editables. Requiere servidor autoritativo, validación antifraude, límites por cuenta/temporada, presupuesto y reglas publicadas.
- La experiencia gratuita debe ser jugable y competitiva sin wallet; no habilitar pagos por ventaja decisiva.
- Antes de habilitar retiros: auditoría de contratos, custodia del fondo, protección anti-bots, privacidad, aspectos legales/fiscales y pruebas en entorno controlado.
- No presentar minería ni recompensas económicas como activas hasta que estén realmente desplegadas y verificadas.

## Criterios de aceptación
- Mapa original sin modificaciones.
- Todas las recompensas ligadas a lugares visualmente confirmados.
- Habilidades y bonificaciones persistentes tras guardar/cargar.
- Ningún cambio de saldo on-chain en esta fase.
