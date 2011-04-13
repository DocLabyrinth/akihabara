var mouse = {
	tracking: false,
	dragging: false,

	pos: {
		x: 0,
		y: 0,
		chx: 0,
		chy: 0
	},

	drag: {
		from: {
			x: 0,
			y: 0
		},
		to: {
			x: 0,
			y: 0
		}
	},

	update: function(pos_x, pos_y) {
		mouse.pos.chx = mouse.pos.x - pos_x;
		mouse.pos.chy = mouse.pos.y - pos_y;

		mouse.pos.x = pos_x;
		mouse.pos.y = pos_y;

		// TODO: update accelleration / other info here later?
	},
	trackStart: function() {
		gbox.getBuffer().addEventListener('mousedown', function(ev) {
			if(ev.button == 2) {
				mouse.drag.from.x = mouse.pos.x;
				mouse.drag.from.y = mouse.pos.y;
				mouse.dragging = true;	
			}
		}, false);

		gbox.getBuffer().addEventListener('mouseup', function(ev) {		
			// use the right mouse button for dragging
			if(ev.button == 2) {
				mouse.drag.to.x = mouse.pos.x;
				mouse.drag.to.y = mouse.pos.y;
				mouse.dragging = false;
			}
		}, false);

		gbox.getBuffer().addEventListener('mouseout', function(ev) {		
			mouse.dragging = false;	
		}, false);

		gbox.getBuffer().addEventListener('mousemove', function(ev) {		
			var canvas = gbox.getBuffer();
			if(canvas) {
				mouse.update(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
			}
		}, false);
		this.tracking = true;
	},
	trackStop: function() {
		gbox.getBuffer().removeEventListener('mousemove');
		this.tracking = false;
	}
};
