+(function () {
    const inputFile = document.getElementById('app-input-file');
    const inputX = document.getElementById('app-input-x');
    const inputY = document.getElementById('app-input-y');
    const btnDownload = document.getElementById('app-btn-download');
    const feedback = document.getElementById('app-feedback');
    const canvas = document.getElementById('app-canvas');

    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });

    const scale = 40;
    const cellPadX = 4;
    const cellPadY = 4;
    const fontSize = 12;
    const maxImgSize = 300;

    const state = {
        img: null,
        x: 0,
        y: 0
    };

    const error = (message) => {
        feedback.textContent = message;
    };

    const getImgData = (img) => {
        tmpCanvas.width = img.width;
        tmpCanvas.height = img.height;

        tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(img, 0, 0);

        return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    };

    const draw = () => {
        const { img, x, y } = state;

        if (!img) {
            return;
        }

        const imgNaturalWidth = img.width;
        const imgWidth = Math.min(img.width, maxImgSize);
        const imgHeight = Math.min(img.height, maxImgSize);

        canvas.width = imgWidth * scale;
        canvas.height = imgHeight * scale;

        const ctx = canvas.getContext('2d');

        // Reset
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.imageSmoothingEnabled = false;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        // Draw text
        ctx.scale(1 / scale, 1 / scale);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'top';

        const imgData = getImgData(img);

        for (let i = 0; i < imgWidth; i++) {
            for (let j = 0; j < imgHeight; j++) {
                const textX = i * scale + cellPadX;
                const textY = j * scale + cellPadY;
                const textY2 = textY + cellPadY + fontSize;

                const p = 4 * (j * imgNaturalWidth + i);

                const r = imgData.data[p + 0];
                const g = imgData.data[p + 1];
                const b = imgData.data[p + 2];
                const a = imgData.data[p + 3];

                const isDark = (r + g + b) / 3 < 64 && a >= 64;

                ctx.fillStyle = isDark ? '#ffffff' : '#000000';

                ctx.fillText(`${x + i},`, textX, textY, scale);
                ctx.fillText(`${y + j}`, textX, textY2, scale);
            }
        }

        // Render download link
        btnDownload.setAttribute('download', 'PixelMap.png');

        btnDownload.setAttribute(
            'href',
            canvas.toDataURL('image/png')
                .replace('image/png', 'image/octet-stream')
        );
    };

    const setState = (newState) => {
        Object.assign(state, newState);

        draw();
    };

    inputFile.addEventListener('change', function (e) {
        const img = new Image();

        img.addEventListener('load', function () {
            state.img = this;

            setState({
                img: this
            });
        });

        img.addEventListener('error', function (e) {
            error(e.type);
        });

        img.src = URL.createObjectURL(this.files[0]);
    });

    inputX.addEventListener('change', function (e) {
        setState({
            x: Number(this.value)
        });
    });

    inputY.addEventListener('change', function (e) {
        setState({
            y: Number(this.value)
        });
    });
})();
