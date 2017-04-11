import GameObject from './base-object'
import { Event } from './event'

export interface EventEmitter {
    emitEvent(o: Object): Event;
    addGameObject(gameObject: GameObject): void;
}