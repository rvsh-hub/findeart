#!/usr/bin/env python3
"""FindeArt - estrae da Wikidata i dipinti di un artista conservati in Italia (e in Vaticano).

Uso:
    python3 estrai_opere.py Q42207 caravaggio_grezzo.csv
    python3 estrai_opere.py Q5582 --anche-sculture   # es. per scultori, include anche le sculture

Il codice Q dell'artista si trova su wikidata.org (es. Caravaggio = Q42207).
Il CSV prodotto ha una colonna "stato" vuota da compilare in revisione:
    esposta | dubbia | privata | rubata | distrutta | vaticano | deposito
Solo le opere "esposta" (e, se si decide, "vaticano") contano nel totale del Pokédex.
Serve solo la libreria standard di Python 3.
"""
import csv
import json
import sys
import urllib.parse
import urllib.request

ENDPOINT = "https://query.wikidata.org/sparql"
PAINTING = "wd:Q3305213"
SCULPTURE = "wd:Q860861"

QUERY = """
SELECT ?work ?workLabel (SAMPLE(?year) AS ?anno)
 (GROUP_CONCAT(DISTINCT ?collLabel; separator=" | ") AS ?collezioni)
 (GROUP_CONCAT(DISTINCT ?locLabel; separator=" | ") AS ?luoghi)
 (GROUP_CONCAT(DISTINCT ?cityLabel; separator=" | ") AS ?citta)
 (SAMPLE(?img) AS ?immagine) WHERE {
 VALUES ?tipo { %(tipi)s }
 ?work wdt:P170 wd:%(artista)s; wdt:P31/wdt:P279* ?tipo.
 { ?work wdt:P195 ?place } UNION { ?work wdt:P276 ?place }
 ?place wdt:P17 ?country. VALUES ?country { wd:Q38 wd:Q237 }
 OPTIONAL { ?work wdt:P195 ?coll. ?coll rdfs:label ?collLabel. FILTER(LANG(?collLabel)="it") }
 OPTIONAL { ?work wdt:P276 ?loc. ?loc rdfs:label ?locLabel. FILTER(LANG(?locLabel)="it") }
 OPTIONAL { ?place wdt:P131 ?city. ?city rdfs:label ?cityLabel. FILTER(LANG(?cityLabel)="it") }
 OPTIONAL { ?work wdt:P571 ?d. BIND(YEAR(?d) AS ?year) }
 OPTIONAL { ?work wdt:P18 ?img }
 SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
} GROUP BY ?work ?workLabel ORDER BY ?workLabel
"""

COLONNE = ["qid", "titolo", "anno", "collezione", "luogo", "citta", "stato",
           "conta_nel_totale", "nota", "immagine_commons", "wikidata"]


def interroga(artista, tipi):
    q = QUERY % {"artista": artista, "tipi": " ".join(tipi)}
    url = ENDPOINT + "?" + urllib.parse.urlencode({"query": q, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": "findeart-catalogo/0.1"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)["results"]["bindings"]


def riga(b):
    v = lambda k: b.get(k, {}).get("value", "")
    qid = v("work").rsplit("/", 1)[-1]
    img = urllib.parse.unquote(v("immagine").rsplit("/", 1)[-1]) if v("immagine") else ""
    return {"qid": qid, "titolo": v("workLabel"), "anno": v("anno"),
            "collezione": v("collezioni"), "luogo": v("luoghi"), "citta": v("citta"),
            "stato": "", "conta_nel_totale": "", "nota": "",
            "immagine_commons": img, "wikidata": "https://www.wikidata.org/wiki/" + qid}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    artista = args[0]
    uscita = args[1] if len(args) > 1 else f"{artista}_grezzo.csv"
    tipi = [PAINTING] + ([SCULPTURE] if "--anche-sculture" in sys.argv else [])
    righe = [riga(b) for b in interroga(artista, tipi)]
    with open(uscita, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLONNE)
        w.writeheader()
        w.writerows(righe)
    print(f"{len(righe)} opere scritte in {uscita}")


if __name__ == "__main__":
    main()
