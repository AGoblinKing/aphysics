# A-Physics (4 you)
An A-Frame component that enables physics using Oimo.js

## Quick Start
Include the library + oimo.js on your project.
```html
<script type="text/javascript" src="oimo.js"></script>
<script type="text/javascript" src="aphysics.js"></script>
```
Then use it:
```html
<a-scene world>
  <a-box physics position="0 20 0" color="blue"></a-box>
  <a-box physics position="10 10 0" color="blue"></a-box>
  <a-box physics position="2.5 105 0" color="blue"></a-box>
  <a-box physics position="-5 105 1" color="blue"></a-box>
  <a-box physics position="-2.5 105 -5" color="blue"></a-box>
  <a-box physics position="5 10 0" color="blue"></a-box>
 
  <a-plane rotation="-90 0 0" width="100" height="100" physics="move:false;bb:100 100 1" color="orange"></a-plane>
</a-scene>
```

## API

### World Component
 - *gravity: x y z* - A vector3 representing the direction and force of gravity

### Physics Component
 - *bb: width height depth* - Creates a box bounding box with the supplied params.
 - *move: bool* - Whether an item is moveable by the physics engine
 - *restitution: number* - ??
 - *friction: number* - The friction coefficient for the object
 - *mass: number* - The mass of the object.

## TODO
 - [ ] Other shapes besides box
 - [ ] Compound bounding boxes
 - [ ] Joints
 - [ ] Move to WebWorker
 
