# FindeArt

Il Pokédex delle opere d'arte viste dal vivo nei musei italiani. Questo è il primo prototipo per uso personale.

## Cosa fa oggi

- **Pokédex**: elenco degli artisti con l'avanzamento ("Caravaggio 3/35"). Toccando un artista vedi tutte le sue opere: quelle catturate a colori, quelle mancanti in grigio con il museo dove si trovano.
- **Cattura**: scatti una foto (o la scegli dalla galleria), cerchi l'opera nel catalogo, aggiungi una nota e salvi la carta.
- **Diario**: tutte le carte catturate, dalla più recente. Tieni premuto su una carta per toglierla.
- **Rarità e punti**: Comune 10, Non comune 25, Rara 50, Leggendaria 100, Fantasma 200.

I dati restano sul telefono (nessun server, nessun account).

Non ancora presenti: riconoscimento automatico dalla foto, controllo della posizione, mappa dei musei, sincronizzazione.

## Provarlo sul telefono

1. Installa **Expo Go** dall'App Store o da Google Play.
2. Sul computer, con Node.js installato:
   ```bash
   npm install
   npx expo start
   ```
3. Inquadra il codice QR che compare nel terminale (su iPhone con la fotocamera, su Android dall'app Expo Go). Telefono e computer devono essere sulla stessa rete Wi-Fi; se non funziona usa `npx expo start --tunnel`.

## Catalogo

- `catalog/catalogo_v1.csv`: 263 opere di 7 artisti (Caravaggio, Hayez, Leonardo, Michelangelo, Paolo Uccello, Piero della Francesca, Raffaello) con stato, rarità e punti, rivisto a mano a partire da Wikidata.
- `catalog/estrai_opere.py`: estrae da Wikidata le opere di un artista conservate in Italia e in Vaticano (`python3 catalog/estrai_opere.py Q42207`).
- `src/data/catalog.json`: il catalogo nel formato usato dall'app, generato dal CSV.

## Struttura

- `src/app/(tabs)/`: le tre schermate principali (Pokédex, Cattura, Diario)
- `src/app/artist/[id].tsx`: la pagina dell'artista
- `src/data/catalog.ts`: tipi, rarità e ricerca nel catalogo
- `src/state/collection.tsx`: le carte catturate, salvate sul telefono
