import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';

let scene, camera, renderer, controls;
const models = [
    { id: 'tacobell', name: 'Taco Bell sauce holder', url: 'models/tacobell.3mf' },
    { id: 'tacobell2', name: 'placeholder', url: 'models/tacobell.3mf' },
    { id: 'tacobell3', name: 'placeholder', url: 'models/tacobell.3mf' },
    // Add more models as needed
];

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-viewer').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Create model list
    createModelList();

    // Load first model
    loadModel(models[0].url);

    // Start animation loop
    animate();
}

function loadModel(url) {
    const loader = new ThreeMFLoader();
    loader.load(
        url,
        function (object) {
            // Clear existing model
            scene.clear();
            // Add lights back
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);
            // Add new model
            scene.add(object);
            // Center the model
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            // Adjust camera and controls to fit model
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2;
            controls.target.set(0, 0, 0);
            controls.update();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened', error);
        }
    );
}

function createModelList() {
    const modelList = document.getElementById('model-list');
    models.forEach(model => {
        const button = document.createElement('button');
        button.textContent = model.name;
        button.addEventListener('click', () => loadModel(model.url));
        modelList.appendChild(button);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the viewer when the page loads
window.addEventListener('load', init);