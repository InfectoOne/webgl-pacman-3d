// somethin akin to an enum, representing the possible facing directions of Pacman:
const PacmanFacingDirection = {
  NEGATIVE_Z: {vector: [0.0, 0.0, -1.0] },  // backward
  POSITIVE_Z: {vector: [0.0, 0.0, 1.0]},    // forward
  NEGATIVE_X: {vector: [-1.0, 0.0, 0.0]},   //left
  POSITIVE_X: {vector: [1.0, 0.0, 0.0]}     //right
}

Object.freeze(PacmanFacingDirection)