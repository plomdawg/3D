scene, camera, renderer, controls;
let currentModel;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    loadModel('models/keychain1.stl', 0xff0000);
}

function loadModel(path, color) {
    const loader = new THREE.STLLoader();
    loader.load(path, (geometry) => {
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        
        if (currentModel) {
            scene.remove(currentModel);
        }
        
        scene.add(mesh);
        currentModel = mesh;
        
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        camera.position.z = cameraZ * 1.5;
        
        const minZ = box.min.z;
        const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;
        
        camera.far = cameraToFarEdge * 3;
        camera.updateProjectionMatrix();
        
        controls.target.set(center.x, center.y, center.z);
        controls.update();
    });
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
