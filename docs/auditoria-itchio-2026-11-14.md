# Auditoría M0 — paquete HTML5 itch.io (2026-11-14)

## Fuente examinada
Archivo aportado por el usuario: `reinos-de-leyenda-itchio-html5.zip`, 48 entradas, incluyendo `index.html`, mapas, sprites, fondos, archivos NVRA y una demostración de combate. No se ha publicado en itch.io.

## Hallazgos confirmados
1. `index.html` es monolítico: 7 bloques `<script>`; el primero contiene aproximadamente 185 KB de JavaScript integrado.
2. Hay un módulo de aproximadamente 16,8 KB que importa Supabase desde `https://esm.sh/@supabase/supabase-js@2.57.0`, conecta a un proyecto NovaRise y gestiona registro, inicio de sesión y guardado remoto. La pantalla de juego depende del estado autenticado (`auth-screen`/`game-screen`). **Eliminar solo la importación rompería el acceso al juego**.
3. Hay un segundo módulo que importa Three.js desde un CDN; requiere probar la disponibilidad de red y su degradación visual.
4. El juego usa `localStorage` y solicita `./nav-terrain.json`; abrir `index.html` con `file://` no equivale a alojarlo en un servidor HTTPS.
5. El paquete incluye módulos y referencias NVRA. Se necesita una configuración explícita de distribución para evitar conexiones y funcionalidades NovaRise no deseadas en itch.io.
6. La comprobación de rutas literales del workflow no detecta dependencias dinámicas ni prueba la ejecución en un iframe.

## Riesgos de publicación
- Acceso condicionado a una cuenta externa NovaRise; revisar privacidad, consentimiento y expectativas de jugadores de itch.io.
- Guardado local y remoto potencialmente mezclados; se requiere separar perfiles y probar continuidad.
- Dependencias de red, recursos dinámicos, políticas de iframe, licencia de recursos, y límites del paquete aún no verificados.
- No afirmar que la edición es autónoma, que permite jugar sin cuenta, ni que está lista para donaciones.

## Próximas acciones técnicas
- [ ] Diseñar entrada **invitado local** para itch.io, sin alterar la autenticación NovaRise; no borrar el módulo de Supabase sin adaptar las pantallas y claves de guardado.
- [ ] Introducir configuración de canal en la compilación; excluir módulos NVRA y conexiones de nube del canal externo de forma comprobable.
- [ ] Validar carga del mapa, rutas dinámicas, combate, guardado, recarga, audio y WebGL en HTTPS e iframe de itch.io.
- [ ] Probar la versión en escritorio y móvil; automatizar comprobaciones de ausencia de endpoints y código prohibido para el canal Steam.
- [ ] Auditar licencias de arte, música y textos antes de publicar o aceptar donaciones.

**Conclusión:** el ZIP es un candidato técnico íntegro, **no una edición itch.io independiente y aprobada**. No se modificó la versión de producción en esta auditoría.
