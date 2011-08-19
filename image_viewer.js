(function($) {
  $.fn.imageViewer = function(method) {
    var settings = {
      'width': 650,
      'height': 500,
      'zoomLevel': 75,
      'zoomLevel' : 75,
      'increment' : 25,
      'images' : null,
      'mainDivId' : this,
      'mainDiv' : null,
      'imageOverlay': null,
      'imageViewerImg': null,
      'imageIndex': null,
      'commandMode': false,
      'currentImageDiv': null,
      'keyBindings' : {}
    };
    var ImageList;
    var mainDiv = this;
    var overlayDiv;
    var pageIndex;

    var ImageViewer = {
      init : function(image_path_array, options){
        // set the mainDivId if passed in
        main_div_id = (settings["mainDivId"]).attr("id")
        if ( options ) { 
                $.extend( settings, options );
              }

        if (main_div_id != undefined)
          settings["mainDivId"] = main_div_id;

        ImageViewer.setupContainers();
        ImageViewer.setupKeyBindings();
        ImageViewer.setupImages(image_path_array);
        ImageViewer.setupHeight();
        ImageViewer.handleWindowResize();
      },
      reload : function(){
        image_array                 = ImageViewer.images;
        settings["zoomLevel"]       = 75;
        ImageViewer.images          = null;
        settings["mainDiv"]         = null;
        settings["imageOverlay"]    = null;
        settings["imageViewerImg"]  = null;
        settings["imageIndex"]      = null;
        settings["commandMode"]     = false;
        settings["currentImageDiv"] = null;

        ImageViewer.init(image_array);
      },
      setupContainers : function(){
        settings["mainDiv"] = $('#' + settings["mainDivId"]);
        
        settings["mainDiv"].empty();
        settings["mainDiv"].addClass('image-viewer-container');
        settings["mainDiv"].css("width", settings["width"]);

        settings["mainDiv"].append('<div id="' + settings["mainDivId"] + '-image-overlay" class="image-overlay"></div>');
        settings["imageOverlay"] = $('#' + settings["mainDivId"] + '-image-overlay');

      },
      setupImages : function(images){
        ImageViewer.images = images;
        var style = "";

        $.each(images, function(index, image){
            if(index!=0){
              style += "display: none;";
            };

            settings["mainDiv"].append('<div id="' + settings["mainDivId"] + '-image-viewer-' + index + '" ' +
                                            'class="image-viewer" ' + 
                                            'style="' + style + '">' +
                                          '<img id="' + settings["mainDivId"] + '-full-image-' + index + '" ' +
                                              'src="' + image + '" ' +
                                              'alt="Full Image" ' +
                                              'style="width: 75%;"></img>' +
                                       '</div>');

        });

        $('.image-viewer').bind('click', ImageViewer.addBookmark);


        settings["currentImageDiv"] = $('#' + settings["mainDivId"] + '-image-viewer-0');
        settings["imageViewerImg"] = $('#' + settings["mainDivId"] + '-full-image-0');
        settings["imageIndex"] = 0;
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
        shortcut.commandModeListener = function(){ImageViewer.updateOverlay();};
        shortcut.remove("\\");
        shortcut.add("\\", function(){ shortcut.toggleCommandMode(); }, {'keycode': 220, 'require_command_mode':false});
        shortcut.remove('k');
        shortcut.add('k', function(){ ImageViewer.zoom(-1 * settings["increment"]); });
        shortcut.remove('i');
        shortcut.add('i', function(){ ImageViewer.zoom(settings["increment"]); });
        shortcut.remove('e');
        shortcut.add('e', function(){ ImageViewer.scroll(0,-1 * settings["increment"]); });
        shortcut.remove('d');
        shortcut.add('d', function(){ ImageViewer.scroll(0,settings["increment"]); });
        shortcut.remove('a');
        shortcut.add('a', function(){ ImageViewer.scroll(0,-1 * (settings["increment"] * 5)); });
        shortcut.remove(';');
        shortcut.add(';', function(){ ImageViewer.scroll(0,(settings["increment"] * 5)); });
        shortcut.remove('f');
        shortcut.add('f', function(){ ImageViewer.scroll(settings["increment"],0);});
        shortcut.remove('s');
        shortcut.add('s', function(){ ImageViewer.scroll((-1 * settings["increment"]),0); });
        shortcut.remove('j');
        shortcut.add('j', function(){ ImageViewer.scrollPage(-1); });
        shortcut.remove('l');
        shortcut.add('l', function(){ ImageViewer.scrollPage(1); });
        shortcut.remove('r');
        shortcut.add('r', function(){ ImageViewer.rotate(90); });
      },
      setupHeight : function(){
        settings["mainDiv"].css('height', settings["height"]+ 'px');
        settings["mainDiv"].css('top', '0px');

        //settings["mainDiv"].scrollTo();
      },
      handleWindowResize: function(){
        $(window).bind('resize', ImageViewer.setupHeight);
      },
      zoomAbsolute : function(zoomLevel){
        previous_zoomLevel = settings["zoomLevel"];
        settings["zoomLevel"] = zoomLevel;

        object_to_zoom = $('#' + settings["mainDivId"] + '-full-image-' + settings["imageIndex"]);
        if (object_to_zoom.attr('data-angle') != undefined)
          object_to_zoom = object_to_zoom.children().first();

        object_to_zoom.css('width', settings["zoomLevel"] + '%');

        ImageViewer.updateBookmarks(previous_zoomLevel);
        ImageViewer.scroll(0,0);
      },
      zoom : function(increment){
        if(increment < 0 && settings["zoomLevel"] <= ImageViewer.increment) increment = 0;

        ImageViewer.zoomAbsolute(settings["zoomLevel"] + increment);
      },
      scroll : function(left, top){
        settings["currentImageDiv"].scrollTop(settings["currentImageDiv"].scrollTop() + top);
        settings["currentImageDiv"].scrollLeft(settings["currentImageDiv"].scrollLeft() + left);
      },
      scrollPage : function(increment){
        if(settings["imageIndex"] == 0 && increment == -1) {
          settings["imageIndex"] = (ImageViewer.images.length - 1);
        } else if(settings["imageIndex"] == (ImageViewer.images.length - 1) && increment == 1){
          settings["imageIndex"] = 0;
        } else {
          settings["imageIndex"] += increment;
        }

        ImageViewer.showPage(settings["imageIndex"]);
      },
      showPage : function(page){
        settings["imageIndex"] = page;

        settings["currentImageDiv"].hide();
        settings["currentImageDiv"] = $('#' + settings["mainDivId"] + '-image-viewer-' + page);
        settings["imageViewerImg"] = $('#' + settings["mainDivId"] + '-full-image-' + page);
        settings["currentImageDiv"].show();
      //TODO: Update attach form hidden_field here....
        ImageViewer.updateOverlay();
      },
      updateOverlay : function(){
        var s = (settings["imageIndex"] + 1) + ' / ' + ImageViewer.images.length;

        if(shortcut.commandMode)
          s += ' CM';

        settings["imageOverlay"].html(s);
      },
      toggleCommandMode : function(){
        settings["commandMode"] = (!settings["commandMode"]);
        ImageViewer.updateOverlay();
      },
      updateBookmarks: function(previous_zoom){
       $('.bookmark').each(function(index){
         b = $(this);
         calculated_position = (b.css('top').replace('px','') / (previous_zoom /100)) * (settings["zoomLevel"] / 100);
         b.css('top', calculated_position + 'px');
       });
      },
      rotate: function(increment){
          image = '#' + settings["mainDivId"] + '-full-image-' + settings["imageIndex"];
          current_angle = $(image).attr('data-angle');

          if (current_angle == undefined)
            current_angle = 0;

          $(image).css('width', '100%');
          $(image).rotate(parseInt(current_angle, 10) + increment);
          settings["imageViewerImg"] = $(image);
          settings["imageViewerImg"].attr('data-angle',(parseInt(current_angle, 10) + increment).toString());
          ImageViewer.zoomAbsolute(75);
        }
    };

    if ( ImageViewer[method] ) {
      return ImageViewer[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return ImageViewer.init.apply( this, arguments);
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
  };
})(jQuery);
