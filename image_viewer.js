(function($) {
  $.fn.imageViewer = function(method) {
    var settings = {
      'overlayDiv': '#overlay',
      'background-color': '#777',
      'width': 500,
      'height': 500,
      'zoomLevel': 75,
      'increment': 25
    };
    var ImageList;
    var mainDiv = this;
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
          pageInfoSpan += cmSpan;
        $(overlayDiv).html(pageInfoSpan); 
      },
      setupKeyBindings : function() {
        shortcut.commandModeListener = function(){methods.updateOverlay();};
        shortcut.remove("\\");
        shortcut.add("\\", function(){ shortcut.toggleCommandMode(); }, {'keycode': 220, 'require_command_mode':false});

        shortcut.remove("l");
        shortcut.add("l", function() { methods.changePage("Right"); });

        shortcut.remove("j");
        shortcut.add("j", function() { methods.changePage("Left"); });
      },
      changePage : function( direction ) {
        if (direction == "Right") {
          if (pageIndex != ImageList.length - 1) {
            var list_position = pageIndex + 1
            pageIndex += 1

            $('#ImageViewer img').remove();
            $(mainDiv).append('<img class="image_viewer_img" src="' + ImageList[list_position] + '"/>');
            methods.updateOverlay();
          };
        } else if (direction == "Left") {

          if (!pageIndex == 0) {
            var list_position = pageIndex - 1
            pageIndex = pageIndex - 1

            $('#ImageViewer img').remove();
            $(mainDiv).append('<img class="image_viewer_img" src="' + ImageList[list_position] + '"/>');
            methods.updateOverlay();
          };
        };
      },
      setupInitialImage : function( image ) {
          $(mainDiv).append('<img class="image_viewer_img" src="' + image + '"/>');
          pageIndex = 0;
      },
      setupContainers : function(){
        overlayDiv = settings['overlayDiv'];
        this.append('<div id="overlay"></div>');

        this.css('width', settings['width']);
        this.css('height', settings['height']);
        this.css('margin', 'auto');
        this.css('background-color', settings['background-color']);

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
