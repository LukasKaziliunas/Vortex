import * as THREE from 'three';
import { Models } from './Models';

function generateWorld(scene) {
    
    const worldMesh = Models.getMapModel()

    scene.add(worldMesh);

    //set sky
    scene.background = new THREE.Color(0x87e7eb);

    //lightning
    const hemilight = new THREE.HemisphereLight(0xFFF917, 0x2ECC71, 0.4);
    scene.add(hemilight);

    const light = new THREE.AmbientLight( 0xffffff, 0.8 ); // soft white light
    scene.add( light );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(-5500, 7500, -4000);
    scene.add( directionalLight );

}



export { generateWorld };