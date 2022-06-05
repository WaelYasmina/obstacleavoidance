import * as THREE from 'three';
import * as YUKA from 'yuka';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 20, 4);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 10, -10);
scene.add(directionalLight);

const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
vehicleGeometry.computeBoundingSphere();
vehicleGeometry.rotateX(Math.PI * 0.5);
const vehicleMaterial = new THREE.MeshNormalMaterial();
const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
vehicleMesh.matrixAutoUpdate = false;
scene.add(vehicleMesh);

const vehicle = new YUKA.Vehicle();

vehicle.boundingRadius = vehicleGeometry.boundingSphere.radius;

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

vehicle.setRenderComponent(vehicleMesh, sync);

const path = new YUKA.Path();
path.add( new YUKA.Vector3(-16, 0, 0));
path.add( new YUKA.Vector3(16, 0, 0));

path.loop = true;

vehicle.position.copy(path.current());

vehicle.maxSpeed = 3;

const followPathBehavior = new YUKA.FollowPathBehavior(path, 0.5);
vehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
vehicle.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

const obstacleGeometry = new THREE.BoxGeometry();
obstacleGeometry.computeBoundingSphere();
const obstacleMaterial = new THREE.MeshPhongMaterial({color: 0xee0808});

const obstacleMesh1 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh1);
obstacleMesh1.position.set(-13, 0, 0);

const obstacleMesh2 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh2);
obstacleMesh2.position.set(4, 0, 0);

const obstacleMesh3 = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
scene.add(obstacleMesh3);
obstacleMesh3.position.set(12, 0, 0);

const obstacle1 = new YUKA.GameEntity();
obstacle1.position.copy(obstacleMesh1.position);
entityManager.add(obstacle1);
obstacle1.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacle2 = new YUKA.GameEntity();
obstacle2.position.copy(obstacleMesh2.position);
entityManager.add(obstacle2);
obstacle2.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacle3 = new YUKA.GameEntity();
obstacle3.position.copy(obstacleMesh3.position);
entityManager.add(obstacle3);
obstacle3.boundingRadius = obstacleGeometry.boundingSphere.radius;

const obstacles = [];
obstacles.push(obstacle1, obstacle2, obstacle3);

const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(obstacles);
vehicle.steering.add(obstacleAvoidanceBehavior);

const position = [];
for(let i = 0; i < path._waypoints.length; i++) {
    const waypoint = path._waypoints[i];
    position.push(waypoint.x, waypoint.y, waypoint.z);
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
scene.add(lines);

const time = new YUKA.Time();

function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});