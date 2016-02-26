/* global AFRAME, OIMO */

(function () {
  'use strict';

  const ImpostorComponent = {
    schema: {
      restitution: { default: 0.01 },
      type: { default: 'cube' },
      friction: { default: 0.01 },
      mass: { default: 1 },
      bb: { type: 'vec3', default: '1.5 1.5 1.5' },
      move: { default: true }
    },

    init() {
      this.joints = [];
      const sceneEl = this.el.sceneEl;
      sceneEl.addEventListener('loaded', () => {
        if (!('world' in sceneEl.components)) {
          console.warn('oimo-world must be specified on scene for physics to work.');
        }

        // like a stutter
        this.frameworld = sceneEl.components.world;
        this.world = this.frameworld.world;

        this.id = this.frameworld.add(this);
      });
      this.beforePos = this.el.object3D.position.clone();
    },

    initBody(id) {
      if (!this.bodyInitialized) {
        const o3d = this.el.object3D;

        // we're going to do some assumptions here
        // The position and rotation are based off the o3d world coords
        const bodyConfig = {
          name: id,
          config: [this.data.mass, this.data.friction, this.data.restitution],
          size: [this.data.bb.x, this.data.bb.y, this.data.bb.z],
          type: ['box'],
          pos: [o3d.position.x, o3d.position.y, o3d.position.z],
          rot: [
            o3d.rotation.x,
            o3d.rotation.y,
            o3d.rotation.z
          ],
          move: this.data.mass !== 0 && this.data.move,
          world: this.world
        };

        this.body = new OIMO.Body(bodyConfig).body;
        this.bodyInitialized = true;
      }
    },

    beforeStep() {
      // Update Body
      const pos = this.el.object3D.position;
      const rot = this.el.object3D.quaternion;

      this.body.position.init(pos.x * OIMO.INV_SCALE, pos.y * OIMO.INV_SCALE, pos.z * OIMO.INV_SCALE);
      this.body.orientation.init(rot.w, rot.x, rot.y, rot.z);
      this.body.syncShapes();
      this.body.awake();

      this.beforePos.copy(pos);
    },

    afterStep() {
      // Update o3d
      const pos = this.el.object3D.position;
      const rot = this.el.object3D.quaternion;

      if (!this.body.sleeping) {
        pos.copy(this.body.getPosition());
        rot.copy(this.body.getQuaternion());
      }
    },

    onCollide(collider) {
      // collided so uh.. stop moving?
      this.el.object3D.position.copy(this.beforePos);
    }
  };

  // Move this from component to element in the future
  const WorldComponent = {
    schema: {
      gravity: { type: 'vec3', default: { x: 0, y: -1, z: 0 } }
    },

    init() {
      this.impostorId = 0;
      this.world = new OIMO.World(1 / 60, 2, 2, true);
      this.world.clear();
      this.impostors = {};
    },

    update() {
      this.world.gravity.copy(this.data.gravity);
    },

    add(impostor) {
      this.impostorId++;
      this.impostors[this.impostorId] = impostor;
      impostor.initBody(this.impostorId);
      return this.impostorId;
    },

    remove(impostor) {
      delete this.impostors[impostor.id];
    },

    tick() {
      Object.keys(this.impostors).forEach((key) => {
        this.impostors[key].beforeStep();
      });

      // doesn't actually use the time param
      this.world.step();

      Object.keys(this.impostors).forEach((key) => {
        this.impostors[key].afterStep();
      });

      let contact = this.world.contacts;

      // handle collisions
      while (contact !== null) {
        if (contact.touching && !contact.body1.sleeping && !contact.body2.sleeping) {
          contact = contact.next;
          continue;
        }

        const mainImpostor = this.impostors[+contact.body1.name];
        const collidingImpostor = this.impostors[+contact.body2.name];

        if (!mainImpostor || !collidingImpostor) {
          contact = contact.next;
          continue;
        }

        mainImpostor.onCollide({ body: collidingImpostor.physicsBody });
        collidingImpostor.onCollide({ body: mainImpostor.physicsBody });
        contact = contact.next;
      }
    }
  };

  AFRAME.registerComponent('world', WorldComponent);
  AFRAME.registerComponent('physics', ImpostorComponent);
}());
