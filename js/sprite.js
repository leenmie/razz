var Sprite = function(ctx, image, pos_x, pos_y, width, height, n_frame, speed) {
	this.image = image;
	this.position = {x: pos_x, y: pos_y};
	this.width = width;
	this.height = height;
	this.n_frame = n_frame;
	this.speed = speed;
	this.context = ctx;
	this._index = 0;
	this._stop_animation = false;
	this.pivot = {x: width/2, y: height/2};
	this.angle = 0;
	this.center = {x: this.position.x + this.pivot.x, y: this.position.y + this.pivot.y};
};

Sprite.prototype.update = function(dt) {
	this._index += this.speed * dt;
	this.draw();
};

Sprite.prototype.draw = function() {
	//ctx.drawImage
	//var x = this.position.x - this.pivot.x;
	//var y = this.position.y - this.pivot.y;
	var idx = Math.floor(this._index) % this.n_frame;
	var i_x = this.width * idx;	 
	var ctx = this.context;
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	if (this.angle != 0) {
		ctx.rotate(this.angle);
	}
	//ctx.fillRect()
	ctx.drawImage(this.image, i_x, 0, this.width, this.height, -this.pivot.x, -this.pivot.y, this.width, this.height);	
	ctx.restore();
};
