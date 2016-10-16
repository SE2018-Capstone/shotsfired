
export interface Event {
  type: string;
  initiator: string;
  receptor: string;
}

export class EventFactory {
  static createEvent(type: string, initiator: string, receptor: string) {
    return Object.assign({
      type,
      initiator,
      receptor
    }) as Event;
  }
}
