import type { RetryFunction } from "../types";

/**
 * Vlastnosti okna informujícího o chybě.
 * @interface ErrorModalProps
 */
interface ErrorModalProps {
    errorMessage: string;
    retryFunction: RetryFunction | null;
    closeErrorModal: () => void;
}

export default function ErrorModal({
    errorMessage,
    retryFunction,
    closeErrorModal
}: ErrorModalProps) {

    return (
        <div className="bg-opacity-50 fixed inset-0 z-[2] flex items-center justify-center backdrop-blur-xs">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Chyba</h2>
                <p className="mb-6 text-gray-700">{errorMessage}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={closeErrorModal}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 hover:text-gray-100 cursor-pointer transition-all duration-200"
                    >
                        Zavřít
                    </button>
                    {retryFunction && (
                        <button
                            onClick={retryFunction}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer transition-all duration-200"
                        >
                            Zkusit znovu
                        </button>
                    )
                    }
                </div>
            </div>
        </div>
    );
};