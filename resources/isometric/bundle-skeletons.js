{
	setObject: [
		{
			object:"skeletons",
			property:"basic",
			value: {}
		},
		{
			object:"skeletons",
			property:"mouse",
			value: {
				nodes: null,
				wpCount: 0, // number of waypoints traversed in the current path
				wpCalcMax: 0, // recalculate after this many waypoints
				waypoint: null,
				destTile: null,

				_hit_error: function(message) {
					// console.log(this.id+' hit error: '+message); // log in console
					this.status_txt = 'I have hit an error :('; // indicate something went wrong
					this.move('error recovery function');
				},
				recalc_path: function() {
					if(this.destTile == null) {
						// destination reached or not set, no path to calculate
						return;
					}

					// in case we need to recalculate the path
					var startTile = {
						x: Math.floor(this.x/tileWidth),
						y: Math.floor(this.y/tileWidth),
					}
					// var endTile = isometric.screenToWorld(mouse.pos.x, mouse.pos.y, isometric.vectors.mouse, {mapOffset: offset, tileWidth:this.tileWidth});

					// recalculate if too few nodes remain
					this.nodes = a_star([startTile.x, startTile.y], [this.destTile.x, this.destTile.y], pathMap, pathMap.length, pathMap[0].length); 
					g_recalc++; // store the number of times a_star is called

					//alert( JSON.stringify(this.nodes) );
					// console.log('after recalc, got '+this.nodes.length+' nodes');
					if(this.nodes.length < 1) {
						throw Error('pathfinding returned 0 nodes for '+this.id);
						this.move();
					}

					if(this.nodes.length == 1) {
						// we're at the destination
						this.wpCount = 0;
						this.waypoint = null;
						this.destTile = null;
					}
					else {
						// otherwise start moving
						this.wpCount = 1;
						this.wpCalcMax = this.nodes.length - 1; // Math.floor(this.nodes.count * 0.75); // ensure at least half the path has been moved before recalculating
						this.waypoint = {
							x: this.nodes[this.wpCount].x*tileWidth,
							y: this.nodes[this.wpCount].y*tileWidth
						};
					}
				},
				handle_move: function() {
					var move_x, move_y;
					
					if(this.waypoint == null) {
						return;
					}	

					// a_star waypoint values are in tiles, this.waypoint is in actual axis units
					if(this.x == this.waypoint.x && 
						this.y == this.waypoint.y) {
							if(this.x == this.destTile.x*tileWidth &&
								this.y == this.destTile.y*tileWidth) {
								// reached destination
								this.halt();
								if(!this.selected == true) {
									// keep moving if not selected
									var thisObj = this; // scope workaround
									setTimeout(function() { thisObj.move.apply(thisObj, ['destination anon callback']); }, help.random(1000,8000))
								}

								return;
							}

							// // console.log('reached waypoint');
							this.wpCount++;	
							if(this.wpCount >= this.wpCalcMax) {
								// // console.log('new wpCount is '+this.wpCount);		
	
								if(this.nodes.length <= this.wpCount) {
									try {
										this.recalc_path();
									}
									catch(err) {
										this._hit_error(err.message);
										return;
									}
								}

								if( !this.nodes.hasOwnProperty(this.wpCount) ) {
									// console.log(this.id+' pre-empted failure by invalid wpCount index, '+this.wpCount);
									this._hit_error();
									return;
								}

								// move to the next waypoint
								this.waypoint = {
									x: this.nodes[this.wpCount].x*tileWidth,
									y: this.nodes[this.wpCount].y*tileWidth
								};
								// // console.log('next waypoint '+JSON.stringify(this.waypoint));		
							}
							else {
								// gone through enough nodes to need recalculating
								// this.recalc_path();

								// move to the next waypoint
								this.waypoint = {
									x: this.nodes[this.wpCount].x*tileWidth,
									y: this.nodes[this.wpCount].y*tileWidth
								};
							}
					} // end of code run when a waypoint is reached
					 

					// move towards destination point
					if( Math.abs(this.waypoint.x - this.x) < this.speed ) {
						this.x = this.waypoint.x;
					}
					else {
						this.x += this.waypoint.x < this.x ? -this.speed : this.speed;
					}

					if( Math.abs(this.waypoint.y - this.y) < this.speed ) {
						this.y = this.waypoint.y;
					}
					else {
						this.y += this.waypoint.y < this.y ? -this.speed : this.speed;
					}

				},
				handle_click: function() {
					if(this.selected != true) {
						return;
					}

					var startTile = {
						x: Math.floor(this.x/tileWidth),
						y: Math.floor(this.y/tileWidth),
					}
					this.destTile = isometric.screenToWorld(mouse.pos.x, mouse.pos.y, isometric.vectors.mouse, {mapOffset: offset, tileWidth:this.tileWidth});
					this.destTile.x = Math.floor(this.destTile.x/tileWidth);
					this.destTile.y = Math.floor(this.destTile.y/tileWidth);

					try {
						this.recalc_path();
					}
					catch(err) {
						this._hit_error(err.message);
						return;
					}
				},
				halt: function() {
					this.nodes = null;
					this.destTile = null;
					this.waypoint = null;
					this.wpCount = 0;
				},
				move: function(called_from) {
					if(!called_from) {
						console.log('move - called_from is not set');
					}
					else {
						console.log('move - called_from = '+called_from);
					}

					this.halt(); // wipe any previous movement data

					if(this.selected != true) {
						this.destTile = {x: help.random(0, g_gameMap.map.length-1), y: help.random(0, g_gameMap.map[0].length-1)};
						// console.log('selected random tile '+JSON.stringify(this.destTile));
						// this.destTile.x = Math.floor(this.destTile.x/tileWidth);
						// this.destTile.y = Math.floor(this.destTile.y/tileWidth);
						try {
							this.recalc_path();
						}
						catch(err) {
							// console.log(err.message);
							return;
						}
					}
				},				
				show_status: function() {
					var use_txt = this.status_txt == null ? '' : this.status_txt;
					if(sel_skeleton !== null && sel_skeleton.group == this.group && sel_skeleton.id == this.id) {
						use_txt = 'direct me '+use_txt;	
					}


					gbox.blitText(gbox.getBufferContext(), {
						font: 'small',
						text: use_txt,
						dx: this.iso_pos.x,
						dy: this.iso_pos.y - gbox.getTiles(this.tileset).tileh - 5
					});
				}
			}
		}
	],
	onLoad: function(load, res) { 
		 var base_skeleton = {
			group: 'skeletons',
			x: 0,
			y: 0,
			z: 0,
			tileset: 'skeleton_tiles',

			// size/position/movement
			iso_pos: {x: 0, y:0}, // the screen space coordinates for this skeleton
			iso_size: {x:30, y:30, z: 60},
			iso_offset: {x: 0, y: 0}, // where to draw the sprite relative to the coordinates
			moving_to: null,
			speed: 10,
			status_txt: null,

			// flags
			selected: false,

			// animation
			animList: {
				still:  {speed: 1, frames: [48]},
				left:   {speed: 2, frames: [0,1,2,3,4,5,6,7]},
				leftUp: {speed: 2, frames: [8,9,10,11,12,13,14]},
				up: {speed: 2, frames: [16,17,18,19,20,21,22,23]},
				upRight: {speed: 2, frames: [24,25,26,27,28,29,30,31]},
				right: {speed: 2, frames: [32,33,34,35,36,37,38,39]},
				rightDown: {speed: 2, frames: [40,41,42,43,44,45,46,47]},
				down: {speed: 2, frames: [48,49,50,51,52,53,54,55]},
				downLeft: {speed: 2, frames: [56,57,58,59,60,61,62,63]}
			},
			frame: 0, 
			initialize: function() {
				toys.topview.initialize(this,{});

				// calculate sprite offset
				var iso_start = isometric.worldToScreen(this.x, this.y, isometric.vectors.screen, {mapOffset: offset});
				var iso_limit = isometric.worldToScreen(this.x+this.iso_size.x, this.y+this.iso_size.y, isometric.vectors.screen, {mapOffset: offset});
				// this.iso_offset = {x: iso_limit.x - iso_start.x, y: iso_limit.y - iso_start.y};
				this.iso_offset = {x: 0, y: 0};

				this.frame = this.animList.still.frames[0];
			},
			handle_click: function() {

			},
			handle_move: function() {
				// handle input and existing momentum
				toys.topview.controlKeys(this, { left: 'left', right: 'right', up: 'up', down: 'down' });
				toys.topview.handleAccellerations(this);
				toys.topview.applyForces(this);
			},
			show_status: function() {
				var use_txt = this.status_txt == null ? '' : this.status_txt;
				if(sel_skeleton !== null && sel_skeleton.group == this.group && sel_skeleton.id == this.id) {
					use_txt = 'direct me '+use_txt;	
				}

				gbox.blitText(gbox.getBufferContext(), {
					font: 'small',
					text: this.use_txt,
					dx: this.iso_pos.x,
					dy: this.iso_pos.y - gbox.getTiles(this.tileset).tileh - 5
				});
			},
			first: function() {
				// store position before move to track change
				var beforeMove = {
					x: this.x,
					y: this.y
				}

				this.handle_move();

				this.accx = this.x - beforeMove.x;
				this.accy = this.y - beforeMove.y;

				// handle animation 
				if (this.accx == 0 && this.accy == 0) this.animIndex = 'still';
				if (this.accx > 0 && this.accy > 0)  this.animIndex = 'right';
				if (this.accx > 0 && this.accy < 0)  this.animIndex = 'up';
				if (this.accx < 0 && this.accy > 0)  this.animIndex = 'down';
				if (this.accx < 0 && this.accy < 0)  this.animIndex = 'left';
				if (this.accx == 0 && this.accy > 0)  this.animIndex = 'rightDown';
				if (this.accx == 0 && this.accy < 0)  this.animIndex = 'leftUp';
				if (this.accx < 0 && this.accy == 0)  this.animIndex = 'downLeft';
				if (this.accx > 0 && this.accy == 0)  this.animIndex = 'upRight';
				

				if (frameCount%this.animList[this.animIndex].speed == 0) {
					this.frame = help.decideFrame(frameCount, this.animList[this.animIndex]);
				}	
			},
			blit: function() {
				if(isometric.inDepthPhase != true) {
					// don't display until during depth sorting
					return;
				}

				// transform current position for display on screen
				this.iso_pos = isometric.worldToScreen(this.x, this.y, isometric.vectors.screen, {mapOffset: offset, rectWidth: this.iso_size.x, rectHeight: this.iso_size.y, z: this.z});
				// blit main sprite
				gbox.blitTile(gbox.getBufferContext(), {
					tileset: this.tileset,
					tile:    this.frame,
					dx:      this.iso_pos.x,
					dy:      this.iso_pos.y - gbox.getTiles(this.tileset).tileh,
					fliph:   this.fliph,
					flipv:   this.flipv,
					camera:  this.camera,
					alpha:   1.0
				});

				this.show_status();
			}
		}

		for(sk_key in skeletons) {
			help.mergeWithModel(skeletons[sk_key], base_skeleton);
		}
	}		
}
