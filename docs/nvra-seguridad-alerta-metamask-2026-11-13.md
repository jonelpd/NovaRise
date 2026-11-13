# Investigación de alerta MetaMask — 13-11-2026

## Evidencia y alcance
Captura del propietario: al intentar conectar `https://jonelpd.github.io/NovaRise/juego/`, MetaMask muestra «Malicioso: marcado como no seguro» para el origen `jonelpd.github.io`. La clasificación procede de MetaMask; **no se ha determinado su causa** y no se puede afirmar falso positivo.

## Medida preventiva aplicada
- Retirado de `juego/index.html` el cargador de `nvra-wallet-readonly.js`. La función queda en el repositorio, **no se ejecuta desde el juego**.
- Mensaje visible en el Centro NVRA: conexión suspendida temporalmente. No se modifican partidas ni economía.
- Añadida prueba automática para impedir reactivar accidentalmente el cargador durante la investigación.
- No solicitar conexión, firma, autorización ni transferencia. No desactivar las protecciones de MetaMask.

## Primera revisión estática (no equivale a auditoría completa)
- `juego/index.html` solo cargaba `nvra-wallet-readonly.js` mediante `script src`; no se observaron otros `script src` externos en ese archivo.
- El módulo de billetera utiliza `eth_requestAccounts`, `eth_chainId` y `eth_call` para lectura de saldo; no contiene los métodos de firma, transferencia ni aprobación revisados.
- Se observaron asignaciones `innerHTML` en el HTML principal; requieren revisión de procedencia de datos antes de afirmar ausencia de XSS.
- No se ha realizado análisis dinámico del sitio desplegado, revisión completa de todo el repositorio ni diagnóstico del motor de reputación de MetaMask.

## Investigación y revisión de clasificación
1. Inspeccionar la web desplegada, scripts, contenido generado, enlaces, dependencias, cambios recientes y posibles indicadores de inyección o phishing. Comprobar también que la versión desplegada corresponde a la rama auditada.
2. Revisar configuración de Pages y permisos de despliegue; comprobar que no haya archivos maliciosos ni redirecciones.
3. Si la revisión no detecta problemas, solicitar revisión a MetaMask con URL exacta, captura, repositorio y evidencia. Guía oficial: https://support.metamask.io/tl/configure/wallet/security-alerts ; incidencias: https://github.com/MetaMask/eth-phishing-detect/issues .
4. Mantener desactivada la conexión hasta que la clasificación se aclare y se documente la revisión de seguridad. No recomendar «Continuar bajo tu propio riesgo».

## Criterios de reactivación
- Ausencia de hallazgos críticos tras auditoría del código y despliegue.
- Clasificación de MetaMask aclarada o corregida; prueba de conexión controlada y autorizada por el propietario.
- Pruebas automáticas y comprobación manual aprobadas. Reactivación explícita en nuevo cambio revisado.

## Auditoría ampliada del repositorio y despliegue — 13-11-2026

**Hallazgos verificables en código:**
- GitHub Pages se publica desde `.github/workflows/pages.yml` mediante `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`, con `contents: read`, `pages: write` e `id-token: write`. El artefacto incluye **todo el repositorio** (`path: .`), no solo el juego; es una superficie de publicación innecesariamente amplia que conviene reducir en una fase separada con revisión de rutas.
- `juego/index.html` no contiene actualmente etiquetas `script src` externas, pero **sí dos importaciones dinámicas remotas**: `https://esm.sh/@supabase/supabase-js@2.57.0` y `https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js`. Por tanto, el juego **sí depende de código remoto**; la revisión inicial limitada a `script src` era incompleta.
- El cliente Supabase usa una clave `sb_publishable_...`, que es pública por diseño; su presencia no demuestra exposición de secretos. Es imprescindible revisar políticas RLS, permisos y autenticación por separado.
- El HTML contiene varias asignaciones `innerHTML`, principalmente para SVG y presentación de batallas. Una parte de las plantillas utiliza escape HTML; falta análisis completo de flujo de datos de entradas importadas y de Supabase antes de descartar XSS.
- El módulo de billetera continúa desactivado en la página, y el contrato NVRA no se usa para transacciones.

**Limitaciones:** el navegador web de auditoría no consiguió abrir `https://jonelpd.github.io/NovaRise/juego/` desde este entorno. No se ha comparado byte a byte el despliegue real con el repositorio, no se ha inspeccionado el tráfico del navegador del propietario, ni se ha determinado qué proveedor o regla originó la clasificación MetaMask. El origen `jonelpd.github.io` puede contener más rutas/proyectos que el juego, por lo que no debe atribuirse la alerta al módulo NVRA sin pruebas.

**Control automatizado nuevo:** `tests/p0-nvra-site-security-hold.test.cjs` comprueba el bloqueo de la billetera y registra la presencia de las dos dependencias remotas; CI pendiente.

**Siguientes acciones priorizadas:** (1) confirmar CI y Pages desplegado; (2) inspeccionar los recursos reales de red y alertas de MetaMask, sin conectar billetera; (3) auditar las entradas hacia `innerHTML` y RLS; (4) preparar publicación limitada a archivos públicos y política CSP compatible; (5) con evidencias, solicitar revisión del bloqueo a MetaMask. La guía oficial distingue blocklist, fuzzylist y allowlist, y advierte que una revisión puede ser necesaria si un dominio legítimo resulta bloqueado: https://github.com/MetaMask/eth-phishing-detect/blob/main/doc/lists-ref.md .
