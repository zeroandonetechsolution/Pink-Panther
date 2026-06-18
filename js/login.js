// Face recognition configuration
const MODEL_URL = './models/';
let faceMatcher = null;
let labeledFaceDescriptors = [];
let uploadedPhotos = [];
let storedDescriptors = [];
let video = document.getElementById('video');
let overlay = document.getElementById('overlay');
let status = document.getElementById('status');
let photoGrid = document.getElementById('photoGrid');
let isModelLoaded = false;

// Load face-api.js models from local files
async function loadModels() {
    status.textContent = '🎀 Loading Pink Panther AI models... Please wait!';
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        isModelLoaded = true;
        
        // Load existing training data
        loadStoredDescriptors();
        
        status.textContent = '✅ Models loaded! Upload photos to train the AI!';
        await startVideo();
    } catch (error) {
        status.textContent = '⚠️ Error loading models - check console for details';
        console.error('Model loading error:', error);
    }
}

// Start webcam
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
    } catch (error) {
        status.textContent = '⚠️ Camera access denied - use Simple Login instead';
        console.error('Camera error:', error);
    }
}

// Load stored face descriptors from localStorage
function loadStoredDescriptors() {
    const stored = localStorage.getItem('bossFaceDescriptors');
    if (stored) {
        storedDescriptors = JSON.parse(stored).map(d => new Float32Array(d));
        if (storedDescriptors.length > 0) {
            labeledFaceDescriptors = [
                new faceapi.LabeledFaceDescriptors('boss', storedDescriptors)
            ];
            faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
            status.textContent = `✅ AI trained with ${storedDescriptors.length} photos!`;
        }
    }
}

// Save face descriptors to localStorage
function saveDescriptors() {
    localStorage.setItem('bossFaceDescriptors', JSON.stringify(
        storedDescriptors.map(d => Array.from(d))
    ));
}

// Handle photo upload
document.getElementById('photoUpload').addEventListener('change', async (e) => {
    if (!isModelLoaded) {
        status.textContent = '⚠️ Wait for models to load first!';
        return;
    }
    
    const files = Array.from(e.target.files);
    status.textContent = `📸 Processing ${files.length} photo(s)...`;
    
    uploadedPhotos = [];
    photoGrid.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = await createImageElement(file);
        
        // Preview photo
        const preview = document.createElement('div');
        preview.className = 'photo-preview';
        preview.innerHTML = `<img src="${img.src}" style="width:100%; border-radius:8px;">`;
        photoGrid.appendChild(preview);
        
        uploadedPhotos.push(img);
    }
    
    status.textContent = `✅ ${files.length} photo(s) uploaded! Click "Train AI"!`;
});

// Create image element from file
function createImageElement(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Train AI with uploaded photos
document.getElementById('trainBtn').addEventListener('click', async () => {
    if (uploadedPhotos.length === 0) {
        status.textContent = '⚠️ Upload photos first!';
        return;
    }
    
    status.textContent = '🧠 Training AI with your photos...';
    storedDescriptors = [];
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < uploadedPhotos.length; i++) {
        const img = uploadedPhotos[i];
        status.textContent = `🧠 Training AI (${i+1}/${uploadedPhotos.length})...`;
        
        try {
            const detections = await faceapi.detectSingleFace(
                img, new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();
            
            if (detections) {
                storedDescriptors.push(detections.descriptor);
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
        }
    }
    
    if (successCount > 0) {
        labeledFaceDescriptors = [
            new faceapi.LabeledFaceDescriptors('boss', storedDescriptors)
        ];
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        saveDescriptors();
        status.textContent = `🎉 AI trained with ${successCount} photo(s)! Ready to login!`;
    } else {
        status.textContent = '❌ No faces detected in photos! Try clearer images!';
    }
});

// Clear training data
document.getElementById('clearTrainingBtn').addEventListener('click', () => {
    if (confirm('⚠️ Clear all training data?')) {
        storedDescriptors = [];
        uploadedPhotos = [];
        labeledFaceDescriptors = [];
        faceMatcher = null;
        photoGrid.innerHTML = '';
        localStorage.removeItem('bossFaceDescriptors');
        status.textContent = '🗑️ Training data cleared! Upload new photos!';
    }
});

// Login with face
document.getElementById('loginBtn').addEventListener('click', async () => {
    if (!isModelLoaded) {
        status.textContent = '⚠️ Wait for models to load first!';
        return;
    }
    
    if (!faceMatcher || storedDescriptors.length === 0) {
        status.textContent = '⚠️ Train the AI first by uploading photos!';
        return;
    }
    
    status.textContent = '🔍 Verifying your face...';
    
    try {
        const detections = await faceapi.detectSingleFace(
            video, new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();
        
        if (detections) {
            const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
            
            if (bestMatch.label === 'boss' && bestMatch.distance < 0.6) {
                status.textContent = '✅ Access Granted! Welcome back, Boss!';
                localStorage.setItem('zosLoggedIn', 'true');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                status.textContent = '❌ Access Denied! Face not recognized!';
            }
        } else {
            status.textContent = '❌ No face detected! Look at the camera!';
        }
    } catch (error) {
        status.textContent = '⚠️ Recognition error - try again!';
        console.error('Login error:', error);
    }
});

// Check if already logged in
function checkLogin() {
    if (localStorage.getItem('zosLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
}

// Initialize
checkLogin();
loadModels();
