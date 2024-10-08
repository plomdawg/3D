let scene, camera, renderer, controls;
let currentModel;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);

    loadModel('models/tacobell.stl', 0xff0000);
}

function loadModel(path, color) {
    const loader = new THREE.STLLoader();
    loader.load(path, (geometry) => {
        const material = new THREE.MeshPhongMaterial({ color: color, specular: 0x111111, shininess: 200 });
        const mesh = new THREE.Mesh(geometry, material);
        
        if (currentModel) {
            scene.remove(currentModel);
        }
        
        scene.add(mesh);
        currentModel = mesh;
        
        // Center the model
        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        mesh.position.sub(center);
        
        // Adjust camera and controls
        fitCameraToObject(camera, mesh, 1.2);
        controls.target.copy(mesh.position);
        controls.update();
    }, 
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.log('An error happened', error);
    });
}

function fitCameraToObject(camera, object, offset) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= offset;
    
    camera.position.z = cameraZ;
    
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;
    
    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();
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

init();
animate();

// Add event listeners for model selection
document.getElementById('model-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('model-thumbnail')) {
        const modelPath = event.target.dataset.model;
        const modelColor = parseInt(event.target.dataset.color);
        loadModel(modelPath, modelColor);
    }
});