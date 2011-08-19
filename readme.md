# Image Viewer

ImageViewer is a jQuery plugin developed in house at Pro Medical, Inc. It's purpose is to display an array of images on a page, typically
next to a form.  It has several hot keys (all activated by entering command-mode) to manipulate the image without having to leave the home 
row.  An example is available on GitHub pages [here](http://rondale-sc.github.com/image_viewer/).  

---
### Installation and Basic Usage ###

add to the head of your html
    
    <script src="shortcut.js" type="text/javascript" charset="utf-8"></script>
    <script src="image_viewer.js" type="text/javascript" charset="utf-8" ></script>
    <link rel="StyleSheet" href="stylesheets/image-viewer.css" type="text/css" media="screen">


add to the body of your html
    
    <div id="your_div"></div>


Call the plugin like so: 

    $("#your_div").imageViewer(["Array", "of", "Images"], {"your_options":"go_here"})
       
To manually call functions found in the ImageViewer methods list simply 

    $("#your_div").imageViewer("method_name", "arguments")
    
The plugin is scoped so that namespace pollution is limited significantly.  Also the internal state of the settings hash is saved to 
.data() function and will be preserved by id (ie #your_div)

### Available Shortcuts ###

In order to access these shortcuts press "/"(slash) to enable command-mode. Once you press this a "CM" will pop up in the overlay box.
These keys can be changed by modifying ImageViewer.setupKeyBindings().  However, they were chosen so that a user would not have to leave
the home row keys.


* "i" = Zoom the image in.
* "k" = Zoom the image out.
* "l" = Go to the next page.
* "j" = Go to the previous page.
* "e" = Scroll Image upward (only available if image is taller than container).
* "d" = Scroll Image downward (only available if image is taller than container).
* "s" = Scroll Image to left (only available if image is wider than container).
* "f" = Scroll Image to right (only available if image is wider than container).
 
### Contributions ###

Pro Medical, Inc. (promedical)[https://github.com/promedical] paid for development time on this small project some time back and has continued 
to support our effort to open-source it.

Robert Jackson [rjackson](https://github.com/rjackson) came up with the idea  a long while ago and 
together we wrote the initial rendition of the script which is still used on multiple production sites. 

You for reading this all the way through.  Please fork, use, and enjoy this project.  I've had a great time working on it, and I hope that
you will find it useful.