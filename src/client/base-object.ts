import { EventEmitter } from './interface'

class GameObject {
    
    subscribe(eventEmitter: EventEmitter) {
        eventEmitter.addGameObject(this);         
    }
}

export default GameObject;