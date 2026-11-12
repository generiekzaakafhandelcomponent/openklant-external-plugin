# Open Klant External Plugin

Een GZAC external plugin voor integratie met Open Klant APIs voor klantinteractie beheer.

## Functionaliteiten

- **Get Klantcontact** - Haal een klantcontact op met alle gerelateerde data
- **Get Partij** - Zoek een bestaande partij op identificator (BSN, KVK, etc.)
- **Create Klantcontact** - Maak een nieuw klantcontact aan
- **Create Partij (Persoon)** - Maak een persoon aan als partij
- **Create Partij (Organisatie)** - Maak een organisatie aan als partij
- **Create Persoon** - Maak een persoon aan in de contactgegevens API
- **Create Organisatie** - Maak een organisatie aan in de contactgegevens API

## Installatie

1. Download de plugin uit `plugin/dist/open-klant-<version>.zip`
2. Upload de plugin in GZAC via Admin > Plugins > External Plugins

## Development

```bash
cd plugin
npm install
npm run build
```

De gebouwde plugin staat in `plugin/dist/`.

## Configuratie

De plugin vereist de volgende configuratie:
- **Base URL** - De basis URL van de Open Klant instance
- **API Token** - Authenticatie token voor de Open Klant API

## Contact

Ritense BV
