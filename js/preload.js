/*
 *
 */
Loaded_Images = {};
var preload_images = function(image_urls, callback) {
	/*
	 * image_urls: [{alias,url}, ...]
	 */
	var loaded = 0;
	var count_urls = image_urls.length;
	for (var i = 0; i < count_urls; i++) {
		var img = new Image();
		img.alias = image_urls[i].alias;
		img.onload = function() {
			Loaded_Images[this.alias] = this;			
			if (++loaded == count_urls && callback) {
				callback();
			}
		};
		img.onerror = function() {
			console.log('error loading', img);
			count_urls--;
		};

		img.src = image_urls[i]["url"];
	}
}; 
