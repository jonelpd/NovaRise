# Solicitud de revisión de advertencia MetaMask — NovaRise

**Estado:** borrador listo para revisión del titular; **NO ENVIADO**. No se presume falso positivo ni se solicita desactivar protecciones.

## Destino recomendado

- Incidencia de clasificación de sitio: https://github.com/MetaMask/eth-phishing-detect/issues/new
- Guía oficial: https://support.metamask.io/stay-safe/safety-in-web3/deceptive-site-ahead-when-trying-to-connect-to-a-site
- Si el aviso es una alerta de seguridad distinta a la pantalla de bloqueo de phishing, utilizar soporte oficial: https://support.metamask.io/configure/wallet/security-alerts/

## Texto propuesto (inglés)

**Title:** Request for investigation of MetaMask malicious-site warning for NovaRise on GitHub Pages

Hello MetaMask security team,

I maintain the NovaRise project hosted at https://jonelpd.github.io/NovaRise/ and its strategy game at https://jonelpd.github.io/NovaRise/juego/. During an attempted wallet connection on November 13, 2026, MetaMask displayed a warning in Spanish equivalent to “Malicious: flagged as unsafe.”

We take this warning seriously and have disabled wallet connection in the deployed game. We are **not** asking users to bypass MetaMask protection. We would appreciate clarification of which exact URL, domain, contract, behavior or risk indicator triggered the classification, and a review of the current deployment.

Project source: https://github.com/jonelpd/NovaRise
Base mainnet NVRA contract (for identification, not endorsement): 0xa1128B1F4CB8394c179eb2558608a7302972EcBF
Public deployment check: https://github.com/jonelpd/NovaRise/actions/runs/43413553559
Security investigation notes: https://github.com/jonelpd/NovaRise/blob/main/docs/nvra-seguridad-alerta-metamask-2026-11-13.md

The previously developed optional wallet module is currently excluded from the public GitHub Pages artifact. It was intended only to request account access and read an ERC-20 balance via eth_call; the static code inspection did not find transaction submission or signing calls. This is **not** a claim that the entire site, contract or dependency chain has passed an independent security audit.

We are continuing our security review and will address any concrete findings. Please let us know what evidence or remediation you require. We can supply the exact warning screenshot and reproduction details.

Thank you.

## Antes de presentar

1. Adjuntar la captura original del aviso, sin claves privadas ni datos de cuenta innecesarios.
2. Confirmar si la alerta afectaba al dominio `jonelpd.github.io`, a la URL completa `/NovaRise/juego/` o al contrato NVRA. GitHub Pages comparte dominio con otros repositorios; no atribuir la clasificación sin pruebas.
3. Verificar que la cuenta que presente el caso puede acreditar la titularidad del repositorio.
4. No publicar direcciones de billetera personales, secretos, contraseñas ni frases semilla.
5. Si la respuesta de MetaMask apunta a una dependencia, ruta o contrato, corregir y volver a auditar antes de reactivar conexión.

## Evidencia comprobada

- GitHub Pages publicó y la comprobación HTTP devolvió 200 para portada/juego y 404 para el módulo suspendido/documentación en la ejecución 43413553559.
- Regresión del juego 43413553545: éxito.
- Supabase: se revocaron privilegios excesivos de las tablas de juego, verificados mediante consulta de GRANT. El usuario confirmó guardado y recuperación de partida.
- MetaMask: clasificación **no resuelta**. La billetera permanece desactivada.
