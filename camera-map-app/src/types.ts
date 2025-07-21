/**
 * @file Definice typů, které se používají na vícero místech.
 */

/** 
 * Typ používaný při zobrazení okna s chybou.. Odkazuje k vlastnosti objektus  
 * @typedef ModalType 
 */
export type RetryFunction = () => Promise<void>;

/**
 * Jednotlivá kamera.
 * @interface Camera 
 */
export interface Camera {
    id: number;
    name: string;
    isActive: boolean; 
    latitude: number;
    longitude: number;
    angle: number;
    direction: number;
    range: number;
}
