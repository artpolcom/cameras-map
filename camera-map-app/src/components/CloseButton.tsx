/**
 * Vlastnosti tlačítka pro zavírání okna.
 * @interface CloseButtonProps 
 */
interface CloseButtonProps {
    onClose: () => void;
}

export default function CloseButton({
    onClose
}: CloseButtonProps) {
    return (
        <button
            onClick={() => onClose()}
            className='text-gray-400 cursor-pointer transition-all duration-200 hover:text-gray-700'
        >
            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
        </button>
    )
}