// Face recognition configuration
const MODEL_URL = 'https://unpkg.com/face-api.js@0.22.2/model/';
let faceMatcher = null;
let labeledFaceDescriptors = [];
let video = document.getElementById('video');
let overlay = document.getElementById('overlay');
let status = document.getElementById('status');
let isModelLoaded = false;

// Load face-api.js models (only when needed)
async function loadModels() {
    status.textContent = 'Loading AI models... Please wait!';
    try {
        // Try to load models from multiple CDNs
        const modelCDNs = [
            'https://unpkg.com/face-api.js@0.22.2/model/',
            'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/model/'
        ];
        
        let loaded = false;
        for (const url of modelCDNs) {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(url),
                    faceapi.nets.faceLandmark68Net.loadFromUri(url),
                    faceapi.nets.faceRecognitionNet.loadFromUri(url)
                ]);
                isModelLoaded = true;
                loaded = true;
                status.textContent = '✅ Models loaded! Click "Register My Face" to get started!';
                await startVideo();
                break;
            } catch (e) {
                console.warn(`Failed to load from ${url}, trying next...`);
            }
        }
        
        if (!loaded) {
            status.textContent = '⚠️ Face recognition models unavailable - use Simple Login!';
        }
    } catch (error) {
        status.textContent = '⚠️ Face recognition unavailable - use Simple Login!';
        console.error(error);
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
        status.textContent = 'Error accessing camera! Please allow camera access.';
        console.error(error);
    }
}

// Register face
document.getElementById('registerBtn').addEventListener('click', async () => {
    if (!window.faceapi || !isModelLoaded) {
        status.textContent = '⚠️ Face recognition not available - use Simple Login!';
        return;
    }
    
    status.textContent = 'Looking at your face... Please stay still!';
    
    try {
        // Detect face
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
        
        if (detections) {
            // Save face descriptor
            const label = 'boss';
            labeledFaceDescriptors = [new faceapi.LabeledFaceDescriptors(label, [detections.descriptor])];
            faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
            
            // Save to localStorage
            localStorage.setItem('bossFaceDescriptor', JSON.stringify(detections.descriptor));
            
            status.textContent = '✅ Face registered successfully! Now click "Login with Face"!';
        } else {
            status.textContent = '❌ No face detected! Please look at the camera and try again.';
        }
    } catch (error) {
        status.textContent = '⚠️ Face recognition error - use Simple Login!';
        console.error(error);
    }
});

// Login with face
document.getElementById('loginBtn').addEventListener('click', async () => {
    if (!window.faceapi || !isModelLoaded) {
        status.textContent = '⚠️ Face recognition not available - use Simple Login!';
        return;
    }
    
    // Load registered face
    const savedDescriptor = localStorage.getItem('bossFaceDescriptor');
    if (!savedDescriptor) {
        status.textContent = '⚠️ Please register your face first!';
        return;
    }
    
    status.textContent = 'Verifying your face...';
    
    try {
        // Load saved descriptor
        const label = 'boss';
        const descriptor = new Float32Array(JSON.parse(savedDescriptor));
        labeledFaceDescriptors = [new faceapi.LabeledFaceDescriptors(label, [descriptor])];
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        
        // Detect current face
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
        
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
            status.textContent = '❌ No face detected! Please look at the camera.';
        }
    } catch (error) {
        status.textContent = '⚠️ Face recognition error - use Simple Login!';
        console.error(error);
    }
});

// Check if already logged in
function checkLogin() {
    if (localStorage.getItem('zosLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
}

// Simple login fallback
document.getElementById('simpleLoginBtn').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    if (username === 'boss') {
        status.textContent = '✅ Access Granted! Welcome back, Boss!';
        localStorage.setItem('zosLoggedIn', 'true');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        status.textContent = '❌ Invalid username!';
    }
});

// Initialize
checkLogin();
loadModels();
