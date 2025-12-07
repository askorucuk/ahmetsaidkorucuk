import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "https://esm.sh/three/addons/environments/RoomEnvironment.js";
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 30;
controls.minDistance = 2;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const params = {
    count: 2400,
    radius: 12,
    branches: 5,
    spin: 1,
    scale: 10,
    randomness: 0.8,
    randomnessPower: 3,
    insideColor: '#00B7B5',
    outsideColor: '#D78FEE',
};

let instancedMesh = null;
const dummy = new THREE.Object3D();
const originalColors = [];
const originalScales = [];
const colorInside = new THREE.Color(params.insideColor);
const colorOutside = new THREE.Color(params.outsideColor);

const generateGalaxy = () => {
    const geometry = new THREE.OctahedronGeometry(0.1, 0);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1, roughness: 0.15, transmission: 1.0, thickness: 1, ior: 1.7, envMapIntensity: 1.5,
    });

    instancedMesh = new THREE.InstancedMesh(geometry, material, params.count);

    for (let i = 0; i < params.count; i++) {
        const radius = Math.random() * params.radius;
        const spinAngle = radius * params.spin;
        const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

        dummy.position.x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        dummy.position.y = randomY;
        dummy.position.z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        const scale = Math.random() * 0.5 + 0.5;
        dummy.scale.set(scale, scale, scale);
        originalScales.push(scale);

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / params.radius);
        instancedMesh.setColorAt(i, mixedColor);
        originalColors.push(mixedColor.clone());
    }

    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
};

generateGalaxy();

let lastExplosionTime = 0;
const explosionInterval = 0.75;
const explosionDuration = 0.5;
let activeExplosion = null;

function triggerExplosion(currentTime) {
    const explosionCenterIndex = Math.floor(Math.random() * params.count);
    const particlesAffected = [];
    const explosionRadius = 2.75;

    instancedMesh.getMatrixAt(explosionCenterIndex, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    const centerPos = dummy.position.clone();

    for (let i = 0; i < params.count; i++) {
        instancedMesh.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        if (dummy.position.distanceTo(centerPos) < explosionRadius) {
            particlesAffected.push(i);
        }
    }

    if (particlesAffected.length > 0) {
        activeExplosion = {
            startTime: currentTime,
            indices: particlesAffected,
            center: centerPos
        };
    }
}


function updateExplosion(currentTime) {
    if (!activeExplosion || !instancedMesh) return;

    const elapsed = currentTime - activeExplosion.startTime;
    if (elapsed > explosionDuration) {
        activeExplosion.indices.forEach(index => {
            instancedMesh.setColorAt(index, originalColors[index]);
            instancedMesh.getMatrixAt(index, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            const origScale = originalScales[index];
            dummy.scale.set(origScale, origScale, origScale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(index, dummy.matrix);
        });
        instancedMesh.instanceColor.needsUpdate = true;
        instancedMesh.instanceMatrix.needsUpdate = true;
        activeExplosion = null;
        return;
    }

    const explosionStrength = 1 - (elapsed / explosionDuration);
    const flashColor = new THREE.Color(0xEFEFEF);
    activeExplosion.indices.forEach(index => {

        const currentColor = originalColors[index].clone().lerp(flashColor, explosionStrength * 0.8);
        instancedMesh.setColorAt(index, currentColor);

        instancedMesh.getMatrixAt(index, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        const origScale = originalScales[index];
        const currentScale = origScale + (origScale * 2 * explosionStrength);
        dummy.scale.set(currentScale, currentScale, currentScale);

        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
    });

    instancedMesh.instanceColor.needsUpdate = true;
    instancedMesh.instanceMatrix.needsUpdate = true;
}


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const currentTime = clock.getElapsedTime();

    if (instancedMesh) {
        instancedMesh.rotation.y = currentTime * 0.05;
    }

    if (currentTime - lastExplosionTime > explosionInterval) {
        triggerExplosion(currentTime);
        lastExplosionTime = currentTime;
    }

    updateExplosion(currentTime);

    controls.update();
    renderer.render(scene, camera);
}

animate();