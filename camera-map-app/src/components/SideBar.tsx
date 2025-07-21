import type { Camera } from "../types";

/**
 * Vlastnosti sidebaru.
 * @interface SideBarProps
 */
interface SideBarProps {
    cameras: Camera[];
    selectedCamera: Camera | null;
    selectAndZoomTo: (camera: Camera) => void;
    startLocationPicking: () => void;
}

export default function SideBar({
    cameras,
    selectedCamera,
    selectAndZoomTo,
    startLocationPicking
}: SideBarProps) {
    return (
        <div className='absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 w-80 h-100 overflow-y-hidden z-[1] flex flex-col gap-4'>
            <header className='flex justify-between'>
                <h1 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                    <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M14 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Zm2 9.387 4.684 1.562A1 1 0 0 0 22 17V7a1 1 0 0 0-1.316-.949L16 7.613v8.774Z" clipRule="evenodd" />
                    </svg>
                    Kamery
                </h1>

                {/* Tlačítko pro přidání nové kamery */}
                <button
                    type='button'
                    className='w-8 h-8 bg-green-700 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-green-800'
                    onClick={() => {
                        startLocationPicking();
                    }
                    }
                >
                    <svg width='12' height='12' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M1.22229 5.00019H8.77785M5.00007 8.77797V1.22241' stroke='white' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'></path>
                    </svg>
                </button>

            </header>

            {/* Seznam kamer */}
            <div className='flex flex-col gap-1 overflow-y-auto border-t border-b pb-4 border-gray-300 p-2'>
                {cameras.map(camera => (
                    <button
                        key={camera.id}
                        onClick={() => selectAndZoomTo(camera)}
                        className={`w-full text-left p-2 rounded transition-colors cursor-pointer ${camera.id === selectedCamera?.id ? 'bg-gray-100 hover:bg-gray-200 outline-solid outline-blue-800' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                        <div className='font-medium flex items-center'>
                            {/* Indikátor stavu kamery */}
                            <img
                                src={`/icons/camera-${camera.isActive ? 'on' : 'off'}.svg`}
                                className='flex w-5 h-5 me-2'
                                alt={`Kamera ${camera.isActive ? '' : 'ne'}aktitvní`}
                            />
                            <span className='truncate'>
                                {camera.name}
                            </span>
                        </div>
                        <div className='text-sm text-gray-600'>
                            Dosah: {camera.range}m | Směr: {camera.direction}° | Úhel: {camera.angle}°
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}