(function($) {
  $.fn.imageViewer = function(method) {
    var settings = {
      'mainDiv': '#ImageViewer',
      'overlayDiv': '#overlay',
      'background-color': '#777',
      'width': 500,
      'height': 500,
      'zoomLevel': 75,
      'increment': 25
    };
    var ImageList;
    var mainDiv;
    var overlayDiv;
    var pageIndex;

    var methods = {
      init : function( imageList, options ) {
        if (options) {
          $.extend(settings, options);
        }
        ImageList = imageList;
        methods['setupContainers'].call(this);
        methods.setupInitialImage(imageList[0]);
        methods.setupKeyBindings();
      },
      updateOverlay : function() {
        var cmSpan       = "<span id='overlayText'> CM</span>";
        var pageInfoSpan = "<span id='overlayText'>" + (pageIndex + 1) + " / " + ImageList.length + "</span>";
        if (shortcut.commandMode) 
          pageInfoSpan += cmSpan
        $(overlayDiv).html(pageInfoSpan); 
      },
      setupKeyBindings : function() {
        shortcut.commandModeListener = function(){methods.updateOverlay();};
        shortcut.remove("\\");
        shortcut.add("\\", function(){ shortcut.toggleCommandMode(); }, {'keycode': 220, 'require_command_mode':false});
      },
      setupInitialImage : function( image ) {
          $(mainDiv).append('<img class="image_viewer_img" src="' + image + '"/>');
          pageIndex = 0;
      },
      setupContainers : function(){
        mainDiv = settings['mainDiv'];
        overlayDiv = settings['overlayDiv'];
        
        this.css('width', settings['width']);
        this.css('height', settings['height']);
        this.css('margin', 'auto');
        this.css('background-color', settings['background-color']);
        this.append('<div id="overlay"></div>')
      }
    };

    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments);
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
    }
  };
})(jQuery);
