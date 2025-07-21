import { useState, useRef, useEffect } from 'react';
import mapboxgl, { Map, MapMouseEvent } from 'mapbox-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import {  generateCameraViewFeatureCollection } from './utils/shapesRendering';
import 'mapbox-gl/dist/mapbox-gl.css';
import ErrorModal from './components/ErrorModal';
import type { RetryFunction, Camera } from './types';
import { mapLayers } from './config/mapLayers';
import LayerSwitch from './components/LayerSwitch';
import CameraEditor from './components/CameraEditor';
import SideBar from './components/SideBar';
const API_URL = import.meta.env.VITE_CAMERAS_API;
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
// Souřadnice nějakého místa v Olomouci
const DEFAULT_COORDS = { lng: 17.2535, lat: 49.5900 };

/**
 * Rozhraní pro stav, který se používá v komponentě informující o chybách při načítání dat z API.
 * @interface ErrorState
 */
interface ErrorState {
  isShown: boolean;
  message: string;
  retryFunction: RetryFunction | null;
}

function App() {
  // Použijeme ref, abychom pracovali se stejnou instancí mapy napříč životním cyklem komponenty
  const mapRef = useRef<Map | null>(null);

  // Ref pro HTML prvek, do kterého se instance mapbox vykreslí
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // Stav pro vrstvu (čili styl) mapy
  const [currentMapLayer, setCurrentMapLayer] = useState<string>('streets-v12');

  // Stav pro množinu všech kamer
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Vytvoříme ref pro množinu kamer, abychom měli plynulejší přetahování
  const camerasRef = useRef<Camera[]>(cameras);

  // Stav pro vybranou/novou kameru
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  // Ref pro vybranou/novou kameru, jehož účelem je umožnit plynulost při editování
  const selectedCameraRef = useRef<Camera | null>(null);

  const [errorState, setErrorState] = useState<ErrorState>({
    isShown: false,
    message: '',
    retryFunction: null
  });

  // Stahujeme kamery z API
  const fetchCameras = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Nepodařilo se načíst data z extérního API.');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      let errorMessage = 'Neznamá chyba.';

      if (error instanceof Error) {
        errorMessage = error.message === 'Failed to fetch' ?
          'Chyba připojení k extérnímu API.' :
          error.message;
      }

      displayErrorModal(errorMessage, fetchCameras)
    }
  }

  // Funkce k zobrazení okénka informujícího o chybě stahování dat
  const displayErrorModal = (
    message: string = '',
    retryFunction: RetryFunction | null = null) => {
    setErrorState(prevState => ({
      ...prevState,
      isShown: true,
      message,
      retryFunction
    }))
  }
  
  // Tato funkce přidává vrstvy se záběry kamer
  const addSourcesAndLayers = () => {
    mapRef.current?.addSource('field-of-view', {
      type: 'geojson',
      data: generateCameraViewFeatureCollection(camerasRef.current),
    });

    // Hlavní vrstva se záběry
    mapRef.current?.addLayer({
      id: 'field-of-view-layer',
      type: 'fill',
      source: 'field-of-view',
      paint: {
        'fill-color': "#ff6600",
        'fill-opacity': 0.4,
      },
    })

    // Vrstva, která se zviditelní po té co uživatel vybere kameru 
    mapRef.current?.addLayer({
      id: 'camera-highlight-layer',
      type: 'fill',
      source: 'field-of-view',
      paint: {
        'fill-color': '#3399FF',
        'fill-opacity': 0.5,
        'fill-outline-color': '#0066CC'
      },
      filter: ['==', 'id', -1], 
    });
  }

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    // Synchronizace stavu a refů
    camerasRef.current = cameras;
    selectedCameraRef.current = selectedCamera;
    updateMapData(cameras, selectedCamera);
  }, [cameras, selectedCamera]);

  useEffect(() => {
    // Inicializace mapy
    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [DEFAULT_COORDS.lng, DEFAULT_COORDS.lat],
        zoom: 12
      });

      const map = mapRef.current;
      // Ovládací prvky mapy
      map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
      
      map.on('load', () => {
        map.setStyle(mapLayers[currentMapLayer].url)
      });

      map.on('style.load', () => {
        addSourcesAndLayers()
      })
    }

    return () => {
      mapRef.current?.remove()
    }
  }, []);

  useEffect(() => {
   // Tento useEffect sleduje změny v množině kamer a přidává posluchač kliku, pokud uživatel zahájil 
   // proces tvorby nové kamery
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Funkce umožňující výběr kamery pro úpravu přímo na mapě
    const handleCameraClick = (e: MapMouseEvent) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      // Jestliže nejsou features, tak tu nemáme co dál řešit
      if (!feature.properties) return

      const cameraId = feature.properties.id;

      if (cameraId) {
        // Hledáme kameru v množině kamer ve stavu
        const clickedCamera = cameras.find(c => c.id === cameraId);
        if (clickedCamera) {
          // Až ji najdeme, tak ji otevřeme ve formuláři pro úpravy
          handleSelectCamera(clickedCamera);

          // Přiblížíme si ji
          const { lng, lat } = e.lngLat;
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 15
          })
        }
      }
    };

    // Přiřadíme vrstvě záběru posluchač kliku
    map.on('click', 'field-of-view-layer', handleCameraClick);

    // Změníme kurzor
    map.on('mouseenter', 'field-of-view-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Vrátíme kurzoru původní stav
    map.on('mouseleave', 'field-of-view-layer', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      // Odstraníme všechny posluchače událostí
      map.off('click', 'field-of-view-layer', handleCameraClick);
      map.off('mouseenter', 'field-of-view-layer', () => { });
      map.off('mouseleave', 'field-of-view-layer', () => { });
    };
  }, [cameras]);

  // Funkce, která se vyvolává po kliknutí na kameru v seznamu nacházejícím v sidebaru
  const selectAndZoomTo = (camera: Camera) => {
    handleSelectCamera(camera)
    // Letíme k vybrané kameře na mapě
    mapRef.current?.flyTo({
      center: [camera.longitude, camera.latitude],
      zoom: 15
    })
  }

  // Funkce, která umožní při tvorbě nové kamery zadat souřadnice jedním klikem
  const startLocationPicking = () => {
    if (!mapRef.current) return;

    // Změníme kurzor na ten, který víc odpovídá právě prováděné manipulaci
    mapRef.current.getCanvas().style.cursor = 'crosshair';

    // Definujeme ovladač události, který zpracuje kliknutý bod
    const handleMapClick = (e: MapMouseEvent) => {
      if (!mapRef.current) return

      // Uložíme si souřadnice
      const { lng, lat } = e.lngLat;

      // Vytvoříme novou kameru
      const newCamera = {
        id: cameras.length + 1,
        isActive: false,
        name: 'Nová kamera',
        latitude: lat,
        longitude: lng,
        angle: 40,
        range: 30,
        direction: 20
      };

      // Otevřeme formulář pro úpravu kamery
      handleSelectCamera(newCamera)

      // Vrátíme kurzor zpátky do "normálního" stavu
      mapRef.current.getCanvas().style.cursor = '';

      // Odstraníme posluchač kluku
      mapRef.current.off('click', handleMapClick);

      // Proletíme se blíž k čerstvě vytvořené kameře
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 15
      })
    };

    // Přidáme posluchač kliku k mnohoúhelníku reprezentujícímu záběr kamery
    mapRef.current.on('click', handleMapClick);
  };

  // Získáme všechny vykreslené kamery
  const getRenderedCameras = (cameras: Camera[], selectedCamera: Camera | null | undefined): Camera[] => {
    if (!selectedCamera) return cameras;

    // Zkusíme najít kameru podle indexu; pokud ve množině není, jedná se o čerstvě vytvořenou kameru
    const index = cameras.findIndex(c => c.id === selectedCamera.id);
    if (index === -1) return [...cameras, selectedCamera];

    // Zaktualizujeme existující kameru
    const updated = [...cameras];
    updated[index] = selectedCamera;
    return updated;
  }

  // Zaktualizujeme mapu na základě provedených změn
  const updateMapData = (cameras: Camera[], selectedCamera?: Camera | null) => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    
    // Vykreslíme všechny vykreslené kamery jakožto GeoJSON Feature Collection
    const allCameras = getRenderedCameras(cameras, selectedCamera);
    const cameraCoverageSource = map.getSource('field-of-view') as GeoJSONSource;
    cameraCoverageSource.setData(generateCameraViewFeatureCollection(allCameras))
  }

  // Funkce umožňující přepínání vrstev (stylů) mapy
  const switchMapLayer = (layerId: string) => {
    if (mapRef.current && layerId !== currentMapLayer) {
      setCurrentMapLayer(layerId);
      mapRef.current.setStyle(mapLayers[layerId].url)
    }
  }

  const closeErrorModal = () => {
    setErrorState(prevState => ({
      ...prevState,
      isShown: false
    }))
  }

  // Funkce, která uloží vybranou kameru do stavu a také do ref, aby se s ní mohlo plynule pracovat
  // z hlediska grafiky
  const handleSelectCamera = (camera: Camera) => {
    setSelectedCamera(camera)
    selectedCameraRef.current = { ...camera };

    const cameraId = camera?.id ?? -1;

    // Zapneme filtr symbolizující výběr kamery
    if (mapRef.current?.getLayer('camera-highlight-layer')) {
    mapRef.current.setFilter('camera-highlight-layer', ['==', 'id', cameraId]);
  }
  }

  // Zahodíme všechny neuložené změny
  const cancelCameraEdit = () => {
    setSelectedCamera(null);
    selectedCameraRef.current = null;
    // Odstraníme vrstvu, která symbolizuje to, že kamera byla vybrána
    mapRef.current?.setFilter('camera-highlight-layer', ['==', 'id', -1]);
    updateMapData(cameras, null);
  };

  // Zpracujeme změny bez manipulace se stavem, abychom měli nejrychlejší vizualizaci
  const handleTemporaryEdit = (field: keyof Camera, value: number | string) => {
    if (!selectedCameraRef.current) return;

    selectedCameraRef.current = {
      ...selectedCameraRef.current,
      [field]: value,
    };

    updateMapData(camerasRef.current, selectedCameraRef.current);
  };

  // Funkce sloužící k ukládání změn do množiny kamer
  const submitCameraChanges = () => {
    if (!selectedCameraRef.current) return;

    setCameras((prevCameras) => {
      const index = prevCameras.findIndex(c => c.id === selectedCameraRef.current!.id);

      // Podle indexu zjistíme, zda je kamera nová, a pokud ano, tak ji přidáme do množiny
      if (index === -1) return [...prevCameras, selectedCameraRef.current!];

      // V tomto bloku už víme, že kamera již existuje, takže ji aktualizujeme
      const updated = [...prevCameras];
      updated[index] = { ...selectedCameraRef.current! };
      return updated;
    });

    setSelectedCamera(null)
  };

  return (
    <>
      <div className='w-full h-screen relative'>

        {/* Kontejner pro mapu */}
        <div className='w-full h-full' ref={mapContainerRef}></div>
        {errorState.isShown && (
          <ErrorModal
            errorMessage={errorState.message}
            retryFunction={errorState.retryFunction}
            closeErrorModal={closeErrorModal}
          />
        )}

        {/* Sidebar */}
        <SideBar
         cameras={cameras}
         selectedCamera={selectedCamera}
         selectAndZoomTo={selectAndZoomTo}
         startLocationPicking={startLocationPicking}
        />

        {/* Formulář pro přidání a úpravu kamery */}
        {selectedCamera && (
          <CameraEditor
            selectedCamera={selectedCamera}
            cancelCameraEdit={cancelCameraEdit}
            onTemporaryEdit={handleTemporaryEdit}
            onCommitEdit={submitCameraChanges}
          />
        )}

        {/* Přepínač vrstev */}
        <LayerSwitch
          mapLayers={mapLayers}
          currentMapLayer={currentMapLayer}
          switchMapLayer={switchMapLayer}
        />
      </div>
    </>
  )
}

export default App
