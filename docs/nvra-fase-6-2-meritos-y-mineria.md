# Fase 6.2 — Méritos y minería de Reinos de Leyenda

**Estado (13-11-2026):** especificación técnica y barreras de seguridad; no hay recompensas reales habilitadas.

## Inventario existente (sin elementos inventados)

El Centro NVRA del juego ya muestra indicadores de minas controladas, tesoros descubiertos y fortalezas controladas. Estos se derivan de `ownedMines`, `taken` y `verifiedSites`, cruzados con los catálogos existentes `mines`, `treasures` y `CASTLE_PROFILES`. Se usan `Set` para evitar duplicados en el indicador. No se crean minas, tesoros ni castillos fuera del mapa real `juego/mapa-grande.png`.

Los contadores actuales son **informativos, no acreditados por servidor**. Un archivo de partida importado o el navegador pueden alterar estos datos. No deben utilizarse como prueba de minería de tokens ni como base para pagos.

## Modelo propuesto de evento verificable (aún no desplegado)

- `event_id`: UUID generado y controlado por el servidor.
- `user_id`: `auth.uid()` del jugador autenticado, nunca aceptado del cliente.
- `campaign_id` y `revision`: identifican la partida y su revisión.
- `event_type`: `mine_capture`, `treasure_discovery`, `castle_capture`.
- `site_id`: identificador del catálogo permitido del mapa.
- `occurred_at`: marca de tiempo del servidor.
- `proof_status`: `pending`, `verified` o `rejected`.
- `merit_points`: entero no negativo y sujeto a reglas publicadas; **sin equivalencia automática a NVRA**.

## Requisitos antes de registrar eventos acreditables

1. Validación **en servidor** de las transiciones de partida; no confiar en el JSON guardado, importaciones ni en un contador enviado por el cliente.
2. Lista blanca de `site_id` ligada a los elementos reales del mapa; impedir eventos por objetos inexistentes.
3. Idempotencia mediante clave única por usuario, campaña, evento y lugar cuando proceda; evitar repetición al guardar, reconectar o importar.
4. Reglas por temporada y topes por cuenta/campaña, con protección frente a cuentas múltiples y abuso.
5. Transacciones atómicas, control de concurrencia y auditoría de decisiones; RLS para lectura propia y escritura exclusivamente mediante servicio validado.
6. Pruebas negativas: eventos duplicados, lugares inexistentes, revisiones antiguas, partidas manipuladas, cuentas cruzadas y operaciones concurrentes.
7. Definir públicamente política de recompensas, presupuesto de tokens, criterios de elegibilidad y revisión jurídica antes de prometer NVRA.

## Separación económica

- Oro, cristales y experiencia: recursos internos de jugabilidad.
- Méritos: indicadores o registros verificables sin valor monetario garantizado.
- NVRA: token real Base mainnet; ninguna conversión, emisión, firma o transferencia se activa en esta fase.

## Restricción de seguridad vigente

La alerta MetaMask está bajo revisión en https://github.com/MetaMask/eth-phishing-detect/issues/312215. El módulo de conexión de billetera debe seguir excluido del despliegue hasta resolver el riesgo y revisar la integración. La confirmación del usuario de que guarda y recupera partidas no demuestra que los eventos sean resistentes a manipulación.

## Criterio de cierre

La fase solo se considerará implementada cuando el registro de eventos sea verificable en servidor, sus permisos estén auditados, las pruebas automáticas y funcionales pasen y el plan maestro quede actualizado. Esta especificación **no cierra** la implementación de minería NVRA.


## Migración aplicada en Supabase (13-11-2026)

Migración `prepare_secure_game_merit_event_identity_20261113` aplicada sobre `public.nvr_game_reward_events` en el proyecto `spaafpqczvqahhwjxxrz`:

- Añadidos campos opcionales `campaign_id text`, `site_id text`, `save_revision bigint`, `verification_source text`.
- Restricciones de formato para campaña y sitio, revisión positiva y fuente limitada a `server_verified`.
- Índice único parcial `(user_id,campaign_id,event_type,site_id)` cuando campaña y sitio no son nulos. **No** garantiza por sí solo legitimidad de un evento; únicamente evita la duplicación exacta de esa combinación.
- Revocados permisos de cliente; `authenticated` conserva solo `SELECT`, protegido por RLS. No hay permisos `anon`.
- Verificación: cuatro columnas presentes, RLS activo, concesiones cliente `authenticated:SELECT`, cero registros previos. No se modificaron partidas.
- No se ha habilitado RPC de acreditación: una partida JSON enviada desde el navegador no es prueba suficiente de un evento real. Antes de escribir eventos `server_verified` hace falta un flujo de acciones autoritativo de servidor, catálogo de ubicaciones verificado y pruebas de concurrencia. Ningún token se paga.
- Security Advisor: siguen avisos anteriores sobre RPC `SECURITY DEFINER` de guardado y protección de contraseñas filtradas; no surgió un nuevo aviso sobre esta tabla.


## Catálogo de minas reales y control referencial (13-11-2026)

Migración `register_real_map_mines_for_future_server_merits_20261113` aplicada:

- Tabla `public.nvr_game_merit_sites` con clave primaria `(event_type,site_id)`, RLS activo y **sin permisos de acceso para `anon` ni `authenticated`**. No hay políticas de lectura pública intencionadamente.
- Tres entradas extraídas del catálogo `VERIFIED_MAP_SITES` de `juego/index.html`: `mine-west`, `mine-center`, `mine-east`, todas `event_type='mine_capture'`, `enabled=false`.
- Clave foránea compuesta desde `nvr_game_reward_events(event_type,site_id)` al catálogo. Los eventos con `site_id` nulo (legado) no quedan cubiertos por esa FK; los eventos nuevos acreditados deberán exigirlo.
- Restricción de coherencia: `verification_source='server_verified'` exige `verified=true`, campaña, sitio y revisión presentes.
- Verificación posterior: 3 lugares, 0 habilitados, 0 eventos; RLS activo y ningún permiso de cliente sobre el catálogo.
- Security Advisor: aviso informativo de RLS sin políticas para el catálogo es **intencionado** (tabla cerrada al cliente); persisten avisos anteriores sobre la RPC de guardado y contraseñas filtradas.
- **Importante:** la FK garantiza que un identificador pertenece al catálogo, pero no prueba que un jugador haya capturado la mina. Aún falta motor de acciones autoritativo en servidor, comprobación de estado anterior/nuevo y protección de carreras antes de habilitar eventos.


## Barrera obligatoria de escritura en servidor (13-11-2026, continuación)

Migración aplicada `block_unverified_game_merit_event_inserts_20261113`: trigger `nvr_guard_merit_event_insert_trigger` sobre `public.nvr_game_reward_events` que invoca `public.nvr_guard_merit_event_insert()` como `SECURITY INVOKER`, con `search_path=''` y sin `EXECUTE` público, anónimo ni autenticado.

En cada `INSERT` exige tipo admitido, campaña/sitio/revisión, `verification_source='server_verified'`, `verified=true`, `points=0` y que el lugar figure `enabled=true` en el catálogo protegido. Todas las minas están actualmente deshabilitadas, de modo que **ningún evento de mina puede insertarse**. Esta es una barrera defensiva, **no** una prueba de captura legítima; un futuro servicio con permisos de escritura deberá verificar de forma autoritativa el movimiento y el combate antes de habilitar sitios o registrar méritos.

Prueba SQL negativa: se intentó insertar un evento de `mine-west` con todos los campos de prueba; el trigger lo rechazó con `check_violation`. Verificación posterior: 1 trigger activo, 0 minas habilitadas, 0 eventos persistidos. La primera tentativa de prueba incluía un ID manual incompatible con la columna `GENERATED ALWAYS`; se corrigió la prueba para usar el ID automático, sin modificar datos.

**Pendiente:** diseñar motor de acciones autoritativo, pruebas de concurrencia y una política de puntos. No se han tocado las partidas guardadas ni las billeteras.


## Estado de campaña aislado (13-11-2026)

Migración `create_server_owned_game_campaign_state_20261113`: `public.nvr_authoritative_campaigns`, clave primaria `(user_id,campaign_id)`, revisión positiva, estado de campaña, posición acotada, movimientos y minas en JSONB con límite de 3. RLS activo, sin permisos de cliente. Comprobado en producción: 0 campañas, sin permisos `SELECT/INSERT/UPDATE` para `authenticated`, ni `INSERT` para `anon`. La tabla `nvr_game_saves` no se modificó.

El módulo `server/nvra-authoritative-campaign-service.cjs` carga estado desde una interfaz de repositorio servidor y requiere compare-and-swap antes de confirmar captura. Las pruebas `tests/p0-nvra-authoritative-campaign-service.test.cjs` cubren concurrencia simulada y rechazo de eventos falsos. **No es todavía un backend desplegado**: faltan adaptador transaccional real, autenticación, generación autoritativa de movimientos y rutas, inicialización confiable y pruebas de integración. El estado actual del navegador no es fuente confiable. No se emiten recompensas ni NVRA.
