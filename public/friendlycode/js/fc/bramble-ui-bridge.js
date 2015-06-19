define(["jquery"], function($) {

  function updateLayout(data) {
    // Calculate total width of brackets
    var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

    // Set width in percent, easier for window resize
    $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
    $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
    $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");
  }

  function init(bramble) {

    // *******ON LOAD
    checkIfMultiFile();
    if(bramble.getLayout())       {updateLayout(bramble.getLayout());}
    if(bramble.getFilename())     {setNavFilename(bramble.getFilename());}
    if(bramble.getTheme())        {activateTheme(bramble.getTheme());}
    if(bramble.getPreviewMode())  {activatePreviewMode(bramble.getPreviewMode());}

    //Show sidebar nav if it is present on load
    function checkIfMultiFile() {
      var data = bramble.getLayout();

      if(data.sidebarWidth > 0)
      {
        // Total width of window
        var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

        // Set width in percent, easier for window resize
        $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
        $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
        $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");

        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").hide();
        $(".filetree-pane-nav").css("display", "inline-flex");
      }
    }


    // *******EVENTS
    // Smooths resize
    $(window).resize(function() {
      $("#editor-pane-nav-options-menu").hide();
    });

    // User bar menu help
    $("#navbar-help").click(function() {
      window.open("https://support.mozilla.org/en-US/products/webmaker/thimble");
    });

    // Sidebar Fileview
    $("#editor-pane-nav-fileview").click(function() {
      $("#editor-pane-nav-options-menu").hide();
      bramble.showSidebar();
      $("#editor-pane-nav-fileview").css("display", "none");
      $(".filetree-pane-nav").css("display", "inline-flex");
    });

    $("#filetree-pane-nav-hide").click(function() {
      $("#editor-pane-nav-options-menu").hide();
      bramble.hideSidebar();
      $("#editor-pane-nav-fileview").css("display", "block");
      $(".filetree-pane-nav").css("display", "none");
    });


    // Undo
    $("#editor-pane-nav-undo").click(function() {
      bramble.undo();
    });

    // Redo
    $("#editor-pane-nav-redo").click(function() {
      bramble.redo();
    });

    // Options menu
    $("#editor-pane-nav-options").click(function() {
      //Determines where to horizontally place menu based on cog icon location
      var leftOffset = $("#editor-pane-nav-options").offset().left - 86;
      $("#editor-pane-nav-options-menu").css("left", leftOffset);
      $("#editor-pane-nav-options-menu").fadeToggle();
    });

    $(document).on('click', function(event) {
      if (!$(event.target).closest("#editor-pane-nav-options-menu").length && !$(event.target).closest("#editor-pane-nav-options").length) {
        $("#editor-pane-nav-options-menu").hide();
      }
    });
    $("#webmaker-bramble").click(function() {
      $("#editor-pane-nav-options-menu").hide();
      console.log("Within iframe");
    });

    // Font size
    $("#editor-pane-nav-decrease-font").click(function() {
      bramble.decreaseFontSize();
    });

    $("#editor-pane-nav-increase-font").click(function() {
      bramble.increaseFontSize();
    });

    // Theme Toggle
    $("#theme-light").click(function() {
      activateTheme("light-theme");
    });
    $("#theme-dark").click(function() {
      activateTheme("dark-theme");
    });

    function activateTheme(themeType) {
      if(themeType === "light-theme") {
        bramble.useLightTheme();

        // Icons
        $("#sun-green").fadeIn(500);
        $("#moon-white").fadeIn(500);
        $("#sun-white").fadeOut(500);
        $("#moon-green").fadeOut(500);

        // Active Indicator
        $("#theme-active").css("position", "absolute").animate({
          left: 187
        });
      }
      else if(themeType === "dark-theme") {
        bramble.useDarkTheme();

        // Icons
        $("#moon-green").fadeIn(1000);
        $("#sun-white").fadeIn(1000);
        $("#moon-white").fadeOut(1000);
        $("#sun-green").fadeOut(1000);

        // Active indicator
        $("#theme-active").css("position", "absolute").animate({
          left: 157
        });
      }
    }

    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      bramble.refreshPreview();
    });

    // Preview Mode Toggle
    $("#preview-pane-nav-desktop").click(function() {
      activatePreviewMode("desktop");
    });
    $("#preview-pane-nav-phone").click(function() {
      activatePreviewMode("mobile");
    });

    function activatePreviewMode(mode) {
      if(mode === "mobile") {
        bramble.useMobilePreview();

        $("#preview-pane-nav-phone").removeClass("viewmode-inactive");
        $("#preview-pane-nav-phone").addClass("viewmode-active");

        $("#preview-pane-nav-desktop").removeClass("viewmode-active");
        $("#preview-pane-nav-desktop").addClass("viewmode-inactive");
      }
      else if (mode === "desktop") {
        bramble.useDesktopPreview();

        $("#preview-pane-nav-desktop").removeClass("viewmode-inactive");
        $("#preview-pane-nav-desktop").addClass("viewmode-active");

        $("#preview-pane-nav-phone").removeClass("viewmode-active");
        $("#preview-pane-nav-phone").addClass("viewmode-inactive");
      }
    }

    //Change file name in editor nav
    function setNavFilename(filename) {
      var fullFilename = filename;
      // Trim name to acceptable length if too long
      if(filename.length > 18) {
        filename = filename.substring(0,7) + "..." + filename.substring(filename.length-8,filename.length);
      }
      $("#editor-pane-nav-filename").text(filename);
      $("#editor-pane-nav-filename").attr("title", fullFilename);
    }

    // Hook up event listeners
    bramble.on("layout", updateLayout);

    bramble.on("previewModeChange", function(data) {
      console.log("thimble side", "previewModeChange", data);
    });

    bramble.on("sidebarChange", function(data) {
      console.log("thimble side", "sidebarChange", data);

      // Open/close filetree nav during hidden double click
      if(data.visible === true)
      {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "none");
        $(".filetree-pane-nav").css("display", "inline-flex");
      }
      else if(data.visible === false)
      {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "block");
        $(".filetree-pane-nav").css("display", "none");
      }
    });

    bramble.on("activeEditorChange", function(data) {
      console.log("thimble side", "activeEditorChange", data);
      setNavFilename(data.filename);
    });

    // File Change Events
    bramble.on("fileChange", function(filename) {
      console.log("thimble side", "fileChange", filename);
    });

    bramble.on("fileDelete", function(filename) {
      console.log("thimble side", "fileDelete", filename);
    });

    bramble.on("fileRename", function(oldFilename, newFilename) {
      console.log("thimble side", "fileRename", oldFilename, newFilename);
      setNavFilename(newFilename);
    });
  }

  return {
    init: init
  };
});