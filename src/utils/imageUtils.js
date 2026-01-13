/**
 * Process an image file: resize and center-crop to a square.
 * @param {File} file - The uploaded image file.
 * @param {number} size - Target width/height in pixels (default 300).
 * @returns {Promise<string>} - Base64 string of the processed image.
 */
export const processImage = (file, size = 300) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // Calculate crop
                const aspect = img.width / img.height;
                let sx, sy, sWidth, sHeight;

                if (aspect > 1) {
                    // Landscape: crop width
                    sHeight = img.height;
                    sWidth = img.height; // Square based on height
                    sx = (img.width - img.height) / 2;
                    sy = 0;
                } else {
                    // Portrait: crop height
                    sWidth = img.width;
                    sHeight = img.width; // Square based on width
                    sx = 0;
                    sy = (img.height - img.width) / 2;
                }

                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
