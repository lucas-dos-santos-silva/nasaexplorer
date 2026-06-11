# Plano de Implementacao

Atualizado em: 11 de junho de 2026

## Objetivo

Construir uma aplicacao Vue.js com Tailwind CSS que consulta APIs publicas da NASA exclusivamente por um gateway FastAPI, sem persistencia e sem autenticacao de usuarios.

## Escopo

O escopo oficial de referencia e o catalogo publicado em `api.nasa.gov`, composto por:

1. APOD
2. Asteroids NeoWs
3. DONKI
4. EONET
5. EPIC
6. Exoplanet Archive
7. GIBS
8. InSight
9. NASA Image and Video Library
10. Open Science Data Repository
11. Satellite Situation Center
12. SSD/CNEOS
13. TechPort
14. TechTransfer
15. TLE API
16. Vesta, Moon e Mars Trek WMTS

As rotas mais utilizadas terao contratos explicitos no FastAPI. Produtos que publicam catalogos extensos ou especificacoes proprias tambem serao acessiveis por um proxy GET com provedores e hosts previamente permitidos. Nenhuma URL arbitraria sera aceita.

## Arquitetura

- `backend/app/api`: rotas HTTP e composicao dos routers
- `backend/app/core`: configuracao, catalogo de provedores e tratamento de falhas
- `backend/app/services`: cliente HTTP assincrono e regras de integracao
- `backend/tests`: testes unitarios e de contrato com upstream simulado
- `frontend/src`: aplicacao Vue, componentes e servicos
- `docs`: escopo, marcos e exemplos de consumo

## Decisoes

- Cliente `httpx.AsyncClient` compartilhado para pooling de conexoes
- Chave NASA mantida somente no backend
- Timeouts e erros externos convertidos em respostas previsiveis
- Consultas GET sem armazenamento local ou banco de dados
- Proxy generico limitado por enum de provedores e base URLs fixas
- Frontend usa apenas caminhos iniciados por `/api`
- Imagens remotas exibidas de forma responsiva e com carregamento progressivo
- Codigo sem comentarios, conforme requisito

## Etapas

| Etapa | Entrega | Estado |
| --- | --- | --- |
| 1 | Escopo, arquitetura e marcos | Concluida |
| 2 | Fundacao FastAPI e cliente NASA | Concluida |
| 3 | Rotas GET e exemplos por produto | Concluida |
| 4 | Frontend Vue e Tailwind | Concluida |
| 5 | Testes, documentacao e validacao | Concluida |

## Resultado

- Gateway assincrono com chave protegida no backend
- Rotas explicitas para os principais fluxos dos 16 produtos
- Cobertura adicional por proxy GET com provedores permitidos
- Interface editorial responsiva em Vue e Tailwind
- Imagens remotas sempre carregadas pelo backend
- Testes automatizados para backend, frontend e contratos centrais
- Validacao visual em desktop e mobile
