import * as turf from "@turf/turf";
import type { Feature, Polygon, GeoJsonProperties, FeatureCollection } from "geojson";
import type { Camera } from "../types";

// Funkce, která vykreslí záběr kamery jakožto mnohoúhelník
export const createCameraViewShape = ({
    latitude,
    longitude,
    direction,
    angle,
    range,
    id
}: Camera): Feature<Polygon, GeoJsonProperties> => {
    const center = [longitude, latitude];
    const coords = [center];
    const halfAngle = angle / 2;
    const startAngle = direction - halfAngle;
    const endAngle = direction + halfAngle;
    const steps = 32;

    // Vypočítáváme body, ze kterých se skládá vizualizace záběru
    for (let i = 0; i <= steps; i++) {
        const theta = startAngle + ((endAngle - startAngle) * i) / steps;
        const point = turf.destination(center, range, theta, { units: 'meters' });
        coords.push(point.geometry.coordinates);
    }

    // Uzavíráme vzniklý geometrický tvar
    coords.push(center);

    // Výsledkem je mnohoúhelník ve formátu GeoJSON 
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [coords],
        },
        properties: { id },
    };
};

// Pomocná funkce ke generování GeoJSON Feature Collection 
export const generateCameraViewFeatureCollection = (
    cams: Camera[]
): FeatureCollection<Polygon, GeoJsonProperties> => ({
    type: "FeatureCollection",
    features: cams.map(createCameraViewShape),
});