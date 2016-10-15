import { Event } from './event'
import Actor from './actors/actor'
export class EventRegistry {
    events: Event[]; 
    localActors: Actor[];
    latestEvent: number; 
}

let createEventLoop = () => {
    window.setInterval(()=> {
        
    }, 20)
}