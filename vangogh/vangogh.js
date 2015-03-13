var bar, busy = false, btnSave, c;
	setup = function(url){

	var context = c.getContext('2d'),
		img = new Image(),
		w, h, chunkSize = 10, // multiple of 10
		worker = new Worker('worker.js');
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

			bar.addClass('active').css('width',0);
			btnSave.addClass('disabled');

			var pixels = context.getImageData(0, 0, w, h);

			worker.postMessage({
				'status': 		'start',
				'pixels': 		pixels.data,
				'chunkSize': 	chunkSize,
				'width': 		w,
				'height': 		h
			});
		};

	worker.onmessage = function(e) {

		switch(e.data.status) {
			case 'progress':
				bar.css('width',e.data.progress+"%");
				break;
			case 'done':
				bar.removeClass('active');
				context.clearRect ( 0 , 0 , c.width, c.height );
				draw(e.data.points);
				btnSave.removeClass('disabled');
				busy = false;
				worker.terminate();
				break;
		}
	}

	img.onload = start;
	img.src = url;
},
dlCanvas = function() {
	var dt = c.toDataURL('image/png');
	this.href = dt.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
},
uploadResult = function(result){
	if(parseInt(result,10)<0) {
		console.error("Got error "+result);

		switch(parseInt(result,10)) {
			case -2:
				alert("Upload problem of some sort. Please try again.");
				break;
			case -3:
				alert("Sorry, image is too large! Please upload an image under 3 MB");
				break;
			case -4:
				alert("Please upload a proper image file!");
				break;
			case -5:
				alert("Could not store image because server is dumb.");
				break;
			case -1:
			default:
				alert("Something went wrong, and I have no idea what it was.");
		}
		busy = false;

	} else {
		setup('../uploader/data/'+result);
	}
};

$(function(){

	bar = $("#bar");
	btnSave = $("#btnSave");

	c = document.getElementById('eazel');

	btnSave.click(dlCanvas);

	$("#file").on('click',function(e){
		if(busy) {
			return false;
		} else {
			busy = true;
		}
	}).change(function(){
		$("#form").submit();
	});

});