# NASA Explorer

Aplicacao web para explorar dados publicos da NASA por meio de um gateway FastAPI. O frontend Vue nunca consulta os servicos externos diretamente: todas as requisicoes passam por `/api/v1`.

## Recursos

- Astronomy Picture of the Day em destaque
- Busca na NASA Image and Video Library
- Aproximacoes de asteroides pelo NeoWs
- Eventos de clima espacial pelo DONKI
- Eventos naturais pelo EONET
- Acesso aos 16 produtos do catalogo atual de `api.nasa.gov`
- Proxy GET limitado a provedores oficiais previamente configurados
- Tratamento uniforme de timeout, indisponibilidade e respostas invalidas
- Interface responsiva inspirada na linguagem editorial do nasa.gov

## Requisitos

- Python 3.9 ou superior
- uv
- Node.js 20 ou superior
- Chave de API obtida em [api.nasa.gov](https://api.nasa.gov/)

`DEMO_KEY` funciona para avaliacao local, mas possui limites menores.

## Configuracao

```bash
cp .env.example .env
uv sync --all-groups
cd frontend
npm install
```

Defina `NASA_API_KEY` no arquivo `.env`.

## Desenvolvimento

Backend:

```bash
uv run uvicorn backend.app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

A aplicacao fica disponivel em `http://localhost:5173`. A documentacao interativa da API fica em `http://localhost:8000/docs`.

## Validacao

```bash
uv run ruff check backend
uv run pytest
cd frontend
npm run test
npm run build
```

## Estrutura

```text
backend/
  app/
    api/
    core/
    services/
  tests/
frontend/
  src/
docs/
```

## Cobertura

O arquivo [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) registra ao menos um consumo de cada produto GET do catalogo. Produtos com especificacoes extensas, como GIBS, SSC e Trek WMTS, contam com rotas explicitas de entrada e com `/api/v1/proxy/{provider}/{path}` para os demais caminhos GET do provedor.

O proxy aceita apenas provedores cadastrados no backend. URLs arbitrarias, troca da chave NASA pelo cliente e caminhos com navegacao de diretorios sao bloqueados.

## Referencias

- [NASA Open APIs](https://api.nasa.gov/)
- [Catalogo mantido pela NASA](https://github.com/nasa/api-docs)
- [NASA Image and Video Library](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf)
- [EONET v3](https://eonet.gsfc.nasa.gov/docs/v3)
- [SSD/CNEOS APIs](https://ssd-api.jpl.nasa.gov/)
- [NASA Web Design System](https://nasa.github.io/nasa-design-system/)

