import * as THREE from '../js/three.module.js';
import { ColladaLoader } from '../js/ColladaLoader.js';
import { OrbitControls } from '../js/OrbitControls.js';

var container, clock, controls;
var camera, scene, renderer, mixer, animations, avatar;
var isPlayed = true;

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    if (mixer !== undefined) {
        mixer.update(delta);
    }
    renderer.render(scene, camera);
}

function loadScene() {

    container = document.getElementById('threejscontainer');
    if (!container) {
        return;
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(25, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(15, 10, - 15);
    
    clock = new THREE.Clock();

    var loader = new ColladaLoader();
    loader.load('../models/stormtrooper.dae', function (collada) {
        scene.remove(scene.getObjectByName("avatar"));

        animations = collada.animations;
        avatar = collada.scene;
        avatar.traverse(function (node) {

            if (node.isSkinnedMesh) {
                node.frustumCulled = false;
            }
        });

        mixer = new THREE.AnimationMixer(avatar);
        if (isPlayed) {
            mixer.clipAction(animations[0]).play();
        }

        avatar.name = "avatar";
        scene.add(avatar);
    });

    var gridHelper = new THREE.GridHelper(10, 20);
    scene.add(gridHelper);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    scene.add(camera);
    camera.add(pointLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    while (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }

    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 2, 0);
    controls.update();

    animate();
}

function onStart() {
    isPlayed = true;
}

function onStop() {
    isPlayed = false;
}

window.ThreeJSFunctions = {
    load: () => { loadScene(); },
    stop: () => { onStop(); },
    start: () => { onStart(); },
};

window.onload = loadScene;
