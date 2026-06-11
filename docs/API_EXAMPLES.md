# Exemplos de Consumo GET

Atualizado em: 11 de junho de 2026

Todos os exemplos consultam o backend local. A chave da NASA e adicionada somente pelo FastAPI.

## APOD

```bash
curl "http://localhost:8000/api/v1/apod?thumbs=true"
```

## Asteroids NeoWs

```bash
curl "http://localhost:8000/api/v1/asteroids/feed?start_date=2026-06-01&end_date=2026-06-07"
curl "http://localhost:8000/api/v1/asteroids/today?detailed=true"
curl "http://localhost:8000/api/v1/asteroids/3542519"
curl "http://localhost:8000/api/v1/asteroids/browse?page=0&size=12"
```

## Earth Imagery

```bash
curl "http://localhost:8000/api/v1/earth/imagery?lon=-47.9&lat=-15.8&dim=0.1"
curl "http://localhost:8000/api/v1/earth/assets?lon=-47.9&lat=-15.8"
```

## DONKI

```bash
curl "http://localhost:8000/api/v1/donki/CME?startDate=2026-06-01&endDate=2026-06-07"
curl "http://localhost:8000/api/v1/donki/notifications?type=all"
```

Os tipos disponiveis sao `CME`, `CMEAnalysis`, `FLR`, `GST`, `HSS`, `IPS`, `MPC`, `RBE`, `SEP`, `WSAEnlilSimulations` e `notifications`.

## EONET

```bash
curl "http://localhost:8000/api/v1/eonet/events?status=open&limit=10"
curl "http://localhost:8000/api/v1/eonet/categories"
curl "http://localhost:8000/api/v1/eonet/sources"
```

## EPIC

```bash
curl "http://localhost:8000/api/v1/epic/natural"
curl "http://localhost:8000/api/v1/epic/natural/date/2026-06-01"
curl "http://localhost:8000/api/v1/epic/natural/available"
```

## Exoplanet Archive

```bash
curl --get "http://localhost:8000/api/v1/exoplanets/query" \
  --data-urlencode "query=select top 10 pl_name,hostname,disc_year from ps" \
  --data-urlencode "format=json"
```

API tabular legada referenciada no catalogo:

```bash
curl "http://localhost:8000/api/v1/exoplanets/legacy?table=exoplanets&format=json"
```

## GIBS

```bash
curl "http://localhost:8000/api/v1/gibs/capabilities?projection=epsg4326"
```

Demais recursos GET do GIBS:

```bash
curl "http://localhost:8000/api/v1/proxy/gibs/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml"
```

## InSight

```bash
curl "http://localhost:8000/api/v1/insight?feedtype=json&ver=1.0"
```

O servico e historico e pode responder sem dados recentes.

## NASA Image and Video Library

```bash
curl "http://localhost:8000/api/v1/images/search?q=artemis&media_type=image"
curl "http://localhost:8000/api/v1/images/asset/PIA12348"
curl "http://localhost:8000/api/v1/images/metadata/PIA12348"
curl "http://localhost:8000/api/v1/images/captions/NHQ_2017_0821_Total_Eclipse"
```

## Mars Rover Photos

```bash
curl "http://localhost:8000/api/v1/mars/rovers/curiosity/photos?sol=1000&page=1"
curl "http://localhost:8000/api/v1/mars/rovers/perseverance/latest"
curl "http://localhost:8000/api/v1/mars/rovers/curiosity/manifest"
```

## Open Science Data Repository

```bash
curl "http://localhost:8000/api/v1/osdr/search?term=spaceflight"
curl "http://localhost:8000/api/v1/osdr/files/87"
curl "http://localhost:8000/api/v1/osdr/metadata/137"
curl "http://localhost:8000/api/v1/osdr/entities/mission/SpaceX-8"
```

As entidades disponiveis sao `biospecimen`, `experiment`, `hardware`, `mission`, `payload`, `subject` e `vehicle`.

## Satellite Situation Center

```bash
curl "http://localhost:8000/api/v1/ssc/observatories"
curl "http://localhost:8000/api/v1/ssc/spase-observatories"
curl "http://localhost:8000/api/v1/ssc/ground-stations"
curl "http://localhost:8000/api/v1/ssc/application.wadl"
curl "http://localhost:8000/api/v1/ssc/locations/iss/20260601T000000Z,20260601T001000Z/gse"
```

Demais caminhos GET da especificacao SSC:

```bash
curl "http://localhost:8000/api/v1/proxy/ssc/observatories"
```

## SSD/CNEOS

```bash
curl "http://localhost:8000/api/v1/ssd/fireball?limit=10"
curl "http://localhost:8000/api/v1/ssd/scout"
curl "http://localhost:8000/api/v1/ssd/mdesign?des=99942"
```

Os servicos disponiveis sao `cad`, `fireball`, `mdesign`, `nhats`, `sbdb`, `sbdb-query`, `scout` e `sentry`.

## TechPort

```bash
curl "http://localhost:8000/api/v1/techport/projects"
curl "http://localhost:8000/api/v1/techport/projects/157166"
```

## TechTransfer

```bash
curl "http://localhost:8000/api/v1/techtransfer/patent?query=robotics"
curl "http://localhost:8000/api/v1/techtransfer/software?query=climate"
```

Os tipos disponiveis sao `patent`, `patent_issued`, `software` e `spinoff`.

## TLE API

```bash
curl "http://localhost:8000/api/v1/tle?search=ISS"
curl "http://localhost:8000/api/v1/tle/25544"
```

## Vesta, Moon e Mars Trek WMTS

```bash
curl "http://localhost:8000/api/v1/trek/mars/capabilities?mosaic=Mars_Viking_MDIM21_ClrMosaic_global_232m"
curl "http://localhost:8000/api/v1/trek/vesta/capabilities?mosaic=global_LAMO"
curl "http://localhost:8000/api/v1/trek/moon/capabilities?mosaic=global"
```

## Proxy Avancado

```bash
curl "http://localhost:8000/api/v1/proxy/nasa/planetary/apod?date=2026-06-01"
curl "http://localhost:8000/api/v1/proxy/images/search?q=rocket"
```

Provedores permitidos: `nasa`, `eonet`, `epic`, `exoplanet`, `gibs`, `images`, `osdr`, `ssc`, `ssd`, `techport`, `tle` e `trek`.
