var setup = function(){

	var testURL = "img/image.jpg",
		progress = document.getElementById('bar'),
		btnSave = document.getElementById('btnSave'),
		c = document.getElementById('eazel'),
		context = c.getContext('2d'),
		img = new Image(),
		w, h, chunkSize = 10, // multiple of 10
		worker = new Worker('worker.js'),
		draw = function(points){

			for(var i = 0, ii = points.length; i < ii; i++) {
				var point = points[i],
					color = 'rgb('+point.color.r+','+point.color.g+','+point.color.b+')',
					x1 = Math.random() * ((point.x + 2) - (point.x - 2)) + point.x - 2,
					y1 = Math.random() * ((point.y + 2) - (point.y - 2)) + point.y - 2,
					x2 = Math.random() * (-6 - -1) + -1,
					y2 = Math.random() * (7 - 3) + 3;

				context.beginPath();
				context.moveTo(x1, y1);
				context.lineWidth = 8;
				context.strokeStyle = color;
				context.lineCap = 'round';
				context.lineTo(x1+x2, y1+y2);
				context.stroke();

			}

		},
		start = function(){
			c.width = w = img.width;
			c.height = h = img.height;
			context.drawImage(this, 0, 0);

			console.info("Starting");

			var pixels = context.getImageData(0, 0, w, h);

			worker.postMessage('{
				'status': 		'start',
				'pixels': 		pixels.data,
				'chunkSize': 	chunkSize,
				'width': 		w,
				'height': 		h
			}');
		},
		dlCanvas = function() {
			var dt = c.toDataURL('image/png');
			this.href = dt.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			console.log("dl!",this.href);
		};

	worker.onmessage = function(e) {

		switch(e.data.status) {
			case 'progress':
				progress.setAttribute('style','width:'+e.data.progress+"%");
				break;
			case 'done':
				console.info("Done! :D",e.data);
				context.clearRect ( 0 , 0 , c.width, c.height );
				draw(e.data.points);
				btnSave.className = btnSave.className.replace(/\bdisabled\b/,'');
				break;
		}

		
	}

	btnSave.addEventListener('click', dlCanvas, false);

	img.onload = start;
	img.src = testURL;
};