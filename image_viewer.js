(function($) {
  $.fn.imageViewer = function(method) {
    var settings = {
      'height': '550',
      'nav_links':true,
      'zoomLevel': 75,
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
    var self = $.fn.imageViewer;

    $.fn.imageViewer.scrollPage = function(increment){
      if(settings["imageIndex"] == 0 && increment == -1) {
        settings["imageIndex"] = (settings["images"].length - 1);
      } else if(settings["imageIndex"] == (settings["images"].length - 1) && increment == 1){
        settings["imageIndex"] = 0;
      } else {
        settings["imageIndex"] += increment;
      };
      ImageViewer.showPage(settings["imageIndex"]);
    };

    $.fn.imageViewer.scroll =  function(left, top){
      settings["currentImageDiv"].scrollTop(settings["currentImageDiv"].scrollTop() + top);
      settings["currentImageDiv"].scrollLeft(settings["currentImageDiv"].scrollLeft() + left);
    };

    $.fn.imageViewer.zoom = function(increment){
      if(increment < 0 && settings["zoomLevel"] <= settings["increment"]) increment = 0;
      ImageViewer.zoomAbsolute(settings["zoomLevel"] + increment);
    };

    $.fn.imageViewer.rotate = function(increment){
        image = '#' + settings["mainDivId"] + '-full-image-' + settings["imageIndex"];
        current_angle = $(image).attr('angle');

        if (current_angle == undefined) {
          current_angle = 0;
        };

        $(image).css('width', '100%');
        $(image).rotate(parseInt(current_angle, 10) + increment);
        settings["imageViewerImg"] = $(image);

        settings["imageViewerImg"].attr('angle',(parseInt(current_angle, 10) + increment).toString());
        ImageViewer.zoomAbsolute(75);
      };

      $.fn.imageViewer.print = function() {
        var myWindow = window.open("", '_newtab');
        var image_tags = "";

        $.each(settings["images"], function(index, image) {
          image_tags += '<img style="float:left;clear:both;" src="' + image + '" />';
        });

        var print_script = '<script type=\'text/javascript\'>' +
                            'function PrintWindow() { window.print();CheckWindowState(); }' +
                              'function CheckWindowState(){' +
                              'if(document.readyState=="complete")' +
                                '{window.close();}' +
                              'else{setTimeout("CheckWindowState()", 2000)}}' +
                                'PrintWindow();' + 
                            '</script>';

        myWindow.document.write(image_tags + print_script);
        myWindow.document.close();
      };

    var ImageViewer = {
      init : function(image_path_array, options){
        main_div_id = (settings["mainDivId"]).attr("id");
        if ( options ) { 
          $.extend( settings, options );
        };

        this.data("settings", settings);

        if (main_div_id != undefined) {
          settings["mainDivId"] = main_div_id;
        };

        ImageViewer.setupContainers();
        ImageViewer.setupKeyBindings();
        ImageViewer.setupImages(image_path_array);
        ImageViewer.setupHeight();
        if (settings['nav_links'] == true) {ImageViewer.createNavTable();};
        ImageViewer.handleWindowResize();
      },
      reload : function(){
        image_array                 = settings["images"];
        settings["zoomLevel"]       = 75;
        settings["images"]          = null;
        settings["mainDiv"]         = null;
        settings["imageOverlay"]    = null;
        settings["imageViewerImg"]  = null;
        settings["imageIndex"]      = null;
        settings["commandMode"]     = false;
        settings["currentImageDiv"] = null;

        ImageViewer.init(image_array);
      },
      createNavTable : function () {
        console.log(ImageViewer.createNavLink('scroll(-1 * ' + settings["increment"], 'left'))
        table = '<table class="nav_links">' + 
                    '<tr>' +
                      '<td>' + ImageViewer.createNavLink('scrollPage(-1)', 'previous') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('scrollPage(1)', 'next') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('scroll(-1 * ' + settings["increment"] + ",0)", 'left') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('scroll(' + settings["increment"] + ",0)", 'right') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('scroll(0, -1 * ' + settings["increment"] + ")", 'up') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('scroll(0,' + settings["increment"] + ")", 'down') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('zoom(' + settings["increment"] + ")", 'zoom in') + '</td>' + 
                      '<td>' + ImageViewer.createNavLink('zoom(-1 * ' + settings["increment"] + ")", 'zoom out') + '</td>' +
                      '<td>' + ImageViewer.createNavLink('rotate(90)', 'rotate') + '</td>' +  
                      '<td>' + ImageViewer.createNavLink('print()', 'print') + '</td>' +  
                    '</tr>' +
                '</table>';

        settings["mainDiv"].prepend(table);
      },
      createNavLink : function( call, name ) {
        var div_id = '#' + settings["mainDivId"];

        return '<a href="#" onclick="' +
                 '$(\'' + div_id + '\')' +
                 '.imageViewer.' +  call + '">' + 
                 name +
               '</a>';
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
        settings["images"] = images;
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
                                              'style="width: 75%;"/>' +
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
        shortcut.add('k', function(){ self.zoom(-1 * settings["increment"]); });
        shortcut.remove('i');
        shortcut.add('i', function(){ self.zoom(settings["increment"]); });
        shortcut.remove('e');
        shortcut.add('e', function(){ self.scroll(0,-1 * settings["increment"]); });
        shortcut.remove('d');
        shortcut.add('d', function(){ self.scroll(0,settings["increment"]); });
        shortcut.remove('a');
        shortcut.add('a', function(){ self.scroll(0,-1 * (settings["increment"] * 5)); });
        shortcut.remove(';');
        shortcut.add(';', function(){ self.scroll(0,(settings["increment"] * 5)); });
        shortcut.remove('f');
        shortcut.add('f', function(){ self.scroll(settings["increment"],0);});
        shortcut.remove('s');
        shortcut.add('s', function(){ self.scroll((-1 * settings["increment"]),0); });
        shortcut.remove('j');
        shortcut.add('j', function(){ self.scrollPage(-1); });
        shortcut.remove('l');
        shortcut.add('l', function(){ self.scrollPage(1); });
        shortcut.remove('r');
        shortcut.add('r', function(){ self.rotate(90); });
      },
      setupHeight : function(){
          var window_height = $(window).height();
          var menu = $('#header');
          var footer = $('#footer');
          var footer_height = 0;
          
          if (menu.length >= 1) {
            var menu_offset = menu.offset().top + menu.height() + 7;
          } else {
            var menu_offset = 0;
          }

          if(footer.length >= 1){
            var footer_height = footer.height() + 7;
          } else {
            var footer_height = 0;
          }
          var new_height = window_height - menu_offset - footer_height - 20;

          settings["mainDiv"].css('height', new_height + 'px');
          settings["mainDiv"].css('top', '0px');
      },
      handleWindowResize: function(){
        $(window).bind('resize', ImageViewer.setupHeight);
      },
      zoomAbsolute : function(zoomLevel){
        previous_zoomLevel = settings["zoomLevel"];
        settings["zoomLevel"] = zoomLevel;

        object_to_zoom = $('#' + settings["mainDivId"] + '-full-image-' + settings["imageIndex"]);

        object_to_zoom.css('width', settings["zoomLevel"] + '%');
        self.scroll(0,0);
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
        var s = (settings["imageIndex"] + 1) + ' / ' + settings["images"].length;

        if(shortcut.commandMode) {
          s += ' CM';
        };

        settings["imageOverlay"].html(s);
      },
      toggleCommandMode : function(){
        settings["commandMode"] = (!settings["commandMode"]);
        ImageViewer.updateOverlay();
      }
    };

    if ( ImageViewer[method] ) {
      var settings = this.data("settings");
      return ImageViewer[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }  else if ( settings[method] ) {
      var settings = this.data("settings");
      return settings[ method ];
    } else if ( typeof method === 'object' || ! method ) {
      return ImageViewer.init.apply( this, arguments);
    }  else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.imageViewer' );
    };
  };
})(jQuery);
