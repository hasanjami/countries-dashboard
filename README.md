# Countries Dashboard

A country explorer with a Go backend and a vanilla JavaScript interface. Search countries, filter by region, sort the results and open a country card to see more details.

**Project type:** Individual project, developed by Hasan Abbas.

The original source archive was named `pokemon-api`; the implemented application uses REST Countries, so this portfolio repository uses the name **Countries Dashboard**.

## Features

- Search common and official country names.
- Filter by region.
- Sort by name or population, ascending or descending.
- Paginate results with limit and offset parameters.
- Display flags, capitals, population, languages and currencies.
- Custom dark interface with a star background.

## My work

I built the Go API, fetched and decoded country data, implemented filtering/sorting/pagination, and connected the HTML/CSS/JavaScript dashboard to the API.

## Run locally

Use Go 1.22.5 or newer. The server fetches country data at startup, so an internet connection is required.

```bash
git clone https://github.com/hasanjami/countries-dashboard.git
cd countries-dashboard
go run main.go
```

Open `http://localhost:3030`. The same Go server serves both the frontend and the API.

## API

| Route | Description |
| --- | --- |
| `GET /healthz` | JSON health response |
| `GET /items` | Country results and total count |
| `GET /` | Dashboard interface |

Example request:

```text
/items?q=united&type=Europe&sort=population&order=desc&limit=10&offset=0
```

`q` searches names, `type` filters the region, `sort` accepts `name` or `population`, and `order=desc` reverses the order. The response contains `total` and `items`.

## Structure and checks

`main.go` contains the API and static file server. `web/` contains the interface. `smallserver/` is an earlier standalone static-server utility; it is not needed for the main application.

```bash
go test ./...
go build ./...
```

There are currently no dedicated automated test files.

## Credits

Country data comes from [REST Countries](https://restcountries.com). The original stylesheet references a star background credited to [PaulineMoss on DeviantArt](http://fc01.deviantart.net/fs71/f/2012/160/b/9/stars_by_paulinemoss-d52un4e.jpg).
