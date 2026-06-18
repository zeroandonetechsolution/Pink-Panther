// Face recognition configuration
const MODEL_URL = 'https://unpkg.com/face-api.js@0.22.2/model/';
let faceMatcher = null;
let labeledFaceDescriptors = [];
let video = document.getElementById('video');
let overlay = document.getElementById('overlay');
let status = document.getElementById('status');
let isModelLoaded = false;

// Load face-api.js models
async function loadModels() {
    status.textContent = 'Loading AI models... Please wait!';
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        isModelLoaded = true;
        status.textContent = 'Models loaded! Click "Register My Face" to get started!';
        startVideo();
    } catch (error) {
        status.textContent = 'Error loading models! Please check your internet connection.';
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
    if (!isModelLoaded) {
        status.textContent = 'Please wait for models to load!';
        return;
    }
    
    status.textContent = 'Looking at your face... Please stay still!';
    
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
});

// Login with face
document.getElementById('loginBtn').addEventListener('click', async () => {
    if (!isModelLoaded) {
        status.textContent = 'Please wait for models to load!';
        return;
    }
    
    // Load registered face
    const savedDescriptor = localStorage.getItem('bossFaceDescriptor');
    if (!savedDescriptor) {
        status.textContent = '⚠️ Please register your face first!';
        return;
    }
    
    status.textContent = 'Verifying your face...';
    
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
