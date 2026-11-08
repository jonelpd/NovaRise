# NVRA — Seguimiento de auditoría de contrato y liquidez (2026-11-08)

**Estado:** comprobación documental parcial. **NO-GO** para aportar liquidez o transferir tokens hasta completar verificaciones y autorizaciones. Este documento no es una auditoría independiente ni una afirmación de seguridad.

## Identificación pendiente de confirmar en cadena

- Red declarada: Base Mainnet, chain ID 8453.
- Dirección comunicada del token: `0xa1128B1F4CB8394c179eb2558608a7302972EcBF`.
- Nombre/símbolo previstos: NovaRise Utility Token (NVRA).
- Suministro previsto: 1.000.000 NVRA con 18 decimales.
- **Pendiente:** recuperar de BaseScan o Blockscout código verificado, bytecode, creador, transacción de despliegue, parámetros del constructor, `totalSupply()`, `decimals()`, `name()`, `symbol()`, titulares, transferencias y contratos de pools.
- La consulta pública específica del contrato no fue accesible desde las herramientas de esta sesión. **No interpretar esta limitación como ausencia de despliegue o liquidez.**

## Fuentes del repositorio examinadas

1. `contracts/src/NVRAMainnetCandidate.sol`: candidato de 1.000.000 NVRA con emisión única al contrato de tesorería; sin función de emisión adicional en ese archivo. El comentario fuente lo califica de *UNDEPLOYED candidate*. No se ha demostrado equivalencia con el contrato desplegado.
2. `contracts/NVRAToken.sol`: prototipo de testnet/local de 100.000.000 NVRA; **no confundirlo** con el candidato de Base.
3. `docs/nvra-consolidated-security-assessment-2026-10-29.md`: evaluación estática preliminar con bloqueos de lanzamiento y sin auditoría externa.
4. `docs/tokenomics-v1-mainnet-plan.md`: distribución provisional acordada y controles pendientes.

## Distribución provisional de referencia (NO comprobada on-chain)

| Partida | NVRA | Porcentaje |
| --- | ---: | ---: |
| Ecosistema y recompensas | 300.000 | 30 % |
| Tesorería y desarrollo | 250.000 | 25 % |
| Comunidad y adopción | 200.000 | 20 % |
| Equipo fundador | 150.000 | 15 % |
| Liquidez futura | 100.000 | 10 % |
| **Total** | **1.000.000** | **100 %** |

Esta distribución es una **propuesta documental**, no prueba de transferencias, bloqueos ni saldos reales. No sustituirla por un reparto nuevo sin decisión expresa.

## Lista de comprobación antes de cualquier pool

- [ ] Verificar que la dirección corresponde a un contrato en Base Mainnet.
- [ ] Comparar el código publicado y el bytecode con el código exacto del despliegue; identificar cualquier diferencia con el candidato GitHub.
- [ ] Leer `totalSupply`, `decimals`, nombre y símbolo directamente en la cadena.
- [ ] Identificar creador, receptor inicial y distribución actual por carteras.
- [ ] Comprobar privilegios, proxy/upgrade, pausas, bloqueos y emisión, conforme al **código realmente desplegado**.
- [ ] Identificar si existen pools NVRA/USDC u otros; verificar reservas, actividad y titularidad de posiciones LP.
- [ ] Documentar custodia de tesorería, firmantes, límites, vesting y controles para la asignación de liquidez.
- [ ] Cerrar riesgos altos/críticos de la evaluación interna y obtener revisión independiente.
- [ ] Revisar obligaciones regulatorias y comunicaciones con asesoría cualificada para España/UE.
- [ ] Aprobar separadamente presupuesto de USDC, cantidad de NVRA, rango, riesgos y transacción específica; no ejecutar operaciones automáticamente.

## Enlaces de consulta

- https://basescan.org/address/0xa1128B1F4CB8394c179eb2558608a7302972EcBF#code
- https://basescan.org/token/0xa1128B1F4CB8394c179eb2558608a7302972EcBF
- https://base.blockscout.com/address/0xa1128B1F4CB8394c179eb2558608a7302972EcBF

**Próximo hito:** evidencia on-chain verificable, no una nueva simulación ni un aporte de liquidez. No se ha realizado ninguna transacción en esta revisión.
