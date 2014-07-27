MOUSE_POSITION = {};
SCROLL_INTERVAL = 100;
BORDER_WIDTH = 25;//parseInt($('#gameview').css('border-width').replace('px',''));
DRAGGING = false;
DRAGGING_POINTS = [];

function init_game_view() {
	var game_view_width = $('#gameview').width();
	var game_view_height = $('#gameview').height();
	var canvas_width = $('#background').width();
	var canvas_height = $('#background').height();
	$('#background').css({
		left:(game_view_width-canvas_width) / 2+'px', 
		top: (game_view_height - canvas_height)/2 + 'px'});	
	$('#gameview').mousemove(function(event){
		var x = event.clientX - this.offsetLeft - BORDER_WIDTH;
		var y = event.clientY - this.offsetTop - BORDER_WIDTH;
		MOUSE_POSITION = {x: x, y: y};
		//console.log(MOUSE_POSITION);
		if (DRAGGING) {
			var point = MOUSE_POSITION;
			/*var canvas_point = {
				x: point.x - $(bg_canvas).position().left, 
				y: point.y - $(bg_canvas).position().top
			};*/
			DRAGGING_POINTS.push(point);
		}		
		
		//console.log(game_view_width, x);
		//console.log(MOUSE_POSITION);
		/*if (game_view_width - x < 10) {
			move_map_right();
		}
		if (x< 10) {
			move_map_left();
		}
		if (y< 10) {
			move_map_bottom();
		}
		if (game_view_height - y < 10) {
			move_map_top();
		}*/
		//console.log(x, y);
	});
	$('#gameview').click(function(event) {		
		if (DRAGGING_POINTS.length > 0) {
			return;
		}
		console.log('click');
		var x = event.clientX - this.offsetLeft - BORDER_WIDTH;
		var y = event.clientY - this.offsetTop - BORDER_WIDTH;
		var canvas_point = {
				x: x - $(bg_canvas).position().left, 
				y: y - $(bg_canvas).position().top
		};
		MOVING_POINTS.push(canvas_point);
		
	});
}

function move_map_right() {
	var x = MOUSE_POSITION.x;
	var game_view_width = $('#gameview').width();
	if (game_view_width - x >= 10) {
		return;
	}
	var pos = $('#background').position();	
			//console.log(pos);			
	if (pos.left > game_view_width - $('#background').width()) {
		$('canvas').css({top: pos.top, left: pos.left-5, position:'absolute'});
	}	
	setTimeout(move_map_right, SCROLL_INTERVAL);
}

function move_map_left() {
	var x = MOUSE_POSITION.x;
	if (x >= 10) {
		return;
	}
	var pos = $('#background').position();
			//console.log(pos);			
	if (pos.left < 0) {
		$('canvas').css({top: pos.top, left: pos.left+5, position:'absolute'});
	}
	setTimeout(move_map_left, SCROLL_INTERVAL);
}

function move_map_top() {
	var y = MOUSE_POSITION.y;	
	var game_view_height = $('#gameview').height();
	if (game_view_height - y >= 10) {
		return;
	}
	var pos = $('#background').position();	
			//console.log(pos);			
	if (pos.top > game_view_height - $('#background').height()) {
		$('canvas').css({top: pos.top - 5, left: pos.left, position:'absolute'});
	}
	setTimeout(move_map_top, SCROLL_INTERVAL);
}

function move_map_bottom() {	
	var y = MOUSE_POSITION.y;
	if (y >= 10) {
		return;
	}
	var pos = $('#background').position();	
			//console.log(pos);			
	if (pos.top < 0) {
		$('canvas').css({top: pos.top + 5, left: pos.left, position:'absolute'});
	}
	setTimeout(move_map_bottom, SCROLL_INTERVAL);
}


function init_game() {
	bg_canvas = document.getElementById('background');
	bg_context = bg_canvas.getContext('2d');	
	fg_canvas = document.getElementById('foreground');
	fg_context = fg_canvas.getContext('2d');	
	preload_images(
		[
			{alias:'grass', url:'res/images/grass.png'},
			{alias:'stone', url:'res/images/stonetile.png'},
			{alias:'dragoon', url:'res/images/wesnoth_dragoon.png'},
			{alias:'car', url:'res/images/car.png'}
		],
		function() {
			//tile_iso_background();
			tile_topdown_background();
			init_game_view();
			init_game_draw();
			main_game();
			draw_character();
		});	
}


function iso_to_2D(point) {
	var _2d_point = {
		x : (2 * point.y + point.x) / 2,
		y : (2 * point.y - point.x) / 2
	};
	return _2d_point;
}

function _2D_to_iso(point) {
	var iso_point = {
		x : point.x - point.y,
		y : (point.x + point.y) / 2
	};
	return iso_point;
}

function tile_iso_background() {
	
	var tile_width = 32;
	var tile_height = 32;
	var width_count = 40;
	var height_count = 40;
	bg_canvas.width = tile_width * width_count * 2;
	bg_canvas.height = tile_height * (height_count+1);
	fg_canvas.width = tile_width * width_count * 2;
	fg_canvas.height = tile_height * (height_count+1);
	
	bg_context.fillRect(0, 0, bg_canvas.width, bg_canvas.height);
	
	bg_context.save();
	bg_context.translate(tile_width * (width_count-1), 0);
	for (var x = 0; x < width_count; x++) {
		for (var y = 0; y < height_count; y++) {
			var pos = {x: x * tile_width, y: y* tile_height};
			var pos_iso = _2D_to_iso(pos);
			//console.log(pos_iso);
			bg_context.drawImage(Loaded_Images['grass'], pos_iso.x, pos_iso.y);
		}
	};
	bg_context.restore();
}

function tile_topdown_background() {
	var tile_width = 96;
	var tile_height = 96;
	var width_count = 10;
	var height_count = 10;
	bg_canvas.width = tile_width * width_count;
	bg_canvas.height = tile_height * height_count;
	fg_canvas.width = $('#gameview').width();
	fg_canvas.height = $('#gameview').height();
	
	bg_context.fillRect(0, 0, bg_canvas.width, bg_canvas.height); 
	for (var x = 0; x < width_count; x++) {
		for (var y = 0; y < height_count; y++) {
			var pos = {x: x * tile_width, y: y * tile_height};
			bg_context.drawImage(Loaded_Images['stone'], pos.x, pos.y);
		}
	}
}

/*function draw_path(point) {	
	var canvas_point = {
		x: point.x - bg_canvas.offsetLeft, 
		y: point.y - bg_canvas.offsetTop
	};
	DRAGGING_POINTS.push(canvas_point);
	var previous_point = DRAGGING_POINTS[DRAGGING_POINTS.length-2];
	if (previous_point) {
		fg_context.beginPath();
		fg_context.strokeStyle='#FF0000';
		fg_context.lineCap = "round";
		fg_context.lineWidth=15;
		fg_context.moveTo(previous_point.x, previous_point.y);
		fg_context.lineTo(canvas_point.x, canvas_point.y);
		fg_context.stroke();
	}
}*/

function draw_path() {
	if (DRAGGING_POINTS.length == 0) {
		return;
	}
	fg_context.beginPath();
	fg_context.strokeStyle='#FF0000';
	fg_context.lineCap = "round";
	fg_context.lineWidth=15;
	for (var i = 0; i < DRAGGING_POINTS.length-1; i++) {
		var point = DRAGGING_POINTS[i];
		fg_context.moveTo(point.x, point.y);
		var point2 = DRAGGING_POINTS[i+1];
		fg_context.lineTo(point2.x, point2.y);
	}
	fg_context.stroke();
}

/*function clear_stroke() {
	var min_x = fg_canvas.width;
	var min_y = fg_canvas.height;
	var max_x = 0;
	var max_y = 0;
	for (var i = 0; i<DRAGGING_POINTS.length; i++) {
		var point = DRAGGING_POINTS[i];
		min_x = Math.min(point.x, min_x);
		min_y = Math.min(point.y, min_y);
		max_x = Math.max(point.x, max_x);
		max_y = Math.max(point.y, max_y);
	}
	setTimeout(function() {
	fg_context.clearRect(min_x - 10, min_y - 10 , max_x + 10, max_y + 10);	
	}, 1000);
}*/

function clear_stroke() {
	if (DRAGGING_POINTS.length > 0) {
		var p = DRAGGING_POINTS.shift();
		//move_character(p);
		requestAnimationFrame(clear_stroke);
	}
}

function distance_points(point1, point2) {
	var distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
	return Math.floor(distance);
}

function get_moving_points(points) {
	if (points.length == 0) {
		return [];
	}
	var i = 1;
	var last_point = points[0];
	var p = null;
	while (i < points.length) {
		p = points[i];
		if (distance_point) {}
		
	}
}


/*function move_character(point) {
	CHARACTER.position = point;
}*/
var velocity = 100;
var min_velocity = 100;
var max_velocity = 500;
var acceleration = 100;
var background = $('#background');
var foreground = $('#foreground');
function move_character(dt, point) {
	var pos = background.position();
	//console.log(pos);
	var character_pos = {x: CHARACTER.position.x - pos.left, y: CHARACTER.position.y - pos.top};
	var distance = distance_points(character_pos, point);
	if (distance <= 0.01) {
		//CHARACTER.position = point;
		MOVING_POINTS.shift();
		return true;
	}	
	var angle = calculate_angle(character_pos, point);
	CHARACTER.angle = angle;
	if (MOVING_POINTS.length == 1 && distance <= 30) {
		if (velocity > min_velocity) {
			velocity -= acceleration * dt;
		}
	}
	else if (velocity < max_velocity) {
		velocity += acceleration * dt;
	}
		
	//console.log(character_pos);
	var d = velocity * dt;
	var x, y;
	var dx, dy;
	if (d < distance) {
		dx = (d/distance) * (point.x - character_pos.x);
		dy = (d/distance) * (point.y - character_pos.y);	
	}
	else {
		dx = point.x - character_pos.x;
		dy = point.y - character_pos.y;
	}
	//dx = Math.ceil(dx);
	//dy = Math.ceil(dy);		
	//console.log(dx, dy);
	var new_left = pos.left - dx;
	var new_top = pos.top - dy;
	var x = character_pos.x + dx;
	var y = character_pos.y + dy;
	console.log(x, y);
	/*if (new_left <= 0 && new_left>= foreground.width() - background.width()) {
		background.css({left: new_left});	
	}
	else {
		CHARACTER.position.x += dx;
	}
	if (new_top <=0 && new_top >= foreground.height() - background.height()) {
		background.css({top: new_top});	
	}	
	else {
		CHARACTER.position.y += dy;
	}*/
	if (x >= foreground.width()/2 && x <= background.width() - foreground.width()/2
		&& new_left <= 0 && new_left>= foreground.width() - background.width()) {
		background.css({left: new_left});	
	}
	else {
		CHARACTER.position.x += dx;
	}
	
	if (y >= foreground.height()/2 && y <= background.height() - foreground.height()/2 
		&& new_top <=0 && new_top >= foreground.height() - background.height()) {
		background.css({top: new_top});	
	}	
	else {
		CHARACTER.position.y += dy;
	}
	return false;
	
}

function move_background(dt, point1, point2) {
	var pos = $('#background').position();	
	//console.log(point2);
	//console.log(point1.x - pos.left, point1.y - pos.top);
	if (point1.x == point2.x && point1.y == point2.y) {
		MOVING_POINTS.shift();
		return;
	}
	var distance = distance_points(point1, point2);
	if (velocity < max_velocity) {
		velocity += acceleration * dt;
	}
	var d = velocity * dt;
	//console.log(distance, d);
	var x, y;
	var dx, dy;
	if (d < distance) {
		dx = (d/distance)* (point2.x - point1.x);
		dy = (d/distance)* (point2.y - point1.y);
		x = point1.x + dx;
		y = point1.y + dy;
	}
	else {
		dx = (point2.x - point1.x);
		dy = (point2.y - point1.y);
		x = point2.x;
		y = point2.y;		
	}
	var new_point = {x: x, y: y};
	//CHARACTER.position = new_point;
	var new_top = x;
	var new_left = y;
	if (new_top > -480 && new_left > -320) {
		$('#background').css({top: new_top, left: new_left, position:'absolute'});
	}
}

function init_game_draw() {
	$('#foreground').mousedown(function(event) {
		//console.log('foreground');
		DRAGGING = true;
	});
	$('#foreground').mouseup(function(event) {
		
		DRAGGING = false;
		for (var i = 0; i < DRAGGING_POINTS.length; i++) {
			var point = DRAGGING_POINTS[i];
			var canvas_point = {
				x: point.x - $(bg_canvas).position().left, 
				y: point.y - $(bg_canvas).position().top
			};
			MOVING_POINTS.push(canvas_point);
		}
		clear_stroke();		
		//DRAGGING_POINTS = [];
	});
}

LAST_TIME = Date.now();
ENTITIES = [];
CHARACTER = null;
MOVING_POINTS = [];

function main_game() {
    var now = Date.now();
    var dt = (now - LAST_TIME) / 1000.0;

    update_game(dt);    
    //render();

    LAST_TIME = now;
    requestAnimationFrame(main_game);
};

function update_game(dt) {
	fg_context.clearRect(0, 0 , fg_canvas.width, fg_canvas.height);		
	draw_path();
	for (var i = 0; i < ENTITIES.length; i++) {
		ENTITIES[i].update(dt);
	}
	if (MOVING_POINTS.length > 0) {
		var res = move_character(dt, MOVING_POINTS[0]);	
		if (res) {
			MOVING_POINTS.shift();
		}	
		//move_character(dt, CHARACTER.position, MOVING_POINTS[0]);
	}
	else {
		velocity = 100;
	}
};

function draw_character() {	
	var x = $('#foreground').width() / 2;
	var y = $('#foreground').height() / 2;
	//s = new Sprite(fg_context, Loaded_Images['dragoon'], x, y, 72, 72, 6, 5);
	s = new Sprite(fg_context, Loaded_Images['car'], x, y, 127, 63, 1, 1);
	CHARACTER = s;
	ENTITIES.push(s);	
}

calculate_angle = function(from_point, to_point) {
	var from_x = from_point.x;
	var from_y = from_point.y;
	var to_x = to_point.x;
	var to_y = to_point.y;
	var dx = to_x - from_x;
	var dy = to_y - from_y;	
	var rad = 0;
	rad = Math.atan(dy/dx);
	if (dx < 0 && dy < 0) {
		rad = rad + Math.PI;
	}
	if (dx < 0 && dy >= 0) {
		rad = rad - Math.PI;
	}
	if (dx > 0 && dy < 0) {
		rad = 2*Math.PI + rad;
	}
	return rad;	
};

init_game();

