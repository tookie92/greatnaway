import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment';
import {ARButton} from 'three/examples/jsm/webxr/ARButton';

let mixer;
const container = document.getElementById('container');



const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

//Scene
const pmremGenerator = new THREE.PMREMGenerator( renderer );
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.05 ).texture;

//xr
document.body.appendChild(ARButton.createButton( renderer ) );



//camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(5,2,8);

//Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;


//Add 3d Model
const loader = new GLTFLoader();
loader.load('./src/hand.glb', function(glb){
  const model = glb.scene;
  model.position.set(0,0.5,-5);
  scene.add(model);

  const clips = glb.animations;
  mixer = new THREE.AnimationMixer(model);
 
  const rotateAction = THREE.AnimationClip.findByName(clips, 'handmove');  
  const rotateMove = mixer.clipAction(rotateAction);
  rotateMove.play();
  rotateMove.loop = THREE.LoopOnce;

  const armatureAction= THREE.AnimationClip.findByName(clips, 'Armaturemove');
  const armatureMove = mixer.clipAction(armatureAction);
  armatureMove.play();
  armatureMove.loop = THREE.LoopOnce;

  animate();
}, undefined, function(e){
  console.error(e);
})

const clock = new THREE.Clock();
window.onresize = function(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};



function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}