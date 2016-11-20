export interface WallState {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}
export interface Map {[id:string]: WallState};

function wall(x:number,y:number,width:number,height:number,type:string): WallState {
  return {x,y,width,height,type};
}

export const MapCatalog: Map[] = [{
  1: wall(380,260,200,200,'4'),
  2: wall(170,145,140,70,'2'),
  3: wall(205,470,70,140,'1'),
  4: wall(650,505,140,70,'3'),
  5: wall(685,110,70,140,'1'),
}];
