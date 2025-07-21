import { useState } from "react";
import CloseButton from "./CloseButton";
/**
 * Vlastnosti přepínače.
 * @interface LayerSwitchProps 
 */
interface LayerSwitchProps {
    mapLayers: Object;
    currentMapLayer: string;
    switchMapLayer: (layerId: string) => void;
}

export default function LayerSwitch({
    mapLayers,
    currentMapLayer,
    switchMapLayer
}: LayerSwitchProps) {
    const [isShown, setIsShown] = useState(false);
    return (
        <div
            className={`${!isShown ? 'hover:bg-gray-100 transition-all duration-200' : ''} absolute bottom-6 left-15 bg-white rounded-lg shadow-lg p-4 z-10`}
        >
            {!isShown ?
                <button
                    className='absolute top-0 right-0 w-full h-full opacity-100 cursor-pointer z-[25]'
                    onClick={() => setIsShown(true)}
                ></button> :
                null
            }
            <div className='flex justify-between items-center'>
                <h3 className='text-md font-semibold text-gray-800 text-center relative'>
                    Vrstvy
                </h3>
                {isShown &&
                    <CloseButton
                        onClose={() => setIsShown(false)}
                    />
                }
            </div>
            {isShown && (
                <div className='flex flex-col gap-2 mt-3 items-center'>
                    {Object.entries(mapLayers).map(([layerId, layer]) => (
                        <div
                            key={layerId}
                            className='flex items-center gap-1 w-full'>
                            <input
                                id={`map-layer-radio-swtich-${layerId}`}
                                type='radio'
                                onChange={() => switchMapLayer(layerId)}
                                value={layer.name}
                                checked={currentMapLayer === layerId}
                                name='map-layer-radio-input'
                                className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
                            />
                            <label
                                htmlFor={`map-layer-radio-swtich-${layerId}`}
                                className='text-sm font-medium text-gray-900'
                            >
                                {layer.name}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}