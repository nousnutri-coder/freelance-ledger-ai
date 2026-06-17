// Utility functions for file handling

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
    if (file.type !== 'application/pdf') {
        return { valid: false, error: 'El archivo debe ser un PDF' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'El archivo no debe superar 10MB' };
    }

    return { valid: true };
};
