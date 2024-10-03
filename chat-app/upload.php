<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        $fileTmpPath = $file['tmp_name'];
        $fileName = basename($file['name']);
        $targetFilePath = 'uploads/' . $fileName;

        // Move the file temporarily to the 'uploads' directory
        move_uploaded_file($fileTmpPath, $targetFilePath);

        // Compress the image (you can tweak the quality and size)
        compressImage($targetFilePath, $targetFilePath, 75); // 75% quality compression

        // Output the image in base64 format
        $imageData = base64_encode(file_get_contents($targetFilePath));

        // Return the image as a base64 encoded string
        echo json_encode([
            'status' => 'success',
            'image' => 'data:image/jpeg;base64,' . $imageData
        ]);

        // Delete the image file after sending it
        unlink($targetFilePath);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File upload error']);
    }
}

// Function to compress the image
function compressImage($source, $destination, $quality) {
    $info = getimagesize($source);
    if ($info['mime'] === 'image/jpeg') {
        $image = imagecreatefromjpeg($source);
        imagejpeg($image, $destination, $quality);
    } elseif ($info['mime'] === 'image/png') {
        $image = imagecreatefrompng($source);
        imagepng($image, $destination, $quality / 10); // Quality for PNGs ranges from 0 (no compression) to 9
    }
    imagedestroy($image);
}
?>
