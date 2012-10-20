/**
 * The library view
 */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/library.html",
  "views/audio_source_view",
  "text!templates/library_dropzone.html",
  "fileupload/jquery.fileupload",
  "fileupload/jquery.iframe-transport"
], function($, _, Backbone, libraryTemplate, AudioSourceView, libraryDropzoneTemplate) {
  return Backbone.View.extend ({

    template : _.template (libraryTemplate),

    events : {
      "dragover .dropzone" : "handleDragOver"
    },

    initialize : function () {
      // listen when an audioSources is added
      this.collection.bind ("add", this.addAudioSource);
    },

    render : function () {
      this.$el.html (this.template ());
      this.$el.find (".dropzone").html (_.template (libraryDropzoneTemplate, {
        text : "or drop audio files (.mp3 or .wav)"
      }));
      //render audio sources
      this.collection.each (this.addAudioSource);

      // Initialize fileupload
      this.$fileupload = this.$el.find('input:file.file-upload-field');
      // Listen drop or add
      this.$fileupload.fileupload({
        dropZone: this.$el.find('.dropzone'),
        //fileInput: $(this),
        //fileInput: null,
        fileInput: $('.upload-by-button'),
        add: _.bind(this.handleFileSelect, this),
        dataType: 'json'
      });
      return this;
    },

    addAudioSource : function (audioSourceModel) {
      var audioSourceView = new AudioSourceView ({ 
        model : audioSourceModel,
        id : audioSourceModel.get("id")
      }).render();
      $("#audio-source-list", this.el).append (
          audioSourceView.el
      );
    },

    handleDragOver : function ($e) {
      $e.stopPropagation ();
      $e.preventDefault ();
      $e.originalEvent.dataTransfer.dropEffect = "copy";
    },

    // TODO: Check if we can listen to view events directly so we don't rely on
    // model's upload event triggering
    //
    // NOTE : Only compatible with XHR uploads because of drop, must try to
    // adapt adding a file upload button, even for ergonomics purposes
    handleFileSelect : function ($e, data) {
      for (var i = 0, f; f = data.files[i]; i++) {
        this.collection.addFromFile (f, this.$fileupload);
      }
    }
  });
});