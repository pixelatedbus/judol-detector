const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                resolve(event.target.result);
            } else {
                reject(new Error('Failed to read file content as string.'));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file);
    });
};

export const processPatternsFile = async (file: File): Promise<string[]> => {
    const content = await readFileContent(file);
    return content.split('\n').filter(pattern => pattern.trim() !== '');
};

export const processCommentsFile = async (file: File): Promise<string[]> => {
    const content = await readFileContent(file);
    return content.split(';').filter(comment => comment.trim() !== '');
};
