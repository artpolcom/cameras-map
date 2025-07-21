import { useState, useEffect } from 'react';
import type { Camera } from '../types';
import CloseButton from './CloseButton';

/**
 * Vlastnosti formuláře pro úpravu kamery.
 * @interface CameraEditorProps 
 */

interface CameraEditorProps {
    selectedCamera: Camera;
    cancelCameraEdit: () => void;
    onTemporaryEdit: (field: keyof Camera, value: number | string) => void;
    onCommitEdit: () => void;
}

export default function CameraEditor({
    selectedCamera,
    onTemporaryEdit,
    onCommitEdit,
    cancelCameraEdit
}: CameraEditorProps) {
    // Stav, který určuje, zda se má vykreslit varování
    const [localCamera, setLocalCamera] = useState<Camera | null>(null);

    useEffect(() => {
        setLocalCamera(selectedCamera)
    }, [selectedCamera]);

    if (!localCamera) return null;

    const handleChange = (field: keyof Camera, value: any) => {
        setLocalCamera((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, [field]: value };
            onTemporaryEdit(field, value);
            return updated;
        });
    };

    return (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-6 rounded-lg shadow-2xl min-w-80">
            <div className="flex flex-col mb-2 gap-1">
                <div className='flex justify-between text-xl font-bold'>
                    Správa kamery
                    <CloseButton onClose={cancelCameraEdit} />
                </div>
            </div>

            {/* Název */}

            <div className='mb-2'>
                <label htmlFor='selected-camera-name-input' className='block text-md font-medium'>Název:</label>
                <input
                    type='text'
                    id='selected-camera-name-input'
                    className='mt-2 text-md border border-gray-300 rounded-lg bg-gray-50 p-1 font-medium'
                    onChange={(e) => {
                        handleChange('name', e.target.value)
                    }}
                    value={localCamera.name}
                />
            </div>

            {/* Stav */}

            <div className='mb-2 font-medium'>
                <span className="block text-md font-medium">
                    Stav:
                </span>
                <div className='flex'>
                    <button
                        className={`${localCamera.isActive ? 'bg-green-600 hover:bg-green-800' : 'bg-red-600 hover:bg-red-800'} mt-2 cursor-pointer text-sm py-1 px-2 text-white rounded-sm transition-all duration-200`}
                        onClick={() => handleChange('isActive', !localCamera.isActive)}
                    >
                        {`${localCamera.isActive ? 'A' : 'Nea'}ktivní`}
                    </button>
                </div>
            </div>

            {/* Souřadnice */}
            <div className='font-medium mb-2'>
                <label
                    htmlFor='latitude-input'
                    className='block text-md font-medium self-center grow-2'
                >
                    Lat:
                </label>
                <span className='w-fit mt-2 block p-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-sm'>{localCamera.latitude}</span>
            </div>

            <div className='font-medium mb-2'>
                <label
                    htmlFor='longitude-input'
                    className='block text-md font-medium self-center grow-2'
                >
                    Lng:
                </label>
                <span className='w-fit mt-2 block p-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-sm'>{localCamera.longitude}</span>
            </div>

            {/* Ovládání směru */}
            <div className="mb-2">
                <label htmlFor='direction-input' className="block text-md font-medium">
                    Směr: {localCamera.direction}°
                </label>
                <input
                    type="range"
                    id='direction-input'
                    min="0"
                    max="360"
                    value={localCamera.direction}
                    onChange={(e) => {
                        handleChange('direction', parseInt(e.target.value))
                    }}
                    className="w-full mt-2"
                />
            </div>

            {/* Ovládání dosahu */}
            <div className="mb-2">
                <label htmlFor='range-input' className="block text-md font-medium">
                    Dosah: {localCamera.range}m
                </label>
                <input
                    type="range"
                    id='range-input'
                    min="10"
                    max="400"
                    value={localCamera.range}
                    onChange={(e) => {
                        handleChange('range', parseInt(e.target.value))
                    }}
                    className="w-full mt-2"
                />
            </div>

            {/* Ovládání úhlu */}
            <div className="mb-2">
                <label className="block text-md font-medium">
                    Úhel: {localCamera.angle}°
                </label>
                <input
                    type="range"
                    min="10"
                    max="360"
                    value={localCamera.angle}
                    onChange={(e) => {
                        handleChange('angle', parseInt(e.target.value))
                    }}
                    className="w-full mt-2 mb-3"
                />
            </div>
            <div className='flex gap-4'>
                {/* Tlačítko k uložení změn */}
                <button
                    onClick={() => onCommitEdit()}
                    className="w-full bg-green-600 cursor-pointer hover:bg-green-700 px-4 py-2 text-white rounded font-medium flex items-center justify-center gap-2 transition-all duration-200"
                >
                    Uložit
                </button>

                {/* Tlačítko k zahození změn */}
                <button
                    onClick={() => cancelCameraEdit()}
                    className="w-full bg-red-600 cursor-pointer hover:bg-red-700 px-4 py-2 text-white rounded font-medium flex items-center justify-center gap-2 transition-all duration-200"
                >
                    Vrátit
                </button>
            </div>
        </div>
    )
}