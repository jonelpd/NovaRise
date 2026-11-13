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
