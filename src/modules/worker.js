import { Vector3, Raycaster } from "three";
import { Models } from "./Models";

var world = null;
const down = new Vector3(0, -1, 0);
const rc = new Raycaster();

self.onmessage = function (event) {
   
    if (event.data.task == "init") {
        Models.loadMapModel()
        .then( () => {
            world = Models.getMapModel();
        } 
         )
    }

    if (event.data.task == "distance") {

        if(world == null)
        {
            console.log("map is not loaded")
        }
        else
        {
            let d = checkDistanceToGround(new Vector3(event.data.position.x, event.data.position.y, event.data.position.z));
            self.postMessage({type: "distance", value: d});
        }

    }

};

function checkDistanceToGround(position) {

    rc.set(position, down);

    const intersections = rc.intersectObjects(world.children[0].children);

    if (intersections.length > 0) {
        // Get the distance to the ground
        const distanceToGround = intersections[0].distance;

        return distanceToGround
    }

    return -9999;
}