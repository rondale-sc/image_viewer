ImageViewer = 
  zoomLevel : 75
  increment : 25
  images : null
  mainDivId : null
  mainDiv : null
  imageOverlay: null
  imageViewerImg: null
  imageIndex: null
  commandMode: false
  currentImageDiv: null
  key_bindings : {}
  init : (image_path_array, main_div_id) -> 
    if main_div_id != undefined
      ImageViewer.mainDivId = main_div_id
    else
      ImageViewer.mainDivId = 'ImageViewer'
    ImageViewer.setupContainers()
    ImageViewer.setupKeyBindings()
    ImageViewer.setupImages(image_path_array)
    ImageViewer.setupHeight()
    ImageViewer.handleWindowResize()
    true
  reload : ()->
    image_array                 = ImageViewer.images
    ImageViewer.zoomLevel       = 75
    ImageViewer.images          = null
    ImageViewer.mainDiv         = null
    ImageViewer.imageOverlay    = null
    ImageViewer.imageViewerImg  = null
    ImageViewer.imageIndex      = null
    ImageViewer.commandMode     = false
    ImageViewer.currentImageDiv = null
    ImageViewer.init(image_array)
  setupContainers : ()-> 
    ImageViewer.mainDiv = $('#' + ImageViewer.mainDivId)
    ImageViewer.mainDiv.empty()
    ImageViewer.mainDiv.addClass('image-viewer-container')

    ImageViewer.mainDiv.append('<div id="' + ImageViewer.mainDivId + '-image-overlay" class="image-overlay"></div>')
    ImageViewer.imageOverlay = $('#' + ImageViewer.mainDivId + '-image-overlay')
  setupImages : (images)->
    ImageViewer.images = images
    style = ""

    $.each(images, (index, image)-> 
      if index != 0
        style += "display:none;"

      string = """
                <div id='#{ImageViewer.mainDivId}-image_viewer-#{index}' class='image-viewer' style='#{style}'>
                  <img id='#{ImageViewer.mainDivId}-full-image-#{index}' src='#{image}' alt='Full Image' style='width:75%'/>
                </div>
              """
      
      ImageViewer.mainDiv.append(string)
      $('.image-viewer').bind('click', ImageViewer.addBookmark)
      ImageViewer.currentImageDiv = $('#' + ImageViewer.mainDivId + '-image-viewer-0')
      ImageViewer.imageViewerImg = $('#' + ImageViewer.mainDivId + '-full-image-0')
      ImageViewer.imageIndex = 0
      ImageViewer.updateOverlay()
      true
    )
   delayedRedirect : ()->
     window.location = "/"
     true
   teardownKeyBindings : ()->
     shortcut.remove("\\")
     shortcut.remove("k")
     shortcut.remove('i')
     shortcut.remove('e')
     shortcut.remove('d')
     shortcut.remove('a')
     shortcut.remove(';')
     shortcut.remove('f')
     shortcut.remove('s')
     shortcut.remove('j')
     shortcut.remove('l')
   setupKeyBindings : ()->
     shortcut.commandModeListener = ()-> ImageViewer.updateOverlay()
     shortcut.remove("\\"); shortcut.add("\\", 
     ()-> shortcut.toggleCommandMode()
     'keycode': 220, 'require_command_mode':false)

     shortcut.remove('k');  shortcut.add('k',  ()->ImageViewer.zoom(-1 * ImageViewer.increment))
     shortcut.remove('i');  shortcut.add('i', ()->ImageViewer.zoom(ImageViewer.increment))
     shortcut.remove('e');  shortcut.add('e', ()->ImageViewer.scroll(0,-1 * ImageViewer.increment))
     shortcut.remove('d');  shortcut.add('d', ()->ImageViewer.scroll(0,ImageViewer.increment))
     shortcut.remove('a');  shortcut.add('a', ()->ImageViewer.scroll(0,-1 * (ImageViewer.increment * 5)))
     shortcut.remove(';');  shortcut.add(';', ()->ImageViewer.scroll(0,(ImageViewer.increment * 5)))
     shortcut.remove('f');  shortcut.add('f', ()->ImageViewer.scroll(ImageViewer.increment,0))
     shortcut.remove('s');  shortcut.add('s', ()->ImageViewer.scroll((-1 * ImageViewer.increment),0))
     shortcut.remove('j');  shortcut.add('j', ()->ImageViewer.scrollPage(-1))
     shortcut.remove('l');  shortcut.add('l', ()->ImageViewer.scrollPage(1))
  setupHeight : ()->
    window_height = $(window).height()
    menu = $('#header')
    footer = $('#footer')
    footer_height = 0
    menu_offset = menu.offset().top + menu.height() + 5
    if(footer)
      footer_height = footer.height() + 5
      
    new_height = window_height - menu_offset - footer_height - 20
    ImageViewer.mainDiv.css('height', new_height + 'px')
    ImageViewer.mainDiv.css('top', '0px')
  handleWindowResize: ()->
    $(window).bind('resize', ImageViewer.setupHeight)
  zoomAbsolute : (zoomLevel)->
    previous_zoomLevel = ImageViewer.zoomLevel
    ImageViewer.zoomLevel = zoomLevel

    object_to_zoom = $('#' + ImageViewer.mainDivId + '-full-image-' + ImageViewer.imageIndex)
    if (object_to_zoom.attr('data-angle') != undefined)
      object_to_zoom = object_to_zoom.children().first()

    object_to_zoom.css('width', ImageViewer.zoomLevel + '%')

    ImageViewer.updateBookmarks(previous_zoomLevel)
    ImageViewer.scroll(0,0)
  zoom : (increment)->
    if (increment < 0) && (ImageViewer.zoomLevel <= ImageViewer.increment)
      increment = 0
    ImageViewer.zoomAbsolute(ImageViewer.zoomLevel + increment)
  scroll : (left, top)->
    ImageViewer.currentImageDiv.scrollTop(ImageViewer.currentImageDiv.scrollTop() + top)
    ImageViewer.currentImageDiv.scrollLeft(ImageViewer.currentImageDiv.scrollLeft() + left)
  scrollPage : (increment)->

    if(ImageViewer.imageIndex == 0 && increment == -1) 
      ImageViewer.imageIndex = (ImageViewer.images.length - 1)
    else if(ImageViewer.imageIndex == (ImageViewer.images.length - 1) && increment == 1)
      ImageViewer.imageIndex = 0
    else
      ImageViewer.imageIndex += increment
      
    ImageViewer.showPage(ImageViewer.imageIndex)
  showPage : (page)->
    ImageViewer.imageIndex = page
    ImageViewer.currentImageDiv.hide()
    ImageViewer.currentImageDiv = $('#' + ImageViewer.mainDivId + '-image-viewer-' + page)
    ImageViewer.imageViewerImg = $('#' + ImageViewer.mainDivId + '-full-image-' + page)
    ImageViewer.currentImageDiv.show()
    ImageViewer.updateOverlay()
  updateOverlay : ()->
    s = (ImageViewer.imageIndex + 1) + ' / ' + ImageViewer.images.length

    if(shortcut.commandMode)
      s += ' CM'

    ImageViewer.imageOverlay.html(s)
  toggleCommandMode : ()->
    ImageViewer.commandMode = (!ImageViewer.commandMode)
    ImageViewer.updateOverlay()
  updateBookmarks: (previous_zoom)->
    $('.bookmark').each((index)->
      b = $(this)
      calculated_position = (b.css('top').replace('px','') / (previous_zoom / 100)) * (ImageViewer.zoomLevel / 100)
      b.css('top', calculated_position + 'px'))
  rotate: (increment)->
    image = '#' + ImageViewer.mainDivId + '-full-image-' + ImageViewer.imageIndex;
    current_angle = $(image).attr('data-angle')

    if (current_angle == undefined)
      current_angle = 0

    $(image).css('width', '100%')
    $(image).rotate(parseInt(current_angle, 10) + increment)
    ImageViewer.imageViewerImg = $(image)
    ImageViewer.imageViewerImg.attr('data-angle',(parseInt(current_angle, 10) + increment).toString())
    ImageViewer.zoomAbsolute(75)
  addBookmark : (event)->
    image = ImageViewer.currentImageDiv
    pos_y = event.pageY - image.offset().top
    image.append('<div class="bookmark"><a style="color:#9d3636;font-size:24px;">&rarr;</a></div>')
    arrow = $('.bookmark').last()
    arrow.css({'display': 'block','top': pos_y  + "px",'position': 'absolute','left': '-1%' })
    arrow.bind('click', ImageViewer.removeBookmark, false)