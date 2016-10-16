
export interface Event {
    type: string;
    initiator: number;
    receptor: number;
}

export class EventFactory {
    static createEvent(type: string, initiator: number, receptor: number) {
        return Object.assign({
            type, 
            initiator,
            receptor
        }) as Event; 
    }
} 