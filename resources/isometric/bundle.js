{
	addImage: [
		['road-tiles', 'resources/isometric/road_tiles.png'],
		['skeleton_sprite', 'resources/isometric/skeleton-walking-only.png'],
		['wall_image', 'resources/isometric/wall_section.png'],
		['font', 'resources/leavemealone/font.png'],
		['logo', 'resources/leavemealone/logo.png']
	],
	addFont: [
		{id: 'small',image: 'font',firstletter: ' ',tileh: 8,tilew: 8,tilerow: 255,gapx: 0,gapy: 0}
	],
	addTiles: [
		{id: 'map_pieces',image: 'road-tiles',tileh: 65,tilew: 100,tilerow: 2,gapx: 0,gapy: 0},
		{id: 'skeleton_tiles',image: 'skeleton_sprite',tileh: 64,tilew: 76,tilerow: 8,gapx: 0,gapy: 0},
		{id: 'wall_section',image: 'wall_image',tileh: 112,tilew: 64,tilerow: 1,gapx: 0,gapy: 0}
	],
	addBundle: [
		{file:"resources/isometric/bundle-skeletons.js"}
	]
}
