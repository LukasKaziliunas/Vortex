import { Game } from "./Game";
import * as THREE from 'three';

class Radar
{

    radarW = 150;
    radarH = 150;

    hudScene;
    hudCamera;
    radarRenderer;

    thisPlayerMarkerMesh;
    otherPlayersMarkers = [];

    zAxis = new THREE.Vector3(0,0,1);

    constructor()
    {
        //radar render

        const RadarCanvas = document.querySelector('canvas.radar');
        
        this.radarRenderer = new THREE.WebGLRenderer({
            canvas: RadarCanvas
        })

        

        this.hudScene = new THREE.Scene();
        this.hudCamera = new THREE.OrthographicCamera(this.radarW / - 2, this.radarW / 2, this.radarH / 2, this.radarH / - 2, 1, 1000);
        this.hudCamera.position.z = 10;

        this.radarRenderer.setSize(this.radarW, this.radarH);
        this.radarRenderer.render(this.hudScene, this.hudCamera);

        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, 7);
        triangleShape.lineTo(-4, -4);
        triangleShape.lineTo(4, -4);

        // Create a geometry based on the shape
        const geometry = new THREE.ShapeGeometry(triangleShape);

        let materialGreen = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        let materialPlayer = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.thisPlayerMarkerMesh = new THREE.Mesh(geometry, materialPlayer);

        this.hudScene.add(this.thisPlayerMarkerMesh);


        const circleGeo1 = new THREE.RingGeometry( 8, 10, 32 ); 
        const circleMesh1 = new THREE.Mesh( circleGeo1, materialGreen );
        this.hudScene.add(circleMesh1);

        const circleGeo2 = new THREE.RingGeometry( 30, 32, 32 ); 
        const circleMesh2 = new THREE.Mesh( circleGeo2, materialGreen );
        this.hudScene.add(circleMesh2);

        const circleGeo3 = new THREE.RingGeometry( 50, 52, 32 ); 
        const circleMesh3 = new THREE.Mesh( circleGeo3, materialGreen );
        this.hudScene.add(circleMesh3);

        const circleGeo4 = new THREE.RingGeometry( 70, 72, 32 ); 
        const circleMesh4 = new THREE.Mesh( circleGeo4, materialGreen );
        this.hudScene.add(circleMesh4);

        const points1 = [];
        points1.push( new THREE.Vector3( - 2, 70, 0 ) );
        points1.push( new THREE.Vector3( 1, 70, 0 ) );
        points1.push( new THREE.Vector3( 1, -70, 0 ) );

        const lineGeo1 = new THREE.BufferGeometry().setFromPoints( points1 );
        const line = new THREE.Line( lineGeo1, materialGreen );
        this.hudScene.add(line);

        const points2 = [];
        points2.push( new THREE.Vector3( - 70, 3, 0 ) );
        points2.push( new THREE.Vector3( -70, 1, 0 ) );
        points2.push( new THREE.Vector3( 70, 1, 0 ) );

        const lineGeo2 = new THREE.BufferGeometry().setFromPoints( points2 );
        const line2 = new THREE.Line( lineGeo2, materialGreen );
        this.hudScene.add(line2);
    }

    render(){
        this.radarRenderer.render(this.hudScene, this.hudCamera);

        let x = Game.this_player.jetModel.position.x;
        let z = Game.this_player.jetModel.position.z;

        this.thisPlayerMarkerMesh.position.x = this.coordsToRadarCoords(x);
        this.thisPlayerMarkerMesh.position.y = this.coordsToRadarCoords(z * -1);

        this.updateMarkerRotation();

        Game.getOtherPlayers().forEach((player) => {
            const playerId = player.id;

            let marker = this.otherPlayersMarkers.filter((marker) => marker.userData.playerId == playerId)[0];

            if(marker)
            {
                let x = player.jetModel.position.x;
                let z = player.jetModel.position.z;
    
                marker.position.x = this.coordsToRadarCoords(x);
                marker.position.y = this.coordsToRadarCoords(z * -1);
            }
            
        })


    }

    updateMarkerRotation()
    {
        let dir = Game.this_player.direction.clone();
        let normal = new THREE.Vector2(dir.x, dir.z).normalize();
        
        let angle = normal.angle() + Math.PI / 2

        this.thisPlayerMarkerMesh.rotation.set(0, 0, -angle);
    }

    addPlayerMarker(player)
    {
        let geometry = new THREE.BoxGeometry(5, 5, 5);
        let material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

        const newMarker = new THREE.Mesh(geometry, material);

        newMarker.userData.playerId = player.id;

        let x = player.jetModel.position.x;
        let z = player.jetModel.position.z;

        newMarker.position.x = this.coordsToRadarCoords(x);
        newMarker.position.y = this.coordsToRadarCoords(z * -1);

        this.otherPlayersMarkers.push(newMarker);

        this.hudScene.add(newMarker);

    }

    removePlayerMarker(id)
    {
        let marker = this.otherPlayersMarkers.filter((marker) => marker.userData.playerId == id)[0];
        if(marker)
        {
            this.hudScene.remove(marker)

            const index = this.otherPlayersMarkers.findIndex((marker) => marker.userData.playerId == id);
            if (index !== -1) {
                this.otherPlayersMarkers.splice(index, 1);
            }

            marker.geometry.dispose();
            marker.material.dispose();
        }
    }

    coordsToRadarCoords(coords)
    {
        return coords / 66.6;
    }

}

export { Radar };