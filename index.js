(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (pixel, filterName) {
        var filters = {
            invert: function (pixel) {
                pixel[0] = 255 - pixel[0];
                pixel[1] = 255 - pixel[1];
                pixel[2] = 255 - pixel[2];

                return pixel;
            },
            grayscale: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            },
            threshold: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            }
        };

        return filters[filterName](pixel);
    };

    var applyFilter = function () {
        var filterName = document.querySelector('.controls__filter').value;

        var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        var imageDataActualLength = imageData.data.length / 4;

        for (var i = 0; i < imageDataActualLength; i++) {
            var currentPixel = [
                imageData.data[i * 4 + 0],
                imageData.data[i * 4 + 1],
                imageData.data[ i * 4 + 2]
            ];

            currentPixel = applyFilterToPixel(currentPixel, filterName);

            imageData.data[i * 4 + 0] = currentPixel[0];
            imageData.data[i * 4 + 1] = currentPixel[1];
            imageData.data[i * 4 + 2] = currentPixel[2];
        }

        canvas.getContext('2d').putImageData(imageData, 0, 0);
    };

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();
