import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import mapUrl from '/map4.glb'
import f16Url from '/f16.glb'
import missileUrl from '/missile.glb'

class Models {
    static jetModel;
    static missileModel;
    static treeModel;
    static mapModel;
   
    static async loadModels() {
        const jetPromose = this.loadJetModel();
        const missilePromise = this.loadMissileModel();
        const mapPromise = this.loadMapModel();
        await Promise.all([jetPromose, missilePromise, mapPromise]);
    }

    static getJetModel()
    {
        return this.jetModel.clone();
    }

    static getMissileModel()
    {
        return this.missileModel.clone();
    }

    static getMapModel()
    {
        return this.mapModel.clone();
    }

    static loadJetModel()
    {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();//.setPath('./');

            loader.load(f16Url, (gltf) => {
            
                const model = gltf.scene;
    
                this.jetModel = model;
    
                resolve();
    
            });
        })
    }

    static loadMissileModel()
    {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();//.setPath('./');

            loader.load(missileUrl, (gltf) => {
            
                const model = gltf.scene;
                model.scale.set(2.5, 2.5, 2.5);
                this.missileModel = model;
    
                resolve();
    
            });
        })
    }

    static loadMapModel()
    {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();//.setPath('./');

            loader.load(mapUrl, (gltf) => {
            
                const model = gltf.scene;
    
                this.mapModel = model;
    
                resolve();
    
            });
        })
    }
  }

export { Models }