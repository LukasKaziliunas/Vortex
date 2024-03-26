import * as THREE from 'three';
import { Models } from './Models';
import { Smoke } from './smokeEffect.js';
import { Game } from './Game.js';

class Missile {

    id;
    mesh;
    boundingBox;

    //vectors
    direction;

    target;
    rotationMatrix = new THREE.Matrix4();
    targetQuaternion = new THREE.Quaternion();

    //helpers
    cubeBoxHelper;

    context;

    removeCounter = 800; //when this counter reaches 0 this missile must be removed
    speed = 6;

    damage = 100;

    spawnSmokeCounter = 3;

    constructor(x, y, z, context, direction, target) {

        this.id = crypto.randomUUID();

        this.direction = direction;

        this.target = target ?? null;

        this.context = context;

        const missile = Models.getMissileModel();

        this.mesh = missile

        //rotate misile to aligne with planes direction vector
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        this.mesh.quaternion.copy(quaternion);

        this.mesh.position.x = x ?? 0;
        this.mesh.position.y = y - 5 ?? 0;
        this.mesh.position.z = z - 3 ?? 0;

        context.add(this.mesh);

        Game.socket.emit('missile_launched', {position: {x:this.mesh.position.x,y:this.mesh.position.y,z:this.mesh.position.z},id: this.id, rotation: this.mesh.quaternion.toJSON()});

        setTimeout(() => {
            this.#setBB();
        }, 10);

    }

    update() {
        if (this.mesh == undefined) //dont update if missile model is not loaded yet
        {
            return;
        }

        if (this.target) //if theres a target lock on
        {
            this.rotationMatrix.lookAt(this.target.jetModel.position, this.mesh.position, this.mesh.up);
            this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);

            this.mesh.quaternion.rotateTowards(this.targetQuaternion, 0.1);

            const forwardVector = new THREE.Vector3(0, 0, 1); // Local forward vector in object space
            forwardVector.applyQuaternion(this.mesh.quaternion);

            this.direction = forwardVector;
        }


        let velocityVec = this.direction.clone().multiplyScalar(this.speed);

        //update position
        this.mesh.position.x += velocityVec.x;
        this.mesh.position.y += velocityVec.y;
        this.mesh.position.z += velocityVec.z;

        if(this?.mesh.children[0]?.geometry?.boundingBox != undefined && this.boundingBox != undefined)
        {
            //update BB
            this.boundingBox.copy(this.mesh.children[0].geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
            //update vector helpers
        }

        this.removeCounter--;

        this.spawnSmokeCounter--;
        if(this.spawnSmokeCounter == 0)
        {
            new Smoke(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, this.context, 0.6, 200);
            this.spawnSmokeCounter = 3;
        }

        Game.socket.emit('missile_update', {position: {x:this.mesh.position.x,y:this.mesh.position.y,z:this.mesh.position.z},id: this.id, rotation: this.mesh.quaternion.toJSON()});

    }

    #setBB() {
        this.mesh.children[0].geometry.computeBoundingBox();
        this.boundingBox = new THREE.Box3();
        this.boundingBox.copy(this.mesh.children[0].geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
        //this.cubeBoxHelper = new THREE.Box3Helper(this.boundingBox, 0x00ff00);
    }

    cleanup() {
        Game.socket.emit('missile_despawn', this.id);
        this.mesh.children.forEach(element => {
            element.geometry.dispose();
            element.material.dispose();
        });
        this.context.remove(this.cubeBoxHelper);
        this.context.remove(this.mesh);
    }

}

export { Missile };