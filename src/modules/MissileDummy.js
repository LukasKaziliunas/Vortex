import { Models } from './Models.js';
import { Smoke } from './smokeEffect.js';

class MissileDummy {

    id;
    mesh;
    context;

    spawnSmokeCounter = 3;

    constructor(x, y, z, id, rotation, context) {

        this.context = context;
        this.id = id;

        const missile = Models.getMissileModel();

        this.mesh = missile

        this.mesh.quaternion.set(rotation[0],rotation[1], rotation[2],rotation[3]);

        this.mesh.position.x = x ?? 0;
        this.mesh.position.y = y ?? 0;
        this.mesh.position.z = z ?? 0;

        context.add(this.mesh);

    }

    update(data) {

        //update position
        this.mesh.position.x = data.position.x;
        this.mesh.position.y = data.position.y;
        this.mesh.position.z = data.position.z;

        this.mesh.quaternion.set(data.rotation[0],data.rotation[1], data.rotation[2], data.rotation[3]);

        this.spawnSmokeCounter--;
        if(this.spawnSmokeCounter == 0)
        {
            new Smoke(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, this.context, 0.6, 200);
            this.spawnSmokeCounter = 3;
        }

    }

    cleanup() {
        this.context.remove(this.mesh);
    }

}

export { MissileDummy };