/**
 * Soubor s mapovými vrstvami.
 * @file mapLayers.ts
 */

// Objekt s mapovými vrstvami
export const mapLayers: {
    [key: string]: {
        name: string;
        url: string;
    }
} = {
    'streets-v12': {
        name: 'Ulice',
        url: 'mapbox://styles/mapbox/streets-v12'
    },
    'satellite-streets-v12': {
        name: 'Satelitní (+ ulice)',
        url: 'mapbox://styles/mapbox/satellite-streets-v12'
    },
    'light-v11': {
        name: 'Světlá',
        url: 'mapbox://styles/mapbox/light-v11'
    },
    'dark-v11': {
        name: 'Tmavá',
        url: 'mapbox://styles/mapbox/dark-v11'
    }
};