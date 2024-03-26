import * as THREE from 'three';
import { Models } from './Models';
import { Game } from './Game';
import { Explosion } from './ExplosionEffect';
import { Audios } from './Audio';

class OtherPlayer {

    id
    jetModel;
    boundingBox;

    targetSphere;

    //vectors
    direction;  //normal velocity vector
   
    boxYelow;
    boxRed;
    context;

    health;
    is_killed = false;

    explosion_effect = null;
    explosionSound = Audios.getExplosionAudio();

    constructor(x, y, z, id) {

        this.id = id;

        this.context = Game.scene;
        this.direction = new THREE.Vector3(0, 0, -1);

        const airplane = Models.getJetModel();
        this.jetModel = airplane;
        this.jetModel.scale.set(3, 3, 3);
        const flame_afterburner = airplane.getObjectByName('flame_2');
        flame_afterburner.visible = false;

        this.jetModel.position.x = x ?? 0;
        this.jetModel.position.y = y ?? 0;
        this.jetModel.position.z = z ?? 0;

        const geometry = new THREE.SphereGeometry( 50, 32, 16 ); 
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0 } ); 
        this.targetSphere = new THREE.Mesh( geometry, material ); 

        this.targetSphere.position.x = x ?? 0;
        this.targetSphere.position.y = y ?? 0;
        this.targetSphere.position.z = z ?? 0;

        this.context.add( this.targetSphere );

        this.context.add(this.jetModel);

        setTimeout(() => {
            this.#setBB();
        }, 10);

    }

    update(data) {

        if(this.explosion_effect?.dispose === false)
        {
            this.explosion_effect.update();
        }
        else
        {
            this.explosion_effect = null;
        }

        this.jetModel.position.x = data.position.x;
        this.jetModel.position.y = data.position.y;
        this.jetModel.position.z = data.position.z;

        this.targetSphere.position.x = data.position.x;
        this.targetSphere.position.y = data.position.y;
        this.targetSphere.position.z = data.position.z;

        this.health = data.hp;

        this.jetModel.quaternion.set(data.rotation[0],data.rotation[1], data.rotation[2], data.rotation[3]);

        if(this.boundingBox != undefined)
        {
            //update BB
            this.boundingBox.copy(this.jetModel.children[0].geometry.boundingBox).applyMatrix4(this.jetModel.matrixWorld);
        }

        if(this.is_killed)
        {
            this.#highlightYelow(false);
            this.#highlightRed(false);
        }
        else
        {
            this.#highlightYelow(Game.tracketPlayer == this);
            this.#highlightRed(Game.lockedOnPlayer == this);
        }

        

    }

    takeDamage(dmg) {

        Game.socket.emit('take_damage', {id: this.id, dmg: dmg});

    }

    takedown()
    {
        this.explosionSound.play();
        this.is_killed = true;
        this.jetModel.visible = false;
        this.is_killed = true;
        const p = this.jetModel.position;
        this.explosion_effect = new Explosion(p.x, p.y, p.z, this.context, 4, 60);
    }

    revive()
    {
        this.is_killed = false;
        this.jetModel.visible = true;
    }

    #setBB() {
        this.jetModel.children[0].geometry.computeBoundingBox();
        this.boundingBox = new THREE.Box3();
        this.boundingBox.copy(this.jetModel.children[0].geometry.boundingBox).applyMatrix4(this.jetModel.matrixWorld);
        this.boxYelow = new THREE.Box3Helper(this.boundingBox, 0xffff00);
        this.boxRed = new THREE.Box3Helper(this.boundingBox, 0xff0000);
    }

    #highlightYelow(isTargeted)
    {
        if(isTargeted)
        {
            this.context.add(this.boxYelow);
        }
        else
        {
            this.context.remove(this.boxYelow);
        }
    }

    #highlightRed(isLockedOn)
    {
        if(isLockedOn)
        {
            this.context.add(this.boxRed);
        }
        else
        {
            this.context.remove(this.boxRed);
        }
    }

    cleanup()
    {
        this.jetModel.children.forEach(element => {
            element.geometry.dispose();
            element.material.dispose();
        });
        this.context.remove( this.jetModel );
        this.context.remove( this.targetSphere );
    }
}

export { OtherPlayer };