
export interface Event {
  type: string;
  initiator: string;
  receptor: string;
  data: any;
}

export class EventFactory {
  static createEvent(type: string, initiator: string, receptor: string, data: any) {
    if (typeof data === 'undefined') {
      data = {}; 
    }
    return Object.assign({
      type,
      initiator,
      receptor,
      data: data,
    }) as Event;
  }
}
