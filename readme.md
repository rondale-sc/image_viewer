# Image Viewer

This is an image viewing application demo that Pro Medical, Inc. developed to display images from an array on screen for data entry.

The current working script is 'imageviewer.js'

---
### Installation and Basic Usage ###

add to the head of your html
    
    <script src="shortcut.js" type="text/javascript" charset="utf-8"></script>
    <script src="imageviewer.js" type="text/javascript" charset="utf-8" ></script>


add to the body of your html
    
    <div id="ImageViewer"></div>


place this in your html file 
    
    <script type="text/javascript" charset="utf-8">
      $(document).ready(function() {
        ImageViewer.init(["array", "of", "images"], "ImageViewer")
      });
    </script>
  