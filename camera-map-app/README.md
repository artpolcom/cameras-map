## Spuštění
1. První věcí je klonování repozitáře:
```bash
git clone https://github.com/artpolcom/cameras-map.git
```  
2. Pak přejdeme do složky s mock serverem a nainstalujeme jej:
```bash
cd camera-map-jsonserver && npm install
```  
3. Rozhodneme se, který port chceme použit a spustíme ``json-server``:
```bash
npx json-server --watch cams.json --port 6589
```  
4. Přejdeme do složky s Reactovou aplikací a nainstalujeme všechny balíčky:
```bash
cd ../camera-map-app && npm install
```
5. Teď přejmenujeme soubor ``.env.local.example`` na ``.env.local``. Obsahuje tyto dvě proměnné, bez jejichž vyplnění aplikace nepoběží:
   5.1  ``VITE_MAPBOX_API_KEY`` - klíč API Mapboxu. Získat jej lze zde.
   5.2. ``VITE_CAMERAS_API`` - URL mock serveru. Jestliže Vám ``json-server`` běží na jiném portu než ``6589`` anebo máte jiný název koncového bodu, uveďte to zde.
7. Tímto příkazem spustíte Reactovou aplikaci:
```bash
npm run dev
```
**Toť vše.**

## CORS
Pokud pracujete s ``json-server``'em, máte hned na začátku ``Access-Control-Allow-Origin: *``, a tudíž nemusíte řešit vůbec nic v tomto ohledu.
## Schema
Aplikace zpracovává data o jednotlivých kamerách v následujícím formátu:
```json
[
    {
        "id": { "type": "number" },
        "name": { "type": "string" },
        "isActive": { "type": "boolean" },
        "latitude": { "type": "number" },
        "longitude": { "type": "number" },
        "direction": { "type": "number" },
        "angle": { "type": "number" },
        "range": { "type": "number" }
    }
]

```

