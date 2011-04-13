var isometric = {
	vectors: {},
	depthGroups: [],
	inDepthPhase: false,

	initVectors: function(rotation, elevation) {
		// default to squashed diamond shaped tiles at 45 degrees
		if(!rotation) {
			// canvas angles are in radians, remember to convert before passing params
			rotation = 45 * (Math.PI/180);
		}
		if(!elevation) {
			elevation = 0.5; // elevation is done by scale factor instead of camera angle
		}

		// combine scale and rotation matrices with the requested display settings
		var final_matrix = $M([
			[1, 0],
			[0, elevation]
		]).x( Matrix.Rotation(-rotation) );

		// get the inverse matrix for picking screen coords later
		var inv_matrix = final_matrix.inv();

		/* transform 1,0 and 0,1 using each matrix so we can just 
		   multiply by the resulting values to translate points
		   instead of needing repeated calls to trig functions */
		var screen_right = final_matrix.multiply( $V([1,0]) );
		var screen_front = final_matrix.multiply( $V([0,1]) );

		var mouse_right = inv_matrix.multiply( $V([1,0]) );
		var mouse_front = inv_matrix.multiply( $V([0,1]) );

		var output = {
			screen: {
				right: {
					x: screen_right.elements[0],
					y: screen_right.elements[1]
				},
				front: {
					x: screen_front.elements[0],
					y: screen_front.elements[1]
				}
			},
			mouse: {
				right: {
					x: mouse_right.elements[0],
					y: mouse_right.elements[1]
				},
				front: {
					x: mouse_front.elements[0],
					y: mouse_front.elements[1]
				}
			}
		}

		isometric.vectors = output;

		return output;
	},
  
	worldToScreen: function(x, y, vector, opts) {
		var defaults = {
			mapOffset: {x: 0, y: 0},
			roundType: 'floor',
			tileWidth: 50,
			z: 0
		};

		var settings = help.copyModel(defaults, opts);

		var output = {
			x: x * vector.right.x + y * vector.front.x,
			y: x * vector.right.y + y * vector.front.y
		}

		switch(settings.roundType) {
			case 'floor':
				output.x = Math.floor(output.x);	
				output.y = Math.floor(output.y);	
				break;

			case 'ceil':
				output.x = Math.ceil(output.x);	
				output.y = Math.ceil(output.y);	
				break;

			case 'none':
			default:
				break;
		}

		output.x += settings.mapOffset.x;
		output.y += settings.mapOffset.y;
		output.y -= settings.z

		return output;
	},

	screenToWorld: function(x, y, vector, opts) {//, mapOffset, asTile, tileWidth) {
		var defaults = {
			mapOffset: {x: 0, y: 0},
			roundType: 'floor',
			tileWidth: 50			
		};

		var settings = help.copyModel(defaults, opts);

		/* map points are shifted by an offset before being translated to screen coords,
		   remove this offset before reversing the transformation to get the world coord */
		var use_x = x - settings.mapOffset.x;
		var use_y = y - settings.mapOffset.y;

		var output = {
			x: use_x * vector.right.x + use_y * vector.front.x,
			y: use_x * vector.right.y + use_y * vector.front.y
		}

		switch(settings.roundType) {
			case 'floor':
				output.x = Math.floor(output.x);	
				output.y = Math.floor(output.y);	
				break;

			case 'ceil':
				output.x = Math.ceil(output.x);	
				output.y = Math.ceil(output.y);	
				break;

			case 'none':
			default:
				break;
		}

		return output;
	},

	getRectPoints: function(x, y, vector, opts) {
		var defaults = {
			mapOffset: {x: 0, y: 0},
			roundType: 'floor',
			rectWidth: 0,
			rectHeight: 0
		};

		var settings = help.copyModel(defaults, opts);
		var points = [];			

		if(settings.rectHeight < 1) {
			// assume a square selection if no height is passed
			settings.rectHeight = settings.rectWidth;
		}
	
		// TODO: it may be quicker to just multiply by the vectors here, check this later
		// get the translated points for each of the four corners of this tile

		// round using ceil to make the selection cover the square the mouse pointer lies in
		var transOpts = {mapOffset: settings.mapOffset, roundType: settings.roundType};

		points.push( isometric.worldToScreen(x, y, vector, transOpts) );	
		points.push( isometric.worldToScreen(x+settings.rectWidth, y, vector, transOpts));	

		points.push( isometric.worldToScreen(x+settings.rectWidth, y+settings.rectHeight, vector, transOpts));

		points.push( isometric.worldToScreen(x, y+settings.rectHeight, vector, transOpts));

		return points;

	},

	// the tile width in isometric space, need a parameter because it won't match the size of the tileset image
	finalizeTilemap: function(map, tileWidth) {
		var mapCorners = [];			
		var useOffset = {x: 0, y: 0};

		var mapW = map.map.length, mapH = map.map[0].length;

		var output = {
			size: {},
			offset: {}
		};

		// get the screen coordinates for each of the map corners 
		mapCorners.push( isometric.worldToScreen(0, 0, isometric.vectors.screen, useOffset) );	
		mapCorners.push( isometric.worldToScreen(tileWidth*mapW, 0, isometric.vectors.screen, useOffset) );	
		mapCorners.push( isometric.worldToScreen(tileWidth*mapW, tileWidth*mapH, isometric.vectors.screen, useOffset) );	
		mapCorners.push( isometric.worldToScreen(0, tileWidth*mapH, isometric.vectors.screen, useOffset) );	

		// find the minimum and maximum x and y values out of all the map corners
		var min_x = Math.round( Math.min( mapCorners[0].x, mapCorners[1].x, mapCorners[2].x, mapCorners[3].x) );
		var min_y = Math.round( Math.min( mapCorners[0].y, mapCorners[1].y, mapCorners[2].y, mapCorners[3].y) );
		
		var max_x = Math.round( Math.max( mapCorners[0].x, mapCorners[1].x, mapCorners[2].x, mapCorners[3].x) );
		var max_y = Math.round( Math.max( mapCorners[0].y, mapCorners[1].y, mapCorners[2].y, mapCorners[3].y) );

		map.w = Math.round(max_x - min_x);
		map.h = Math.round(max_y - min_y);
		map.hw = Math.floor(map.w);
		map.hh = Math.floor(map.h);

		/* if the isometric rotation would result in part of the map being 
		   before 0 on either axis, work out the initial offset to ensure it
		   is drawn exactly within the canvas dimensions */
		map.initOffset = {};
		map.initOffset.x = min_x < 0 ? (map.w-Math.abs(min_x)) : 0;
		map.initOffset.y = min_y < 0 ? (map.h-Math.abs(min_y)) : 0;

		return map;
	},
	depthSort: function() {
		var outArr = [];

		// get an array of all the object ids/groups to be sorted
		for(depthGroup in isometric.depthGroups) {
			var groupName = isometric.depthGroups[depthGroup];
			for(groupItem in gbox._objects[ groupName ]) {
				outArr.push({group: gbox._objects[groupName][groupItem].group, id: gbox._objects[groupName][groupItem].id});	
			}
		}
		
		/*
		   #################
		   using a bubble sort to set the rendering order depending on object position,
		   this algorithm performs badly, replace with something better soon
		*/
		var swap_keys = function(key_a, key_b) {
			var temp = outArr[key_a];
			outArr[key_a] = outArr[key_b];
			outArr[key_b] = temp;

			return true;
		}

		var swapped = false;	
		var a_item, b_item, a_obj, b_obj;
		for(comp_iter = 1; comp_iter < outArr.length; comp_iter++) {
			for(cursor_iter = 0; cursor_iter < outArr.length; cursor_iter++) {

				a_item = outArr[cursor_iter];
				b_item = outArr[cursor_iter+1];
				if(!b_item) {
					break;
				}		

				a_obj = gbox.getObject(a_item.group, a_item.id);
				b_obj = gbox.getObject(b_item.group, b_item.id);

				if( (a_obj.y - a_obj.iso_size.y) >= b_obj.y || (a_obj.x + a_obj.iso_size.x) <= b_obj.x ||(a_obj.z + a_obj.z) >= b_obj.z ) {
					swapped = swap_keys(cursor_iter, cursor_iter+1);
				}
			}

			if(!swapped) {
				break;
			}
		}
		

		return outArr; 
	},
	blitDepthLayer: function(ctx, sortArr) {
		isometric.inDepthPhase = true;	

		var objStr = '';
		for(obj in sortArr) {
			var readObj = sortArr[obj];
			gbox.getObject(readObj.group, readObj.id).blit();

			objStr += readObj.id+', ';
		}

		isometric.inDepthPhase = false;	
	}
};

