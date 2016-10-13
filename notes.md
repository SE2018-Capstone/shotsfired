

# Tasks (Deliverable 2)



### Shared

##### Actual Game

- Drawing (Basic shapes)
  - Characters
  - Blocks for walls
  - Bullets
- Core logic
  - Movement
  - Collision





### Client

- One button to "Quick play"
  - Immediately get placed into a game
  - Place you in the field until 4 players are in or if a time limit is reached
- Once theres 4 people, start the game
- When one person is left, do whatever is easiest 

### Server

- Handle connections joining a game
- Only need one game, running locally
- Player based on socket id
- Getting events, having a buffer or something, then running them all and emitting the resulting events



















# Core Logic Details

- Server

  - Each frame, get a snapshot of user inputs

  - At some frequency, send frames to server, with timestamps of how long each frame took.

  - Server has a buffer of input frames for each player, as long as theres stuff in the buffer it runs it.  

    - Server runs the game loop, but the delta time it uses is the input it got
      - how to deal with jumping people?
    - Broadcast every 20ms?  some number

    ​