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
    var self = $.fn.imageViewer;

    $.fn.imageViewer.scrollPage = function(increment){
      if(settings["imageIndex"] == 0 && increment == -1) {
        settings["imageIndex"] = (settings["images"].length - 1);
      } else if(settings["imageIndex"] == (settings["images"].length - 1) && increment == 1){
        settings["imageIndex"] = 0;
      } else {
        settings["imageIndex"] += increment;
      };
      showPage(settings["imageIndex"]);
    };
    $.fn.imageViewer.displayLegend =  function(){
      var id = $('#dialog') 
      var maskHeight = $(document).height();
      var maskWidth = $(window).width();

      $('#mask').css({'width':maskWidth,'height':maskHeight});
      $('#mask').fadeIn(600);
      $('#mask').fadeTo("slow",0.3);

      var winH = $(window).height();
      var winW = $(window).width();

      $(id).css('top',  winH/2-$(id).height()/2);
      $(id).css('left', winW/2-$(id).width()/2);

      $(id).fadeIn(2000); 
    }

    $.fn.imageViewer.scroll =  function(left, top){
      settings["currentImageDiv"].scrollTop(settings["currentImageDiv"].scrollTop() + top);
      settings["currentImageDiv"].scrollLeft(settings["currentImageDiv"].scrollLeft() + left);
    };

    $.fn.imageViewer.zoom = function(increment){
      if(increment < 0 && settings["zoomLevel"] <= settings["increment"]) increment = 0;
      zoomAbsolute(settings["zoomLevel"] + increment);
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
      zoomAbsolute(75);
    };

    $.fn.imageViewer.print = function() {
      var myWindow = window.open("", '_newtab');
      var image_tags = "";

      $.each(settings["images"], function(index, image) {
        image_tags += '<img style="float:left;clear:both;width:100%;" src="' + image + '" />';
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


    function init(image_path_array, options){
      main_div_id = (settings["mainDivId"]).attr("id");
      if ( options ) { 
        $.extend( settings, options );
      };

      this.data("settings", settings)

      if (main_div_id != undefined) {
        settings["mainDivId"] = main_div_id;
      };

      setupContainers();
      setupKeyBindings();
      setupImages(image_path_array);
      setupHeight();
      setupLegend();
      setupMaskListener();
      if (settings['nav_links'] == true) {createNavTable();};
      handleWindowResize();
    }
    function setupLegend() {
      var modal_container = "<div id='key-bindings'></div>";
      var mask_div = "<div id='mask'></div>";

      var key_binding_div = "<div class='window' id='dialog'>" + 
        "<h5>Legend</h5>" + 
         "<p>'/' (slash) to toggle Command Mode</p>" +
          "<ul>" +
            "<li>'i' = Zoom In</li>" +
            "<li>'k' = Zoom Out</li>" +
            "<li>'l' = Next</li>" +
            "<li>'j' = Previous</li>" +
            "<li>'e' = Scroll Up</li>" +
            "<li>'d' = Scroll Down</li>" +
            "<li>'s' = Scroll Left</li>" +
            "<li>'f' = Scroll Right</li>" +
            "<li>'r' = Rotate Clockwise</li>" +
          "</ul>" +
          "<a href='#' class='close'>Close</a>"
      "</div>";

      $('body').prepend(modal_container);
      $('#key-bindings').append(key_binding_div);
      $('#key-bindings').append(mask_div);
    }
    function setupMaskListener(){
      $('.window .close').click(function (e) {
              //Cancel the link behavior
              e.preventDefault();
              $('#mask, .window').hide();
          });
      $('#mask').click(function () {
          $(this).hide();
          $('.window').hide();
      });
    }
    function reload(){
      image_array                 = settings["images"];
      settings["zoomLevel"]       = 75;
      settings["images"]          = null;
      settings["mainDiv"]         = null;
      settings["imageOverlay"]    = null;
      settings["imageViewerImg"]  = null;
      settings["imageIndex"]      = null;
      settings["commandMode"]     = false;
      settings["currentImageDiv"] = null;

      init(image_array);
    }

    function createNavTable() {
      table = '<table class="nav_links">' + 
      '<tr>' +
      '<td>' + createNavLink('scrollPage(-1)', 'previous') + '</td>' + 
      '<td>' + createNavLink('scrollPage(1)', 'next') + '</td>' + 
      '<td>' + createNavLink('scroll(-1 * ' + settings["increment"] + ",0)", 'left') + '</td>' + 
      '<td>' + createNavLink('scroll(' + settings["increment"] + ",0)", 'right') + '</td>' + 
      '<td>' + createNavLink('scroll(0, -1 * ' + settings["increment"] + ")", 'up') + '</td>' + 
      '<td>' + createNavLink('scroll(0,' + settings["increment"] + ")", 'down') + '</td>' + 
      '<td>' + createNavLink('zoom(' + settings["increment"] + ")", 'zoom in') + '</td>' + 
      '<td>' + createNavLink('zoom(-1 * ' + settings["increment"] + ")", 'zoom out') + '</td>' +
      '<td>' + createNavLink('rotate(90)', 'rotate') + '</td>' +
      '<td>' + createNavLink('print()', 'print') + '</td>' +
      '<td>' + createNavLink('displayLegend()', 'Legend') + '</td>' + 
      '</tr>' +
      '</table>';

      settings["mainDiv"].prepend(table);
    }
    function createNavLink( call, name ) {
      var div_id = '#' + settings["mainDivId"];

      return '<a href="#" onclick="' +
      '$(\'' + div_id + '\')' +
      '.imageViewer.' +  call + ';return false;">' + 
      name +
      '</a>';
    }

    function setupContainers(){
      settings["mainDiv"] = $('#' + settings["mainDivId"]);
      settings["mainDiv"].empty();
      settings["mainDiv"].addClass('image-viewer-container');
      settings["mainDiv"].css("width", settings["width"]);
      settings["mainDiv"].append('<div id="' + settings["mainDivId"] + '-image-overlay" class="image-overlay"></div>');
      settings["imageOverlay"] = $('#' + settings["mainDivId"] + '-image-overlay');
    }

    function  setupImages(images){
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

      settings["currentImageDiv"] = $('#' + settings["mainDivId"] + '-image-viewer-0');
      settings["imageViewerImg"] = $('#' + settings["mainDivId"] + '-full-image-0');
      settings["imageIndex"] = 0;
      updateOverlay();
    }

    function delayedRedirect(){
      window.location = "/";
    }

    function teardownKeyBindings(){
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
    }

    function  setupKeyBindings(){
      shortcut.commandModeListener = function(){updateOverlay();};
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
    }

    function setupHeight(){
      var window_height = $(window).height();
      var menu = $('#header');
      var footer = $('#footer');
      var footer_height = 0;

      if (menu) {
        var menu_offset = menu.offset().top + menu.height() + 7;
      } else {
        var menu_offset = 0;
      }

      if(footer){
        var footer_height = footer.height() + 7;
      } else {
        var footer_height = 0;
      }
      var new_height = window_height - menu_offset - footer_height - 20;

      settings["mainDiv"].css('height', new_height + 'px');
      settings["mainDiv"].css('top', '0px');
    }

    function handleWindowResize(){
      $(window).bind('resize', setupHeight);
    }

    function zoomAbsolute(zoomLevel){
      previous_zoomLevel = settings["zoomLevel"];
      settings["zoomLevel"] = zoomLevel;

      object_to_zoom = $('#' + settings["mainDivId"] + '-full-image-' + settings["imageIndex"]);

      object_to_zoom.css('width', settings["zoomLevel"] + '%');
      self.scroll(0,0);
    }

    function showPage(page){
      settings["imageIndex"] = page;

      settings["currentImageDiv"].hide();
      settings["currentImageDiv"] = $('#' + settings["mainDivId"] + '-image-viewer-' + page);
      settings["imageViewerImg"] = $('#' + settings["mainDivId"] + '-full-image-' + page);
      settings["currentImageDiv"].show();
      updateOverlay();
    }

    function updateOverlay(){
      var s = (settings["imageIndex"] + 1) + ' / ' + settings["images"].length;

      if(shortcut.commandMode) {
        s += ' CM';
      };

      settings["imageOverlay"].html(s);
    }

    function toggleCommandMode(){
      settings["commandMode"] = (!settings["commandMode"]);
      updateOverlay();
    }

    if ( typeof method === 'object' || ! method ) {
      return init.apply( this, arguments);
    }  else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.imageViewer' );
    };
  };
  })(jQuery);
