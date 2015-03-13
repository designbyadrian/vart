<?php

	# ABSOLUTE ROOT PATH #
	$localpath = strtolower($_SERVER['PHP_SELF']);
	$absolutepath = strtolower($_SERVER['SCRIPT_FILENAME']);
	$absolutepath = str_replace('\\', '/', $absolutepath); // fix Windows slashes
	$docroot = substr($absolutepath, 0, stripos($absolutepath, $localpath));

	$maxSize = 1000;

	$result = '';

	if($_FILES['art']['name']) {
		if(!$_FILES['art']['error']) {

			$valid_file = true;

			if($_FILES['art']['size'] > intval($_POST['MAX-FILE-SIZE'])) {
				$valid_file = false;
				$result = "-3";
			}

			if($valid_file) {

				$ext = pathinfo($_FILES['art']['name'],PATHINFO_EXTENSION);
				$destinationName = time().".".$ext;
				$inputFilename = $_FILES['art']['tmp_name'];
				$outputFile = $docroot."/uploader/data/".$destinationName;

				$size = getimagesize($inputFilename);
				$width  = isset($size['width'])  ? $size['width']  : $size[0];
        		$height = isset($size['height']) ? $size['height'] : $size[1];

        		$wRatio = $maxSize / $width;
        		$hRatio = $maxSize / $height;

				if ( ($wRatio * $height) < $maxSize ) {
					// Image is horizontal
					$tHeight = ceil($wRatio * $height);
					$tWidth  = $maxSize;
				} else {
					// Image is vertical
					$tWidth  = ceil($hRatio * $width);
					$tHeight = $maxSize;
				}

        		$sourceImage = imagecreatefromstring(file_get_contents($inputFilename));
        		$destinationImage = imagecreatetruecolor($tWidth, $tHeight);

        		imagecopyresampled($destinationImage, $sourceImage, 0, 0, 0, 0, $tWidth, $tHeight, $width, $height);
       			imagedestroy($sourceImage);

       			try {
       				$result = $destinationName;
       				switch ( $ext ) {
						case 'gif':
							imagegif($destinationImage, $outputFile);
							break;
						case 'jpg':
						case 'jpeg':
							imagejpeg($destinationImage, $outputFile, 90);
							break;
						case 'png':
							imagepng($destinationImage, $outputFile);
							break;
						case 'bmp':
							imagewbmp($destinationImage, $outputFile);
							break;
						default:
							$result = "-4";
					}
					
       			} catch(Exception $e) {
       				error_log($e->getMessage());
       				$result = "-5";
       			}

				imagedestroy($destinationImage);

			} // is valid
		} else {
			$result = "-2";
		}
	} else {
		$result = "-1";
	}

	// -1 = nothing uploaded
	// -2 = some error on upload
	// -3 = too large
	// -4 = wrong file format
	// -5 = could not save format

?>

<script language="javascript" type="text/javascript">
	window.top.window.uploadResult("<?php echo $result; ?>");
</script>   