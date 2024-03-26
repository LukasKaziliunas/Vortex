import { Bullet } from './Bullet.js'
import { Missile } from './Missile.js';
import { Game } from './Game.js';
import { Audios } from './Audio';

class Guns {
    
    bullets;
    missile;

    thisPlayer;
    otherPlayers;
    scene

    params = {
        "overheat": 0,
        "missile_ready": true
    }
    isOverheated;
    cooldown;

    missileAudio = Audios.getMissileAudio();
    gunAudio = Audios.getGunAudio();

    constructor(thisPlayer){

        this.scene = Game.scene;
        this.thisPlayer = thisPlayer;
        this.bullets = [];
        this.overheat = 0;
        this.isOverheated = false;
        this.otherPlayers = Game.players;
        this.createGUI();
    } 

    createGUI()
    {
        this.thisPlayer.gui.add(this.params, "overheat", 0 ,300).name('gun overheat').listen();
        this.thisPlayer.gui.add(this.params, "missile_ready").name('missile ready').listen();
    }

    shootMissile(target)
    {
        if(this.missile != undefined)
        {
            return;
        }
        this.missileAudio.play();
        let pos = this.thisPlayer.jetModel.position;
        let m = new Missile(pos.x,pos.y,pos.z, this.scene, this.thisPlayer.direction, target);
            this.missile = m;

        this.params.missile_ready = false;
    }

    update(isShooting)
    {
        this.#updateBullets(isShooting);

        this.#updateMissile();

        this.#updateDamage();

    }

    #removeBullet(bullet)
    {
        if(bullet)
        {
            bullet.cleanup();
            const index = this.bullets.findIndex(obj => obj === bullet);
            if (index !== -1) {
                this.bullets.splice(index, 1);
            }
        }
    }


    #updateBullets(isShooting)
    {
        if(isShooting && !this.isOverheated)
        {
            this.toggleShootingAudio(true);
            let pos = this.thisPlayer.jetModel.position;
            let b = new Bullet(pos.x,pos.y,pos.z, this.scene, this.thisPlayer.direction);
            this.bullets.push(b);
            this.scene.add(b.mesh);

            this.params.overheat += 1;
            
            if(this.params.overheat >= 300)
            {
                this.isOverheated = true;
                this.cooldown = 300;
            }
            
        }
        else
        {
            this.toggleShootingAudio(false);
            if(this.params.overheat > 0)
            {
                this.params.overheat -= 1;
            }
        }

        if(this.isOverheated)
        {
            this.cooldown -= 1;
            if(this.cooldown == 0)
            {
                this.isOverheated = false;
            }
        }

        this.overheat = this.params.overheat < 0 ? 0 : this.params.overheat;

        this.bullets.forEach(b => {
            if(b.removeCounter<=0)
            {
                this.#removeBullet(b)
            }
            else
            {
                b.update();
            }
            
        })
    }

    toggleShootingAudio(on)
    {
        if(on)
        {
            if(!this.gunAudio.isPlaying)
            {
                this.gunAudio.play();
            }    
        }

        if(!on)
        {
            if(this.gunAudio.isPlaying)
            {
                this.gunAudio.pause();
            }    
        }
        
    }

    #updateMissile()
    {
        if(this.missile == undefined)
        {
            return;
        }

        if(this.missile.removeCounter <= 0)
        {
            this.missile.cleanup()
            this.missile = undefined;
            this.params.missile_ready = true;
        }
        else
        {
            this.missile.update();
        }
    }

    #updateDamage()
    {
        let otherPlayers = this.otherPlayers.map(player => { return player });
       
        for(var i = 0, l = otherPlayers.length; i < l; i++ )
        {
            if(otherPlayers[i].boundingBox == undefined)
            {
                continue;
            }

            //go through bullets 
            for(var j = this.bullets.length - 1; j >= 0; j--)
            {
                if(otherPlayers[i]?.boundingBox == undefined || this.bullets[j]?.boundingBox == undefined)
                {
                    continue;
                }

                let isbulletHit = otherPlayers[i].boundingBox.intersectsBox(this.bullets[j].boundingBox);
                
                if(isbulletHit)
                {
                otherPlayers[i].takeDamage(this.bullets[j].damage);
                this.#removeBullet(this.bullets[j]);
                }
            }

            //check if missile hit
            if(this.missile != undefined)
            {
                if(otherPlayers[i]?.boundingBox != undefined && this.missile?.boundingBox != undefined)
                {
                    let isMissileHit = otherPlayers[i].boundingBox.intersectsBox(this.missile.boundingBox);

                    if(isMissileHit)
                    {
                        otherPlayers[i].takeDamage(this.missile.damage);
                        this.missile.cleanup();
                        this.missile = undefined;
                    }
                }
                
            }
            
        }
    }
  
    
}

export { Guns };