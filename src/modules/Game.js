import * as THREE from 'three';
import { generateWorld } from './World.js'
import { Player } from './Player.js'
import { OtherPlayer } from './OtherPlayer.js';
import { MissileDummy } from './MissileDummy.js';
import { Radar } from './Radar.js';
import { Audios } from './Audio.js';

//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Game{

    static this_player;
    static players = [];
    static dummyMissiles = [];

    //Scene
    static scene = new THREE.Scene();
    static width = window.innerWidth;
    static height = window.innerHeight;
    static camera;

    static FPS = 60;

    static renderer;

    static xMapped = 0; //normalized mouse pointer position x
    static yMapped = 0; //normalized mouse pointer position y

    static cameraDistance = 11;
    static verticalOffset = 5;

    static rollDirection = 0; //-1 = left, 0=none 1=right
    static afterBurner = false;
    static shooting = false;

    //global states
    static tracketPlayer;
    static lockedOnPlayer;

    static animationIntervalId;

    static socket;

    static radar;

    static rearCamera = false;

    static start()
    {
        generateWorld(this.scene);

        // camera
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10000);
        this.camera.position.z = 10;
        this.camera.position.y = 6;
        this.scene.add(this.camera);
        Audios.setListenerToCamera(this.camera);
        //render
        const canvas = document.querySelector('canvas.webgl');
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })

        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.render(this.scene, this.camera);
        
        this.#setEvents();

        this.startAnimate();
    }

    static initRadar()
    {
        this.radar = new Radar();
    }

    static startAnimate()
    {
        this.animationIntervalId = setInterval( () => { this.animate() }, 1000 / this.FPS);
    }

    static stopAnimate()
    {
        id(this.animationIntervalId)
        {
            clearInterval(this.animationIntervalId);
            this.animationIntervalId = undefined;
        }
        
    }

    static setSocket(socket)
    {
        this.socket = socket;
    }

    static setTracketPlayer(player)
    {
        this.tracketPlayer = player;
    }

    static setLockedOnPlayer(player)
    {
        this.lockedOnPlayer = player;
    }

    static animate() {
        
        this.renderer.render(this.scene, this.camera);
        this.radar.render();
        
        this.this_player.update(this.xMapped, this.yMapped, this.rollDirection, this.afterBurner, this.shooting);
        this.#updateCamera(this.getCurrentPlayer().jetModel);

        let current_player_state = Game.getCurrentPlayerState();
        
        if (current_player_state != null && this.socket != undefined) {
            this.socket.emit('push_state', current_player_state);
        }
        
    }

    static #setEvents()
    {
        const canvasDOM = document.getElementsByClassName("webgl")[0];
        const viewHalfX = canvasDOM.width / 2;
        const viewHalfY = canvasDOM.height / 2;

        canvasDOM.addEventListener("pointermove", (event) => {
            var pointerX = event.pageX - viewHalfX;
            var pointerY = event.pageY - viewHalfY;
    
            this.xMapped = mapValue(pointerX, viewHalfX * -1, viewHalfX, -1, 1);
    
            this.yMapped = mapValue(pointerY, viewHalfY * -1, viewHalfY, -1, 1) * -1;

        });
    
    
    
        window.addEventListener('keydown', (event) => {
            const key = event.key;

            switch (key) {
                case "a":
                    this.rollDirection = 1;
                    break;
                case "d":
                    this.rollDirection = -1;
                    break;
                case "w":
                    this.afterBurner = true;
                    break;
                case "e":
                    this.this_player.shootMissile();
                    break;
                case "n":
                    //this.this_player.debug();
                    break;
                case "q":
                    this.rearCamera = true;
                    break;
                case "Escape":
                    console.log(document.getElementById('quitOverlay').style.display)
                    if(document.getElementById('quitOverlay').style.display == "none")
                    {
                        document.getElementById('quitOverlay').style.display = 'flex';
                    }
                    else
                    {
                        document.getElementById('quitOverlay').style.display = 'none';
                    }
                    break;
            }
            
        });
    
        window.addEventListener('keyup', (event) => {
            if ( event.key === 'a'  || event.key === 'd' ) {
                this.rollDirection = 0; // Reset the roll speed when 'A' or 'D' is released
            }
    
            if ( event.key === 'w' ) {
                this.afterBurner = false; // Reset the roll speed when 'A' or 'D' is released
            }

            if (event.key === 'q') {
                this.rearCamera = false;
            }
        });
    
        window.addEventListener('pointerdown', () => {
            this.shooting = true;
        });
    
        window.addEventListener('pointerup', () => {
            this.shooting = false;
        });
    }

    static #updateCamera(playerMesh) {
        // Calculate the offset vector based on the player's rotation

        let distance = this.cameraDistance;

        if(this.rearCamera)
        {
            distance *= -1;
        }

        const offset = new THREE.Vector3(0, 5, distance);
        offset.applyQuaternion(playerMesh.quaternion);

        // Set the camera position to the player's position plus the offset
        this.camera.position.copy(playerMesh.position).add(offset);

        // Set the camera's lookAt to the player's position to ensure it's always looking at the player
        const lookAtTarget = new THREE.Vector3(playerMesh.position.x, playerMesh.position.y + this.verticalOffset, playerMesh.position.z);
        this.camera.lookAt(lookAtTarget);
    }

    //players state managment

    static setGameState(state)
    {
        this.initRadar();
        state.players.forEach(jet => {

            //add other players 
            if(jet.id != state.current_player)
            {
                this.createOtherPlayer(jet);
            }
            else //add current player
            {
                this.createPlayer(jet);
            }
        });
        this.start();
    }

    static getPlayer(id)
    {
        return this.players.filter((obj) => obj.id == id)[0];
    }

    static getCurrentPlayerState()
    {
        if(this.this_player)
        {
            return this.this_player.getState();
        }
        else
        {
            return null;
        }
        
    }

    static getCurrentPlayer()
    {
        return this.this_player;
    }

    static getOtherPlayers()
    {
        return this.players;
    }

    static deletePlayer(id)
    {
        let player = this.players.filter((obj) => obj.id == id)[0];
        if(player)
        {
            this.radar.removePlayerMarker(id);
            player.cleanup();
            const index = this.players.findIndex(obj => obj.id === id);
            if (index !== -1) {
                this.players.splice(index, 1);
            }
        }
    }

    static updateOtherPlayers(states)
    {
        states.forEach(state => {
            let jet = this.players.filter((obj) => obj.id == state.id)[0];
            if(jet)
            {
                jet.update(state);
            }

            if(state.id == this.this_player.id)
            {
                this.this_player.updateHealth(state.hp);
            }
        });
    }

    static updateMissilesState(states)
    {
        states.forEach(state => {
            let m = this.dummyMissiles.filter((obj) => obj.id == state.id)[0];
            if(m)
            {
                m.update(state);
            }
        });
    }

    static takedown_player(id)
    {
        let jet = this.players.filter((obj) => obj.id == id)[0];
        if(jet)
        {
            jet.takedown();
        }

        if(id == this.this_player.id)
        {
            this.this_player.takedown();
        }

    }

    static revive_player(id)
    {
        let jet = this.players.filter((obj) => obj.id == id)[0];
        if(jet)
        {
            jet.revive();
        }

        if(id == this.this_player.id)
        {
            this.this_player.revive();
        }

    }

    static createPlayer(params)
    {
        let p = new Player(params.position.x, params.position.y, params.position.z, params.id);
        this.this_player = p;
    }

    static createOtherPlayer(params)
    {
        let p = new OtherPlayer(params.position.x, params.position.y, params.position.z, params.id);
        this.players.push(p);
        this.radar.addPlayerMarker(p);
    }

    static spawnDummyMissile(data)
    {
        const md = new MissileDummy(data.position.x, data.position.y, data.position.z, data.id, data.rotation, this.scene);
        this.dummyMissiles.push(md);
    }

    static deleteMissile(id)
    {
        let m = this.dummyMissiles.filter((obj) => obj.id == id)[0];
        if(m)
        {
            const index = this.dummyMissiles.findIndex(obj => obj.id === id);
            if (index !== -1) {
                this.dummyMissiles.splice(index, 1);
            }

            m.cleanup();
        }
    }

    static debug()
    {
        this.this_player.debug();
    }
}

function mapValue(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export { Game }