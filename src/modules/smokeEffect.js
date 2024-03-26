import {
    DodecahedronGeometry,
    Mesh,
    MeshPhongMaterial
  } from "three";

class Smoke {

    duration;
    currentDuration;
    ctx;
    mesh;

    updateInterval;

    constructor(x, y, z, context, size, duration) {

        this.duration = duration;
        this.currentDuration = duration;

        this.ctx = context;

        const smokeGeometry = new DodecahedronGeometry(size, 0);
        const material = new MeshPhongMaterial({color: 0xECECEC, transparent: true})

        this.mesh = new Mesh(smokeGeometry, material);

        this.mesh.position.x = x ?? 0;
        this.mesh.position.y = y ?? 0;
        this.mesh.position.z = z ?? 0;

        context.add(this.mesh);
        this.updateInterval = setInterval(() => {this.update()}, 17)
    }

    update() {
        this.currentDuration -= 1;

        if (this.currentDuration <= 0) {
            this.cleanup();
            return;
        }

        const scale = this.currentDuration / this.duration;
        
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.material.opacity = scale;
    }


    cleanup() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.ctx.remove(this.mesh);
        clearInterval(this.updateInterval);
        this.ctx = null;
        this.mesh = null;
    }

}

export { Smoke };