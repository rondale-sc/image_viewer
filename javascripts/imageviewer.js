var ImageViewer = {
  zoomLevel : 75,
  increment : 25,
  images : null,
  mainDivId : null,
  mainDiv : null,
  imageOverlay: null,
  imageViewerImg: null,
  imageIndex: null,
  commandMode: false,
  currentImageDiv: null,
  key_bindings : {},
  init : function(image_path_array, main_div_id){
    // set the mainDivId if passed in
    if (main_div_id != undefined)
      ImageViewer.mainDivId = main_div_id;
    else
      ImageViewer.mainDivId  = 'ImageViewer';

    ImageViewer.setupContainers();
    ImageViewer.setupKeyBindings();
    ImageViewer.setupImages(image_path_array);
    ImageViewer.setupHeight();
    ImageViewer.handleWindowResize();
  },
  reload : function(){
    image_array                 = ImageViewer.images;
    ImageViewer.zoomLevel       = 75;
    ImageViewer.images          = null;
    ImageViewer.mainDiv         = null;
    ImageViewer.imageOverlay    = null;
    ImageViewer.imageViewerImg  = null;
    ImageViewer.imageIndex      = null;
    ImageViewer.commandMode     = false;
    ImageViewer.currentImageDiv = null;

    ImageViewer.init(image_array);
  },
  setupContainers : function(){
    ImageViewer.mainDiv = $('#' + ImageViewer.mainDivId);
    ImageViewer.mainDiv.empty();
    ImageViewer.mainDiv.addClass('image-viewer-container');

    ImageViewer.mainDiv.append('<div id="' + ImageViewer.mainDivId + '-image-overlay" class="image-overlay"></div>');
    ImageViewer.imageOverlay = $('#' + ImageViewer.mainDivId + '-image-overlay');

  },
  setupImages : function(images){
    ImageViewer.images = images;
    var style = "";

    $.each(images, function(index, image){
        if(index!=0){
          style += "display: none;";
        };

        ImageViewer.mainDiv.append('<div id="' + ImageViewer.mainDivId + '-image-viewer-' + index + '" ' +
                                        'class="image-viewer" ' + 
                                        'style="' + style + '">' +
                                      '<img id="' + ImageViewer.mainDivId + '-full-image-' + index + '" ' +
                                          'src="' + image + '" ' +
                                          'alt="Full Image" ' +
                                          'style="width: 75%;"></img>' +
                                   '</div>');

    });

    $('.image-viewer').bind('click', ImageViewer.addBookmark);


    ImageViewer.currentImageDiv = $('#' + ImageViewer.mainDivId + '-image-viewer-0');
    ImageViewer.imageViewerImg = $('#' + ImageViewer.mainDivId + '-full-image-0');
    ImageViewer.imageIndex = 0;
    ImageViewer.updateOverlay();
  },
	delayedRedirect : function(){
	    window.location = "/";
	},
	teardownKeyBindings : function(){
	  shortcut.remove("\\");
	  shortcut.remove("k");
	  shortcut.remove('i');
	  shortcut.remove('e');
	  shortcut.remove('d');
	  shortcut.remove('a');
	  shortcut.remove(';');
	  shortcut.remove('f');
	  shortcut.remove('s');
	  shortcut.remove('j');
	  shortcut.remove('l');
	},
  setupKeyBindings : function(){
    //shortcut.add('Ctrl+C', function(){ alert('test fired'); });

    shortcut.commandModeListener = function(){ImageViewer.updateOverlay();};

    // 124 == | (toggle command mode)
    shortcut.remove("\\");
    shortcut.add("\\", function(){ shortcut.toggleCommandMode(); }, {'keycode': 220, 'require_command_mode':false});

    // 107 == k (zoom out)
    shortcut.remove('k');
    shortcut.add('k', function(){ ImageViewer.zoom(-1 * ImageViewer.increment); });
//    shortcut.add('k', function(){ ImageViewer.zoom(-1 * ImageViewer.increment); }, {'type':'keypress'});
    
    // 105 == i (zoom in)
    shortcut.remove('i');
    shortcut.add('i', function(){ ImageViewer.zoom(ImageViewer.increment); });
//    shortcut.add('i', function(){ ImageViewer.zoom(ImageViewer.increment); }, {'type':'keypress'});

    // 101 == e (scroll up)
    shortcut.remove('e');
    shortcut.add('e', function(){ ImageViewer.scroll(0,-1 * ImageViewer.increment); });
//    shortcut.add('e', function(){ ImageViewer.scroll(0,-1 * ImageViewer.increment); }, {'type':'keypress'});

    // 100 == d (scroll down)
    shortcut.remove('d');
    shortcut.add('d', function(){ ImageViewer.scroll(0,ImageViewer.increment); });
//    shortcut.add('d', function(){ ImageViewer.scroll(0,ImageViewer.increment); }, {'type':'keypress'});

    // 97 == a (page up)
    shortcut.remove('a');
    shortcut.add('a', function(){ ImageViewer.scroll(0,-1 * (ImageViewer.increment * 5)); });
//    shortcut.add('a', function(){ ImageViewer.scroll(0,-1 * (ImageViewer.increment * 5)); }, {'type':'keypress'});

    // 59 == ; (page down)
    shortcut.remove(';');
    shortcut.add(';', function(){ ImageViewer.scroll(0,(ImageViewer.increment * 5)); });
//    shortcut.add(';', function(){ ImageViewer.scroll(0,(ImageViewer.increment * 5)); }, {'type':'keypress'});

    // 102 == f (scroll right)
    shortcut.remove('f');
    shortcut.add('f', function(){ ImageViewer.scroll(ImageViewer.increment,0);});
//    shortcut.add('f', function(){ ImageViewer.scroll(ImageViewer.increment,0);}, {'type':'keypress'});

    // 115 == s (scroll left)
    shortcut.remove('s');
    shortcut.add('s', function(){ ImageViewer.scroll((-1 * ImageViewer.increment),0); });
//    shortcut.add('s', function(){ ImageViewer.scroll((-1 * ImageViewer.increment),0); }, {'type':'keypress'});

    // 106 == j (previous page)
    shortcut.remove('j');
    shortcut.add('j', function(){ ImageViewer.scrollPage(-1); });
//    shortcut.add('j', function(){ ImageViewer.scrollPage(-1); }, {'type':'keypress'});

    // 108 == l (previous page)
    shortcut.remove('l');
    shortcut.add('l', function(){ ImageViewer.scrollPage(1); });
//    shortcut.add('l', function(){ ImageViewer.scrollPage(1); }, {'type':'keypress'});
    
    shortcut.remove('r');
    shortcut.add('r', function(){ ImageViewer.rotate(90); });

  },
  setupHeight : function(){
    var window_height = $(window).height();
    var menu = $('#header');
    var footer = $('#footer');
    var footer_height = 0;
    var menu_offset = menu.offset().top + menu.height() + 5;

    if(footer){
      footer_height = footer.height() + 5;
    }

    var new_height = window_height - menu_offset - footer_height - 20;
    
    ImageViewer.mainDiv.css('height', new_height + 'px');
    ImageViewer.mainDiv.css('top', '0px');

    //ImageViewer.mainDiv.scrollTo();
  },
  handleWindowResize: function(){
    $(window).bind('resize', ImageViewer.setupHeight);
  },
  zoomAbsolute : function(zoomLevel){
    previous_zoomLevel = ImageViewer.zoomLevel;
    ImageViewer.zoomLevel = zoomLevel;

    object_to_zoom = $('#' + ImageViewer.mainDivId + '-full-image-' + ImageViewer.imageIndex);
    if (object_to_zoom.attr('data-angle') != undefined)
      object_to_zoom = object_to_zoom.children().first();

    object_to_zoom.css('width', ImageViewer.zoomLevel + '%');
    
    ImageViewer.updateBookmarks(previous_zoomLevel);
    ImageViewer.scroll(0,0);
  },
  zoom : function(increment){
    if(increment < 0 && ImageViewer.zoomLevel <= ImageViewer.increment) increment = 0;
    
    ImageViewer.zoomAbsolute(ImageViewer.zoomLevel + increment);
  },
  scroll : function(left, top){
    ImageViewer.currentImageDiv.scrollTop(ImageViewer.currentImageDiv.scrollTop() + top);
    ImageViewer.currentImageDiv.scrollLeft(ImageViewer.currentImageDiv.scrollLeft() + left);
  },
  scrollPage : function(increment){
    if(ImageViewer.imageIndex == 0 && increment == -1) {
      ImageViewer.imageIndex = (ImageViewer.images.length - 1);
    } else if(ImageViewer.imageIndex == (ImageViewer.images.length - 1) && increment == 1){
      ImageViewer.imageIndex = 0;
    } else {
      ImageViewer.imageIndex += increment;
    }

    ImageViewer.showPage(ImageViewer.imageIndex);
  },
  showPage : function(page){
    ImageViewer.imageIndex = page;
   
    ImageViewer.currentImageDiv.hide();
    ImageViewer.currentImageDiv = $('#' + ImageViewer.mainDivId + '-image-viewer-' + page);
    ImageViewer.imageViewerImg = $('#' + ImageViewer.mainDivId + '-full-image-' + page);
    ImageViewer.currentImageDiv.show();
		//TODO: Update attach form hidden_field here....
    ImageViewer.updateOverlay();
  },
  updateOverlay : function(){
    var s = (ImageViewer.imageIndex + 1) + ' / ' + ImageViewer.images.length;

    if(shortcut.commandMode)
      s += ' CM';

    ImageViewer.imageOverlay.html(s);
  },
  toggleCommandMode : function(){
    ImageViewer.commandMode = (!ImageViewer.commandMode);
    ImageViewer.updateOverlay();
  },
  updateBookmarks: function(previous_zoom){
	  $('.bookmark').each(function(index){
	    b = $(this);
      calculated_position = (b.css('top').replace('px','') / (previous_zoom /100)) * (ImageViewer.zoomLevel / 100);
	    b.css('top', calculated_position + 'px');
    });
  },
  rotate: function(increment){
      image = '#' + ImageViewer.mainDivId + '-full-image-' + ImageViewer.imageIndex;
      current_angle = $(image).attr('data-angle');
      
      if (current_angle == undefined)
        current_angle = 0;
  
      $(image).css('width', '100%');
      $(image).rotate(parseInt(current_angle, 10) + increment);
      ImageViewer.imageViewerImg = $(image);
      ImageViewer.imageViewerImg.attr('data-angle',(parseInt(current_angle, 10) + increment).toString());
      ImageViewer.zoomAbsolute(75);
    }

/* ,
  addBookmark : function(event){
  	image = ImageViewer.currentImageDiv;

    var pos_y = event.pageY - image.offset().top;

    image.append('<div class="bookmark"><a style="color:#9d3636;font-size:24px;">&rarr;</a></div>');

    var arrow = $('.bookmark').last();
    arrow.css({
        'display'   : 'block',
        'top'       : pos_y  + "px",
        'position'  : 'absolute',
        'left'      : '-1%' });

    arrow.bind('click', ImageViewer.removeBookmark, false);
  }, 
  removeBookmark : function(e){
      $(this).remove();

			return false;
	}
*/
};
