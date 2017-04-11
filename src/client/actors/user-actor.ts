import Actor from './actor'
import { Sprite } from 'phaser'

class UserActor extends Actor {
    movingUp: boolean;
    movingDown: boolean;
    movingLeft: boolean;
    movingRight: boolean;
    velocity: number;
    
    actor: Sprite; 
    
}