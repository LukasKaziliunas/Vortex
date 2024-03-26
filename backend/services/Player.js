class Player {
    constructor(id, name, eventsEmitter) {
        this.id = id;
        this.name = name;
        this.position = { x: -300, y: 1000, z: 0 };
        this.rotation = [0, 0, 0, 1];
        this.hp = 100;
        this.state = "alive";
        this.score = 0;
        this.eventsEmitter = eventsEmitter;
    }

    takeDamage(damage) {
        if (this.state === "alive") {
            this.hp -= damage;
        }

        if (this.hp <= 0 && this.state === "alive") {
            this.state = "dead";
            this.hp = 0;
            return true;

        }
        return false;

    }

    addScore()
    {
        this.score++;
    }

    revived()
    {
        this.state = "alive";
        this.hp = 100;
    }

    toJson()
    {
        return { "id": this.id, "position" : this.position, "rotation": this.rotation, "name": this.name, "hp": this.hp, "state": this.state, "score": this.score};
    }

}

module.exports =  Player ;