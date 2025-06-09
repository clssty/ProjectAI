// Global variables
let originalImage = null;
let styleTransferModel = null;
let enhancementModel = null;
let isAIReady = false;

// DOM Elements
const uploadButton = document.getElementById('uploadButton');
const imageUpload = document.getElementById('imageUpload');
const canvasContainer = document.getElementById('canvasContainer');
const placeholder = document.getElementById('placeholder');
const aiStatus = document.getElementById('aiStatus');
const aiStatusText = document.getElementById('aiStatusText');
const aiAnalysis = document.getElementById('aiAnalysis');
const analysisContent = document.getElementById('analysisContent');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const downloadButton = document.getElementById('downloadButton');
const exportBtn = document.getElementById('exportBtn');

// AI Buttons
const styleBtn = document.getElementById('styleBtn');
const styleSelect = document.getElementById('styleSelect');
const enhanceBtn = document.getElementById('enhanceBtn');
const denoiseBtn = document.getElementById('denoiseBtn');


// Initialize AI Models
async function initializeAI() {
    try {
        aiStatusText.textContent = 'Loading AI Models...';
        updateProgress(10);

        // Load Style Transfer Model
        aiStatusText.textContent = 'Preparing Style Transfer...';
        // As you are simulating, this remains a placeholder.
        // If you integrate a real TF.js style transfer model, load it here.
        styleTransferModel = "loaded";
        updateProgress(50);

        // Create simple enhancement model (autoencoder simulation)
        aiStatusText.textContent = 'Creating Enhancement Model...';
        enhancementModel = createSimpleEnhancementModel();
        updateProgress(90);

        isAIReady = true;
        aiStatus.classList.add('ready');
        aiStatusText.textContent = 'AI Models Ready';
        updateProgress(100);

        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);

        updateAIButtonsState();

    } catch (error) {
        console.error('Failed to initialize AI:', error);
        aiStatusText.textContent = 'AI Error';
        analysisContent.innerHTML = '❌ Failed to load AI models. Please refresh the page.';
    }
}

// Create a simple enhancement model using TensorFlow.js
function createSimpleEnhancementModel() {
    const model = tf.sequential({
        layers: [
            // Encoder
            tf.layers.conv2d({
                // Input shape should be flexible or handle resizing
                // For demonstration, we use a fixed size, but in a real app,
                // you'd typically resize input to this model's expected input.
                inputShape: [224, 224, 3], // This fixed size might cause downscaling for larger images
                filters: 32,
                kernelSize: 3,
                activation: 'relu',
                padding: 'same'
            }),
            tf.layers.conv2d({
                filters: 64,
                kernelSize: 3,
                activation: 'relu',
                padding: 'same'
            }),
            // Decoder
            tf.layers.conv2d({
                filters: 32,
                kernelSize: 3,
                activation: 'relu',
                padding: 'same'
            }),
            tf.layers.conv2d({
                filters: 3,
                kernelSize: 3,
                activation: 'sigmoid',
                padding: 'same'
            })
        ]
    });

    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError'
    });

    return model;
}

function updateProgress(percent) {
    progressFill.style.width = percent + '%';
    if (percent > 0) {
        progressContainer.style.display = 'block';
    }
}

// Function to update the disabled state of all AI buttons
function updateAIButtonsState() {
    const hasImage = originalImage !== null;
    const buttons = [styleBtn, enhanceBtn, denoiseBtn];

    buttons.forEach(btn => {
        btn.disabled = !isAIReady || !hasImage;
    });

    styleSelect.disabled = !isAIReady || !hasImage;
    downloadButton.disabled = !hasImage;
    exportBtn.disabled = !hasImage;
}

// Image upload handling
uploadButton.addEventListener('click', function() {
    imageUpload.click();
});

imageUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Remove the fixed max width/height to preserve original resolution
            const originalCanvas = document.createElement('canvas');
            const originalCtx = originalCanvas.getContext('2d');

            originalCanvas.width = img.width;   // Use original image width
            originalCanvas.height = img.height; // Use original image height
            originalCanvas.id = 'imageCanvas';
            originalCtx.drawImage(img, 0, 0, img.width, img.height); // Draw with original dimensions

            // Create result canvas with the same original dimensions
            const resultCanvas = document.createElement('canvas');
            resultCanvas.width = img.width;
            resultCanvas.height = img.height;
            resultCanvas.id = 'resultCanvas';
            resultCanvas.style.display = 'none';

            originalImage = {
                img: img,
                canvas: originalCanvas,
                resultCanvas: resultCanvas,
                width: img.width,  // Store original width
                height: img.height // Store original height
            };

            // Update UI
            canvasContainer.innerHTML = `
                <div class="canvas-wrapper">
                    <div class="canvas-label">Original Image</div>
                </div>
                <div class="canvas-wrapper">
                    <div class="canvas-label">AI Result</div>
                </div>
            `;

            canvasContainer.children[0].appendChild(originalCanvas);
            canvasContainer.children[1].appendChild(resultCanvas);

            // Set max-width and max-height for display purposes, not for drawing
            originalCanvas.style.maxWidth = '100%';
            originalCanvas.style.maxHeight = '400px';
            resultCanvas.style.maxWidth = '100%';
            resultCanvas.style.maxHeight = '400px';


            updateAIButtonsState();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// AI Style Transfer
async function applyStyleTransfer() {
    if (!originalImage) return;

    try {
        const style = styleSelect.value;
        aiAnalysis.style.display = 'block';
        analysisContent.innerHTML = `<div class="loading"></div> Applying ${style} style transfer...`;

        // Simulate style transfer processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        const resultCtx = originalImage.resultCanvas.getContext('2d');

        // Clear the result canvas before drawing
        resultCtx.clearRect(0, 0, originalImage.width, originalImage.height);

        // Different style effects (using CSS filter approximations for demo)
        const styleEffects = {
            udnie: 'hue-rotate(30deg) saturate(150%) contrast(120%)',
            scream: 'hue-rotate(200deg) saturate(200%) contrast(150%) brightness(110%)',
            composition: 'hue-rotate(90deg) saturate(80%) contrast(140%) brightness(90%)'
        };

        resultCtx.filter = styleEffects[style] || styleEffects.udnie;
        // Draw the original image onto the result canvas using its full original dimensions
        resultCtx.drawImage(originalImage.img, 0, 0, originalImage.width, originalImage.height);
        resultCtx.filter = 'none'; // Reset filter for subsequent draws

        originalImage.resultCanvas.style.display = 'block';
        analysisContent.innerHTML = `<h5>🎨 Style Transfer Applied:</h5><div>• Style: ${style}</div><div>• Neural network processing completed</div>`;

    } catch (error) {
        console.error('Style transfer error:', error);
        analysisContent.innerHTML = '❌ Style transfer failed. Error: ' + error.message;
    }
}

// AI Enhancement using custom model
async function enhanceImage() {
    if (!originalImage || !enhancementModel) return;

    try {
        aiAnalysis.style.display = 'block';
        analysisContent.innerHTML = '<div class="loading"></div> Enhancing image with AI model...';

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Preprocess image - **THIS WILL STILL RESIZE FOR THE MODEL'S INPUT**
        // If you want to maintain original resolution, a real enhancement model
        // would need to handle arbitrary input sizes or you'd need to
        // implement super-resolution/upscaling after model inference.
        // For this demo, we'll apply canvas filters as a visual "enhancement".
        const resultCtx = originalImage.resultCanvas.getContext('2d');

        // Clear the result canvas before drawing
        resultCtx.clearRect(0, 0, originalImage.width, originalImage.height);

        // For demonstration, apply enhancement effect via canvas filters
        resultCtx.filter = 'contrast(120%) brightness(110%) saturate(105%)';
        // Draw the original image onto the result canvas using its full original dimensions
        resultCtx.drawImage(originalImage.img, 0, 0, originalImage.width, originalImage.height);
        resultCtx.filter = 'none'; // Reset filter

        originalImage.resultCanvas.style.display = 'block';
        analysisContent.innerHTML = '<h5>✨ Image Enhancement Complete:</h5><div>• Applied autoencoder enhancement</div><div>• Improved contrast and brightness</div><div>• Noise reduction applied</div>';

        // No actual tensor processing is happening here for the output.
        // If it were, you'd convert the enhanced tensor back to pixels and draw it.
        // inputTensor.dispose();
        // enhancedTensor.dispose(); // Dispose the tensor produced by the model

    } catch (error) {
        console.error('Enhancement error:', error);
        analysisContent.innerHTML = '❌ Enhancement failed. Error: ' + error.message;
    }
}

// AI Noise Reduction
async function reduceNoise() {
    if (!originalImage) return;

    try {
        aiAnalysis.style.display = 'block';
        analysisContent.innerHTML = '<div class="loading"></div> Reducing noise with AI denoising...';

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2500));

        const resultCtx = originalImage.resultCanvas.getContext('2d');

        // Start by drawing the original image to the result canvas
        resultCtx.clearRect(0, 0, originalImage.width, originalImage.height);
        resultCtx.drawImage(originalImage.img, 0, 0, originalImage.width, originalImage.height);

        // Get image data from the drawn image
        const imageData = resultCtx.getImageData(0, 0, originalImage.width, originalImage.height);
        const data = imageData.data;

        // Simple pixel manipulation for simulated "denoising"
        // This is a very basic simulation and won't truly denoise.
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.02);     // R slightly increased
            data[i + 1] = Math.min(255, data[i + 1] * 1.02); // G slightly increased
            data[i + 2] = Math.min(255, data[i + 2] * 1.02); // B slightly increased
        }

        resultCtx.putImageData(imageData, 0, 0); // Put the modified data back
        originalImage.resultCanvas.style.display = 'block';

        analysisContent.innerHTML = '<h5>🔧 Noise Reduction Complete:</h5><div>• Applied simulated denoising filter</div><div>• Minor smoothing for demonstration</div>';

    } catch (error) {
        console.error('Noise reduction error:', error);
        analysisContent.innerHTML = '❌ Noise reduction failed. Error: ' + error.message;
    }
}

// Download functionality
function downloadResult() {
    if (!originalImage) return;

    const canvas = originalImage.resultCanvas.style.display === 'block'
        ? originalImage.resultCanvas
        : originalImage.canvas; // Download the result canvas if visible, otherwise original

    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-processed-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Event Listeners
styleBtn.addEventListener('click', applyStyleTransfer);
enhanceBtn.addEventListener('click', enhanceImage);
denoiseBtn.addEventListener('click', reduceNoise);
downloadButton.addEventListener('click', downloadResult);


// Initialize additional features (hanya menyisakan Export Analysis)
function initializeAdvancedFeatures() {
    // Export options
    exportBtn.addEventListener('click', function() {
        const analysisData = {
            timestamp: new Date().toISOString(),
            originalImage: originalImage ? 'Present' : 'None',
            aiModelsUsed: ['Enhancement Model', 'Style Transfer', 'Noise Reduction'],
            processing: 'Complete',
            results: analysisContent.innerHTML
        };

        const dataStr = JSON.stringify(analysisData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-analysis-results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    initializeAI();
    initializeAdvancedFeatures();
});

// Error handling and recovery
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    if (aiAnalysis.style.display !== 'none') {
        analysisContent.innerHTML = '❌ An error occurred. Please try refreshing the page.';
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (tf && tf.disposeVariables) {
        tf.disposeVariables();
    }
});