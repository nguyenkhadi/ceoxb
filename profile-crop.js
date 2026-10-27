window.profileCroppedFile = null;
window.profileCropPending = false;

const dropZone = document.getElementById("picture-drop-zone");

if (dropZone) {
    const input = document.getElementById("edit-picture");
    const editor = document.getElementById("picture-editor");
    const canvas = document.getElementById("crop-canvas");
    const ctx = canvas.getContext("2d");

    const zoomInput = document.getElementById("crop-zoom");
    const applyButton = document.getElementById("crop-apply");
    const cancelButton = document.getElementById("crop-cancel");

    const preview = document.getElementById("profile-picture-preview");
    const message = document.getElementById("profile-result");

    let image = new Image();
    let imageUrl = "";
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function limitPosition() {
        const width = image.width * scale;
        const height = image.height * scale;

        const maxX = (width - canvas.width) / 2;
        const maxY = (height - canvas.height) / 2;

        offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
        offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
    }

    function drawImage() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = image.width * scale;
        const height = image.height * scale;

        const x = (canvas.width - width) / 2 + offsetX;
        const y = (canvas.height - height) / 2 + offsetY;

        ctx.drawImage(image, x, y, width, height);
    }

    function closeEditor() {
        editor.close();

        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
            imageUrl = "";
        }

        window.profileCropPending = false;
        input.value = "";
    }

    function openEditor(file) {
        if (!file) {
            return;
        }

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowed.includes(file.type)) {
            message.textContent = "Please select a JPG, PNG, or WebP image.";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            message.textContent = "Please select an image smaller than 2 MB.";
            return;
        }

        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }

        window.profileCropPending = true;
        window.profileCroppedFile = null;
        message.textContent = "";

        imageUrl = URL.createObjectURL(file);
        image = new Image();

        image.onload = function() {
            scale = Math.max(
                canvas.width / image.width,
                canvas.height / image.height
            );

            offsetX = 0;
            offsetY = 0;
            zoomInput.value = 1;

            drawImage();
            editor.showModal();
        };

        image.onerror = function() {
            message.textContent = "Unable to open this image.";
            URL.revokeObjectURL(imageUrl);
            imageUrl = "";
            window.profileCropPending = false;
            input.value = "";
        };

        image.src = imageUrl;
    }

    // Select an image
    input.addEventListener("change", function() {
        openEditor(input.files[0]);
    });

    // Click the upload area
    dropZone.addEventListener("click", function(event) {
        if (event.target !== input) {
            input.click();
        }
    });

    // Drag and drop
    dropZone.addEventListener("dragover", function(event) {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", function() {
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", function(event) {
        event.preventDefault();
        dropZone.classList.remove("drag-over");

        const file = event.dataTransfer.files[0];
        openEditor(file);
    });

    // Zoom
    zoomInput.addEventListener("input", function() {
        scale = Math.max(
            canvas.width / image.width,
            canvas.height / image.height
        ) * Number(zoomInput.value);

        limitPosition();
        drawImage();
    });

    // Drag photo within crop circle
    canvas.addEventListener("pointerdown", function(event) {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", function(event) {
        if (!dragging) {
            return;
        }

        const ratio = canvas.width / canvas.getBoundingClientRect().width;

        offsetX += (event.clientX - lastX) * ratio;
        offsetY += (event.clientY - lastY) * ratio;

        lastX = event.clientX;
        lastY = event.clientY;

        limitPosition();
        drawImage();
    });

    canvas.addEventListener("pointerup", function() {
        dragging = false;
    });

    canvas.addEventListener("pointercancel", function() {
        dragging = false;
    });

    // Apply crop
    applyButton.addEventListener("click", function() {
        const output = document.createElement("canvas");
        output.width = 512;
        output.height = 512;

        const outputCtx = output.getContext("2d");

        outputCtx.fillStyle = "#ffffff";
        outputCtx.fillRect(0, 0, 512, 512);

        const ratio = 512 / canvas.width;

        outputCtx.drawImage(
            image,
            ((canvas.width - image.width * scale) / 2 + offsetX) * ratio,
            ((canvas.height - image.height * scale) / 2 + offsetY) * ratio,
            image.width * scale * ratio,
            image.height * scale * ratio
        );

        output.toBlob(function(blob) {
            if (!blob) {
                message.textContent = "Unable to crop the image.";
                return;
            }

            window.profileCroppedFile = new File(
                [blob],
                "avatar.jpg",
                { type: "image/jpeg" }
            );

            preview.src = URL.createObjectURL(blob);
            preview.hidden = false;

            input.required = false;
            message.textContent = "Photo ready. Click Save Profile.";

            closeEditor();
        }, "image/jpeg", 0.9);
    });

    cancelButton.addEventListener("click", closeEditor);

    editor.addEventListener("cancel", function(event) {
        event.preventDefault();
        closeEditor();
    });
}
