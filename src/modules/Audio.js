import { AudioListener, Audio, AudioLoader } from 'three';
import explosion1Url from '/sounds/explosion1.mp3';
import explosion2Url from '/sounds/explosion2.mp3';
import gunUrl from '/sounds/machinegun.mp3';

class Audios {

    static listener = new AudioListener();
    static audioLoader = new AudioLoader()
    
    static explosionAudio;
    static missileAudio;
    static gunAudio;

    static isSoundOn = false;
    static volume = 1;
   
    static async loadAudio(isSoundOn, volume) {

        this.setIsSoundOn(isSoundOn);
        this.setVolume(volume)

        const loadExplosionAudioPromise = this.loadExplosionAudio();
        const loadMissileAutioPromise = this.loadMissileAudio();
        const loadGunAudioPromise = this.loadGunAudio()

        await Promise.all([loadExplosionAudioPromise, loadMissileAutioPromise, loadGunAudioPromise]);
    }

    static setIsSoundOn(isSoundOn)
    {
        if( typeof isSoundOn == "boolean")
        {
            this.isSoundOn = isSoundOn;
        }
    }

    static setVolume(value)
    {
        if(value > 0 && value <= 1)
        {
            this.volume = value;
        }
    }

    static getExplosionAudio()
    {
        return this.explosionAudio;
    }

    static getMissileAudio()
    {
        return this.missileAudio;
    }

    static getGunAudio()
    {
        return this.gunAudio;
    }

    static setListenerToCamera(camera)
    {
        camera.add(this.listener);
    }


    static loadExplosionAudio()
    {
        
        return new Promise((resolve, reject) => {
            
            this.audioLoader.load( explosion1Url, ( buffer ) => {
                this.explosionAudio = new Audio(this.listener)
                this.explosionAudio.setBuffer(buffer);
                this.explosionAudio.setLoop(false);
                this.explosionAudio.setVolume( this.isSoundOn ? this.volume : 0 );
                resolve();
            });
        })
    }

    static loadMissileAudio()
    {
        
        return new Promise((resolve, reject) => {
            
            this.audioLoader.load( explosion2Url, ( buffer ) => {
                this.missileAudio = new Audio(this.listener)
                this.missileAudio.setBuffer(buffer);
                this.missileAudio.setLoop(false);
                this.missileAudio.setVolume( this.isSoundOn ? this.volume : 0 );
                resolve();
            });
        })
    }

    static loadGunAudio()
    {
        
        return new Promise((resolve, reject) => {
            
            this.audioLoader.load( gunUrl, ( buffer ) => {
                this.gunAudio = new Audio(this.listener)
                this.gunAudio.setBuffer(buffer);
                this.gunAudio.setLoop(true);
                this.gunAudio.setVolume( this.isSoundOn ? this.volume * 0.1 : 0 );
                resolve();
            });
        })
    }

  }

export { Audios }