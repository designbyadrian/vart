

var image, w,h, chunkSize,
	/* 	http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938 */
	createArray = function(length) {
		var arr = new Array(length || 0),
		i = length;

		if (arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments, 1);
			while(i--) arr[length-1 - i] = createArray.apply(this, args);
		}

		return arr;
	},
	/* 	Half stolen from https://gist.github.com/fuzzyfox/5844826
			Turns out to be the wrong way to determine the common color in a square, according to
			http://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
			which is true, since the result are less than satisfactory */
	getAverageColor = function(x,y) {
		var data = context.getImageData(x, y, chunkSize, chunkSize),
			len = data.data.length, rgb = {r: 0,g: 0,b: 0}, i = 0, count = 0;

			while((i += chunkSize / 10) < len){
				++count;
				rgb.r += data.data[i];
				rgb.g += data.data[i+1];
				rgb.b += data.data[i+2];
			}

			rgb.r = ~~(rgb.r/count);
			rgb.g = ~~(rgb.g/count);
			rgb.b = ~~(rgb.b/count);

		return rgb;
	},
	/* 	From PHP example: https://gist.github.com/boazsender/cf23f8bddb307ad4abd8 */
	getDominantColor = function(x0,y0){
		var distances = {}, rgb, sortedDistances;

		for(var y = y0, yy1 = Math.min(y0+chunkSize,h); y < yy1; y = y+chunkSize/10) {
			for(var x = x0, xx1 = Math.min(x0+chunkSize,w); x < xx1; x = x+chunkSize/10) {

				var rgb1 = image[x][y],
					colorKey = rgb1.r+","+rgb1.g+","+rgb1.b,
					computedDists = 0;

				for(var y2 = y0, yy2 = Math.min(y0+chunkSize,h); y2 < yy2; y2 = y2+chunkSize/10) {
					for(var x2 = x0, xx2 = Math.min(x0+chunkSize,w); x2 < xx2; x2 = x2+chunkSize/10) {

						var rgb2 = image[x2][y2];
						computedDists = computedDists + (  Math.sqrt( Math.pow(rgb2.r - rgb1.r,2) + Math.pow(rgb2.g - rgb1.g,2) + Math.pow(rgb2.b - rgb1.b,2) )  );

					}
				}

				distances[colorKey] = computedDists;

			}
		}
		
		sortedDistances = Object.keys(distances).sort(function(a,b){return distances[b]-distances[a]})
		rgb = sortedDistances[0].split(",");

		return {r:rgb[0],g:rgb[1],b:rgb[2]};
	},
	start = function(data){

		var x = 0, y = 0,
			chunks = 0, chunksTotal = 0,
			points = [];

		chunkSize = data.chunkSize;

		w = data.width;
		h = data.height;

		image = createArray(w,h);

		for(var i = 0, ii = data.pixels.length; i < ii; i = i + 4) {
			image[x][y] = {r:data.pixels[i],g:data.pixels[i+1],b:data.pixels[i+2]};

			if(++x >= w) {
				x = 0;
				if(++y >= h) {
					y = 0;
				}
			}
		}

		for(y = 0; y <= h; y = y+chunkSize) {
			for(x = 0; x <= w; x = x+chunkSize) {
				chunksTotal++;
			}
		}

		var broken = true;

		for(y = 0; y < h; y = y+chunkSize) {
			for(x = 0; x < w; x = x+chunkSize) {
				points.push({x:x,y:y,color:getDominantColor(x,y)});
				postMessage({status:'progress',progress:Math.ceil(((++chunks)/chunksTotal)*100)});
				if(chunks/chunksTotal>=1) {
					broken = false;
					postMessage({status:'done',points:points});
				}
			}
		}

		if(broken) {
			postMessage({status:'progress',progress:100});
			postMessage({status:'done',points:points});
		}

	},
	onmessage = function(e){
	
	switch(e.data.status) {
		case 'start':
			start(e.data);
			break;
	}
};