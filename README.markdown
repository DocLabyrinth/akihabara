Isometric Engine
================
Although the commits have been few and far between I am still actively working on an isometric engine for akiahbara. A lot of the work has been experimenting and trying different approaches so it's only been occasionally that I've made enough progress to make it worth pushing to a public repo. 

I updated the demo in game-isometric.html to include basic mouse support and to allow basic control of the skeletons' movement. Each skeleton picks a random point at the start and navigates to it before waiting a random interval and repeating the process. To direct a skeleton click on it to stop it then double click somewhere else on the map and it should navigate to that tile. 

The isometric functions should be usable for some purposes although they still need a lot of work before being stable. Better documentation on how to use the functions will follow soon.


Essential Points
----------------
* Call isometric.initVectors() with the rotation and vertical scaling (shows up as tile squashing) as arguments to initialise the internal vectors before using any isometric functions.
* Set isometric.depthGroups to an array with the group ids of objects which need depth sorting
* At the start of the blit function for all depth sorted objects, add this code: if(isometric.inDepthPhase != true) { return; } - this prevents the usual gbox functions from drawing out of order, it is a bit of a hack so it may change if I find a more elegant solution
Blit as much as possible of the background to a buffer canvas and draw from it. If the game is tile based then drawing background tiles will usually be the biggest cause of calls to isometric transform functions and will kill performance if it happens once a frame for a map any larger than about 10x10 tiles. isometric.finalizeTilemap() was designed to assist with calculating the canvas size for this but it is still buggy :( (see demo for example) it should be fixed soon.
* Depth sorted objects can be a drain on performance if there are lots of them in the game world. My code still uses a bubble sort due to problems I had with getting other algorithms to sort reliably. If you are writing a tile based game it may be better to loop over the tiles and draw them and their contents from back to front. (See the lua based map drawing functions in Corsix-TH http://code.google.com/p/corsix-th/source/checkout for an example of this)


Known Issues / Possible Improvements
------------------------------------
* Depth sorting algorithm needs improving, non-visible objects should be excluded from the sort
* Akihabara gbox camera functions break isometric setup if called, the offset of the map/objects is adjusted to give the ability to scroll, this needs solving or integrating better
* A toys.isometric namespace combining elements of other toys (topview and platformer especially) and including some simplified 3d collision and vector functions will be useful eventually


Akihabara
=========

Akihabara is a set of libraries, tools and presets to create pixelated indie-style 8/16-bit era games in Javascript that runs in your browser without any Flash plugin, making use of a small small small subset of the HTML5 features, that are actually available on many modern browsers.

Notes for developers
--------------------

* For maximum compatibility make sure that you're using the ["name"] for when setting object properties with reserved names like "goto" and "data" (Discovered during patching for Wii)
* Also do not use the comma after the last element of an array or a property of an object. Still work on many browsers but is broken for Opera Wii. (and probably IE, when will be supported)
* For making sure that your sub-scripts are loaded, try to add an "alert" at the end. Opera for Wii silently fail when there are syntax errors like the one explained before.
* Opera Wii wants that canvas have to be blitted at least once before being used - or fails with a browser crash! The built-in gbox.createCanvas was already fixed. Is a good thing to use that method for spawning canvas.

AkibaKa
-------

Thought as a flexible and simple Akihabara resource editor, AkibaKa has been committed partially uncompleted due to lack of time. Iit should be functional enough but I hope that I'll start working on it again or (better) that someone will pick up the code and give it a spin! :)

Todo
----

* Some way for updating the JSDoc automatically. (Darren and Darius wrapped up tutorials and docs! - BTW some scripts for generating docs form sources are needed)
* Better embeddability keeping playability on mobile
* Solve randomly blinking sprites on Wii (?)
* ON AkibaKa: add addImage and addTiles only when used!

Improvement
-----------

* Audio compatibility *Work in progress*

Nice to have
----
* Networking
