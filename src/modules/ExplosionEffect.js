import {
    DodecahedronGeometry,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Vector3,
    MathUtils
  } from "three";

class Explosion {

    duration;
    currentDuration;
    ctx;
    mesh;
    dispose = false;

    constructor(x, y, z, context, size, duration) {

        

        this.duration = duration;
        this.currentDuration = duration;

        this.ctx = context;

        const particleGeometry = new DodecahedronGeometry(size, 0);
        const totalParticles = MathUtils.randInt (12, 15);
        


        this.mesh = new Mesh();

        this.mesh.position.x = x ?? 0;
        this.mesh.position.y = y ?? 0;
        this.mesh.position.z = z ?? 0;

        //const newMesh = new Mesh(particleGeometry, fireMaterial);

        const materials = [
            new MeshPhongMaterial({color: 0xff4500}),
            new MeshBasicMaterial({color: 0xffff1a}),
            new MeshPhongMaterial({color: 0x808080}),
        ]
        

        for (let i = 0; i < totalParticles; i++) {
            // random angle
            const particleAngle = Math.random() * Math.PI * 2;
            const fireGeometry = particleGeometry.clone(); // need to clone to have unique particles
            const particleSize =
                0.3 * size + Math.random() * size * 0.4 * MathUtils.randInt (-1, 1) > 0 ? 1 : -1;  

            fireGeometry.scale(particleSize, particleSize, particleSize);
            fireGeometry.rotateX(Math.random() * Math.PI);
            fireGeometry.rotateY(Math.random() * Math.PI);
            fireGeometry.rotateZ(Math.random() * Math.PI);

            

            
            const fireParticle = new Mesh(fireGeometry, materials[MathUtils.randInt(0,2)]);
            fireParticle.userData = {
                angle: particleAngle,
                speed: 0.6 + Math.random() * 1.5,
            };
            this.mesh.add(fireParticle);
        }

        context.add(this.mesh);

    }

    update() {
        this.currentDuration -= 1;

        if (this.currentDuration <= 0) {
            this.cleanup();
            return;
        }

        const scale = this.currentDuration / this.duration;
        this.mesh.children.forEach((element) => {
            const fireParticle = element;
            const angle = fireParticle.userData["angle"];
            const speed = fireParticle.userData["speed"];
            const computedMovement = new Vector3(
                speed * Math.sin(angle) * 0.1,
                -speed * Math.cos(angle) * 0.1,
                0
            );
            fireParticle.scale.set(scale, scale, scale);
            fireParticle.position.add(computedMovement);
        });
    }


    cleanup() {
        this.mesh.children.forEach((element) => {
            const fireParticle = element;
            fireParticle.material.dispose();
            fireParticle.geometry.dispose();
            this.mesh.remove(fireParticle);
            this.ctx.remove(fireParticle);
          });
          this.ctx.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.ctx.remove(this.mesh);
          this.dispose = true;
    }

}

export { Explosion };