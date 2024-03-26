import * as THREE from 'three';
import { Models } from './Models';
import { Guns } from './Guns';
import { Game } from './Game';
import { Explosion } from './ExplosionEffect';
import * as dat from 'dat.gui';
import { Audios } from './Audio';

class Player {

    id
    jetModel;
    tail;
    flaps;
    flame_regular;
    flame_afterburner;

    boundingBox;

    guns;

    //vectors
    direction;  //normal velocity vector
    raycaster = new THREE.Raycaster();

    defaultSpeed = 3;
    speed = 3;
    rollSpeed = 0.02;
    lockOnTime = 120; //time needed to lock on the target (2sec)
    is_killed = false;

    //helpers
    velocityHelperArrow;
    cubeBoxHelper;

    context;
    otherPlayers = [];

    //lock on
    lockedOnTarget = null;
    trackedTarget = null; //target that is being tracked currently
    trackingTimer = 0

    explosion_effect = null;

    g = new THREE.Vector3(0, -1, 0).multiplyScalar(0.0);
    down = new THREE.Vector3(0, -1, 0);

    outOfBoost = false;
    boostCooldown = 0;

    distanceCheckerWorker;

    gui = new dat.GUI();

    properties = {
        "health": 100,
        "afterburner": 500
    }

    explosionSound = Audios.getExplosionAudio();

    constructor(x, y, z, id) {

        this.id = id;

        this.direction = new THREE.Vector3(0, 0, -1);

        this.context = Game.scene;
        this.otherPlayers = Game.players;

        const airplane = Models.getJetModel();
        this.jetModel = airplane
        this.tail = airplane.getObjectByName('tail');
        this.flaps = airplane.getObjectByName('flaps');
        this.flame_regular = airplane.getObjectByName('flame_1');
        this.flame_regular.visible = true;
        this.flame_afterburner = airplane.getObjectByName('flame_2');
        this.flame_afterburner.visible = false;

        this.jetModel.position.x = x ?? 0;
        this.jetModel.position.y = y ?? 0;
        this.jetModel.position.z = z ?? 0;

        this.context.add(this.jetModel);

        setTimeout(() => {
            this.#setBB();
            this.#updateHelpers();
        }, 100);

        this.guns = new Guns(this);

        this.setupDistanceChecker();

        this.createGUI();
    }

    getState() {
        return {
            "id": this.id,
            "position": {
                "x": this.jetModel.position.x,
                "y": this.jetModel.position.y,
                "z": this.jetModel.position.z,
            },
            "rotation": this.jetModel.quaternion.toJSON()

        }
    }

    shootMissile() {
        this.guns.shootMissile(this.lockedOnTarget);
    }

    takedown()
    {
        this.explosionSound.play();
        this.jetModel.visible = false;
        this.is_killed = true;
        const p = this.jetModel.position;
        this.explosion_effect = new Explosion(p.x, p.y, p.z, this.context, 4, 60);
    }

    revive()
    {   
        this.jetModel.position.x =  -300;
        this.jetModel.position.y =  1000;
        this.jetModel.position.z =  0;

        this.properties.health = 100;

        this.direction = new THREE.Vector3(0, 0, -1);
        this.jetModel.quaternion.set(0, 0, 0, 1);
        this.jetModel.visible = true;

        this.is_killed = false;
    }

    setupDistanceChecker()
    {
        this.distanceCheckerWorker = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'}); //this runs on a separate thread to check the distance to the ground
        //this.distanceCheckerWorker = new MyWorker();
        this.distanceCheckerWorker.postMessage({"task": "init"});

        this.distanceCheckerWorker.onmessage =  (event) => {
            
                if(event.data.type == "distance")
                {
                    if(event.data.value <= 25)
                    {
                        Game.socket.emit('take_damage', {id: this.id, dmg: 999});
                    }
                }
            };

        setInterval(()=>{
            if(!this.is_killed)
                this.distanceCheckerWorker.postMessage({"task": "distance", "position": this.jetModel.position});
        }, 350);
    }

    createGUI()
    {
        this.gui.add(this.properties, "health", 0, 100).name('health').listen();
        this.gui.add(this.properties, "afterburner", 0, 500).name('afterburner').listen();
        this.gui.add(this, "speed").name('speed').listen();
    }

    debug()
    {
       const a = Audios.getExplosionAudio();
       a.play();
    }

    update(pointerPosX, pointerPosY, rollDirection, isBoosting, isShooting) {

        this.updateExplosionEffect()

        if(this.is_killed)
        {
            return;
        }

        this.updateBoosting(isBoosting);

        this.updateBoostingCooldownAndAfterburnerAmount(isBoosting);

        this.updateRotationAndPosition(pointerPosX, pointerPosY, rollDirection)

        //update BB
        if(this.boundingBox != undefined)
        {
            this.boundingBox.copy(this.jetModel.children[0].geometry.boundingBox).applyMatrix4(this.jetModel.matrixWorld);
        }

        //update vector helpers
        this.#updateHelpers();

        this.tryToLockOnPlayer();


        this.guns.update(isShooting)

        Game.setTracketPlayer(this.trackedTarget);
        Game.setLockedOnPlayer(this.lockedOnTarget);

        
    }

    // boosing
    updateBoosting(isBoosting) {
        if (isBoosting && this.properties.afterburner > 0) {
            this.boost(true);
        } else {
            this.boost(false);
        }
    }
    
    boost(shouldBoost) {
        if (shouldBoost) {
            this.increaseSpeed();
            this.showAfterburnerFlame();
            this.decreaseAfterburner();
            this.handleBoostCooldown();
        } else {
            this.decreaseSpeed();
            this.showRegularFlame();
        }
    }
    
    increaseSpeed() {
        if (this.speed < 5) {
            this.speed += 0.04;
        }
    }
    
    decreaseSpeed() {
        if (this.speed > this.defaultSpeed) {
            this.speed -= 0.02;
        }
    }
    
    showAfterburnerFlame() {
        this.flame_afterburner.visible = true;
        this.flame_regular.visible = false;
    }
    
    showRegularFlame() {
        this.flame_afterburner.visible = false;
        this.flame_regular.visible = true;
    }
    
    decreaseAfterburner() {
        this.properties.afterburner -= 2;
    }
    
    handleBoostCooldown() {
        if (this.properties.afterburner === 0) {
            this.boostCooldown = 120;
        }
    }

    updateBoostingCooldownAndAfterburnerAmount(isBoosting) {
        if (this.boostCooldown === 0 && !isBoosting && this.properties.afterburner < 500) {
            this.properties.afterburner += 1;
        }
    
        if (this.boostCooldown !== 0) {
            this.boostCooldown -= 1;
        }
    }
    //---------------------

    updateRotationAndPosition(pointerPosX, pointerPosY, rollDirection)
    {
        //rotate tail
        const maxTailRotation = Math.PI / 28;
        const tailRotation = pointerPosX * maxTailRotation;
        this.tail.rotation.y = tailRotation;

        //rotate flaps
        const maxFlapsRotation = Math.PI / 20;
        const flapsRotation = pointerPosY * maxFlapsRotation * -1;
        this.flaps.rotation.x = flapsRotation;

        const Q = new THREE.Quaternion();

        const R = this.jetModel.quaternion.clone();

        //pitch
        Q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pointerPosY * (Math.PI / 180) * 1.8);

        R.multiply(Q);

        //yaw
        Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), pointerPosX * (-Math.PI / 180) * 0.6);

        R.multiply(Q);

        //roll
        Q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.rollSpeed * rollDirection);

        R.multiply(Q);

        this.jetModel.quaternion.copy(R);

        const forwardVector = new THREE.Vector3(0, 0, -1); // Local forward vector in object space
        forwardVector.applyQuaternion(this.jetModel.quaternion);

        this.direction = forwardVector;
        
        //multiply normal velocity vector by speed
        let velocityVec = this.direction.clone().multiplyScalar(this.speed);
        velocityVec.add(this.g);

        this.updatePosition(velocityVec)
    }

    updatePosition(velocityVec)
    {
        this.jetModel.position.x += velocityVec.x;
        this.jetModel.position.y += velocityVec.y;
        this.jetModel.position.z += velocityVec.z;
    }

    //---------------------------------

    tryToLockOnPlayer()
    {
        //try to lock on
        this.raycaster.set(this.jetModel.position, this.direction);

        this.otherPlayers.forEach((player) => {
            const intersects = this.raycaster.intersectObject(player.targetSphere);
            
            if (intersects.length > 0) {
                
                let target = intersects[0];
                if (this.trackedTarget == null) {
                    this.trackedTarget = player;
                }
                else {
                    
                    if (target.object.uuid == this.trackedTarget.targetSphere.uuid) {
                        this.trackingTimer += 1;

                        if (this.trackingTimer >= this.lockOnTime) {
                            this.lockedOnTarget = this.trackedTarget;
                            this.trackingTimer = 0;
                            this.trackedTarget = null;
                        }
                    }
                    else {
                        this.trackedTarget = null;
                        this.trackingTimer = 0;
                    }
                }

            }
            else {
                this.trackedTarget = null;
                this.lockedOnTarget = null;
                this.trackingTimer = 0;
            }
        })
    }

    updateExplosionEffect() {
        if (this.explosion_effect?.dispose === false) {
            this.explosion_effect.update();
        } else {
            this.explosion_effect = null;
        }
    }

    updateHealth(health) {
        this.properties.health = health;
    }

    #setBB() {
        this.jetModel.children[0].geometry.computeBoundingBox();
        this.boundingBox = new THREE.Box3();
        this.boundingBox.copy(this.jetModel.children[0].geometry.boundingBox).applyMatrix4(this.jetModel.matrixWorld);
    }

    #updateHelpers() {
        this.context.remove(this.velocityHelperArrow);
        this.velocityHelperArrow = new THREE.ArrowHelper(this.direction.clone().normalize(), this.jetModel.position, 1000, 0x00ff00, 0, 0);
        this.context.add(this.velocityHelperArrow);
    }

    numberSign(number)
    {
        if(number < 0)
        {
            return -1;
        }
        else
        {
            return 1;
        }
    }

}

export { Player };