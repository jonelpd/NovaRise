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
