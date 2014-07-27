BORDER_WIDTH = 25;

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

function distance_points(point1, point2) {
	var distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
	return Math.floor(distance);
}


Game = function(gameview_id, foreground_id, background_id) {
	this.game_view = $(gameview_id);
	this.foreground = $(foreground_id);
	this.background = $(background_id);
	this.fg_canvas = this.foreground[0];
	this.fg_context = this.foreground[0].getContext('2d');
	this.bg_canvas = this.background[0];
	this.bg_context = this.background[0].getContext('2d'); 
	
	this.is_dragging = false;
	this.dragging_points = [];
	this.moving_points = [];
	this.last_time = Date.now();
	this.character = null;
	this.entities = [];
};

Game.prototype.init_game = function () {
	var _this = this;
	preload_images(
		[
			{alias:'stone', url:'res/images/stonetile.png'},
			{alias:'rock', url:'res/images/rocktile.png'},
			{alias:'dirt', url:'res/images/dirttile.png'},
			{alias:'car', url:'res/images/car.png'}
		],
		function() {
			//tile_iso_background();
			_this.tile_topdown_background();
			_this.init_game_view();
			_this.main_game();
			_this.draw_character();
		});	
};

Game.prototype.init_game_view = function () {
	var game_view_width = this.game_view.width();
	var game_view_height = this.game_view.height();
	var canvas_width = this.background.width();
	var canvas_height = this.background.height();
	var _this = this;
	this.background.css({
		left:(game_view_width - canvas_width) / 2+'px', 
		top: (game_view_height - canvas_height)/2 + 'px'});	
	this.game_view.on('mousemove',function(event){
		//event.preventDefault();
		var x = event.pageX - this.offsetLeft - BORDER_WIDTH;
		var y = event.pageY - this.offsetTop - BORDER_WIDTH;
		var mouse_pos = {x: x, y: y};
		if (_this.is_dragging) {
			_this.dragging_points.push(mouse_pos);
		}		
	});
	this.game_view.on('touchmove',function(event){
		event.preventDefault();
		var touches = event.originalEvent.changedTouches;
		var touch = touches[0];
		var x = touch.pageX - this.offsetLeft - BORDER_WIDTH;
		var y = touch.pageY - this.offsetTop - BORDER_WIDTH;
		var mouse_pos = {x: x, y: y};
		if (_this.is_dragging) {
			_this.dragging_points.push(mouse_pos);
		}
	});
	this.game_view.on('click', function(event) {		
		if (_this.dragging_points.length > 0) {
			return;
		}
		var x = event.pageX - this.offsetLeft - BORDER_WIDTH;
		var y = event.pageY - this.offsetTop - BORDER_WIDTH;
		//console.log(x, y);
		var canvas_point = {
				x: x - _this.background.position().left, 
				y: y - _this.background.position().top
		};
		_this.moving_points.push(canvas_point);		
	});
	
	this.foreground.on('mousedown touchstart', function(event) {
		//console.log('foreground');
		_this.is_dragging = true;
	});
	this.foreground.on('mouseup touchend', function(event) {
		//console.log('touchend');
		_this.is_dragging = false;
		for (var i = 0; i < _this.dragging_points.length; i++) {
			var point = _this.dragging_points[i];
			var canvas_point = {
				x: point.x - _this.background.position().left, 
				y: point.y - _this.background.position().top
			};
			_this.moving_points.push(canvas_point);
		}
		_this.clear_stroke();				
	});
};

Game.prototype.tile_topdown_background = function() {
	var tile_width = 96;
	var tile_height = 96;
	var width_count = 10;
	var height_count = 10;
	this.bg_canvas.width = tile_width * width_count;
	this.bg_canvas.height = tile_height * height_count;
	this.fg_canvas.width = this.game_view.width();
	this.fg_canvas.height = this.game_view.height();
	
	this.bg_context.fillRect(0, 0, this.bg_canvas.width, this.bg_canvas.height); 
	for (var x = 0; x < width_count; x++) {
		for (var y = 0; y < height_count; y++) {
			var pos = {x: x * tile_width, y: y * tile_height};
			if (x == 0 || y == 0 || x == width_count-1 || y == height_count-1) {
				this.bg_context.drawImage(Loaded_Images['rock'], pos.x, pos.y);
			}
			else {
				var r = Math.random();
				if (r > 0.5) {
					this.bg_context.drawImage(Loaded_Images['dirt'], pos.x, pos.y);
				}
				else {
					this.bg_context.drawImage(Loaded_Images['stone'], pos.x, pos.y);
				}
			}
		}
	}
};

Game.prototype.clear_stroke = function () {
	var _this = this;		
	if (this.dragging_points.length > 0) {
		var p = this.dragging_points.shift();		
		requestAnimationFrame(function() {
			_this.clear_stroke();
			}
		);
	}
};

Game.prototype.draw_path = function () {
	if (this.dragging_points.length == 0) {
		return;
	}
	this.fg_context.beginPath();
	this.fg_context.strokeStyle='#FF0000';
	this.fg_context.lineCap = "round";
	this.fg_context.lineWidth=15;
	for (var i = 0; i < this.dragging_points.length-1; i++) {
		var point = this.dragging_points[i];
		this.fg_context.moveTo(point.x, point.y);
		var point2 = this.dragging_points[i+1];
		this.fg_context.lineTo(point2.x, point2.y);
	}
	this.fg_context.stroke();
};

Game.prototype.main_game = function () {
    var now = Date.now();
    var dt = (now - this.last_time) / 1000.0;

    this.update_game(dt);    
    //render();

    this.last_time = now;
    var _this = this;
    requestAnimationFrame(function() {
    	_this.main_game();
    });
};

Game.prototype.update_game = function (dt) {
	this.fg_context.clearRect(0, 0 , this.fg_canvas.width, this.fg_canvas.height);		
	this.draw_path();
	for (var i = 0; i < this.entities.length; i++) {
		this.entities[i].update(dt);
	}
	if (this.moving_points.length > 0) {
		var res = this.move_character(dt, this.moving_points[0]);	
		if (res) {
			var p = this.moving_points.shift();			
		}	
		//move_character(dt, CHARACTER.position, MOVING_POINTS[0]);
	}
	else {
		if (this.character) {
			this.character.velocity = 100;
		}
	}
};

Game.prototype.draw_character = function () {	
	var x = this.foreground.width() / 2;
	var y = this.foreground.height() / 2;
	//s = new Sprite(fg_context, Loaded_Images['dragoon'], x, y, 72, 72, 6, 5);
	s = new Sprite(this.fg_context, Loaded_Images['car'], x, y, 127, 63, 1, 1);
	this.character = s;
	this.character.velocity = 100;
	this.character.min_velocity = 100;
	this.character.max_velocity = 500;
	this.character.acceleration = 100;

	this.entities.push(s);	
};

Game.prototype.move_character = function (dt, point) {
	var pos = this.background.position();
	//console.log(pos);
	var character_pos = {x: this.character.position.x - pos.left, y: this.character.position.y - pos.top};
	var distance = distance_points(character_pos, point);
	if (distance <= 0.01) {
		//CHARACTER.position = point;
		this.moving_points.shift();
		return true;
	}		
	var angle = calculate_angle(character_pos, point);
	this.character.angle = angle;
	var velocity = this.character.velocity;
	var min_velocity = this.character.min_velocity;
	var max_velocity = this.character.max_velocity;
	var acceleration = this.character.acceleration;
	
	if (this.moving_points.length == 1 && distance <= 100) {
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
	var new_left = pos.left - dx;
	var new_top = pos.top - dy;
	var x = character_pos.x + dx;
	var y = character_pos.y + dy;
	//console.log(x, y);
	if (x >= this.foreground.width()/2 && x <= this.background.width() - this.foreground.width()/2
		&& new_left <= 0 && new_left>= this.foreground.width() - this.background.width()) {
		this.background.css({left: new_left});	
	}
	else {
		this.character.position.x += dx;
	}
	
	if (y >= this.foreground.height()/2 && y <= this.background.height() - this.foreground.height()/2 
		&& new_top <=0 && new_top >= this.foreground.height() - this.background.height()) {
		this.background.css({top: new_top});	
	}	
	else {
		this.character.position.y += dy;
	}
	this.character.velocity = velocity;
	return false;	
};


var game = new Game('#gameview', '#foreground', '#background');
game.init_game();
