import * as THREE from 'three';

class Bullet {
    
    mesh;
    boundingBox;

    //vectors
    direction; 
    
    context;
    removeCounter; //when this counter reaches 0 this bullet must be removed
    speed;
    damage = 20;

    constructor(x,y,z, context, direction){

        this.direction = direction;

        this.removeCounter = 200;
        this.speed = 15;

        this.context = context;

        let geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        let material = new THREE.MeshBasicMaterial({ color: 0xFFF300 });
        //let material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.x = x ?? 0;
        this.mesh.position.y = y ?? 0;
        this.mesh.position.z = z ?? 0;

        setTimeout(() => {
            this.#setBB();
        }, 10);
        
    } 

    update()
    {
        //multiply normal velocity vector by speed
        let velocityVec = this.direction.clone().multiplyScalar(this.speed);

        //update position
        this.mesh.position.x += velocityVec.x;
        this.mesh.position.y += velocityVec.y;
        this.mesh.position.z += velocityVec.z;

        if(this.mesh.geometry.boundingBox != undefined && this.boundingBox != undefined)
        {
            //update BB
            this.boundingBox.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
        }

        this.removeCounter--;

    }

    #setBB()
    {
        this.mesh.geometry.computeBoundingBox();
        this.boundingBox = new THREE.Box3();
        this.boundingBox.copy( this.mesh.geometry.boundingBox ).applyMatrix4( this.mesh.matrixWorld );
    }

    cleanup()
    {
        this.context.remove(this.cubeBoxHelper);
        this.context.remove(this.mesh);
        this.mesh.geometry.dispose();
    }
    
}

export { Bullet };