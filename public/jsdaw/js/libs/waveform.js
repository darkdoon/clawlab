define (function () {
  function Waveform(options) {
    // this.redraw = __bind(this.redraw, this);
    this.container = options.container;
    this.canvas = options.canvas;
    this.data = options.data || [];
    this.outerColor = options.outerColor || "transparent";
    this.innerColor = options.innerColor || "#000000";
    this.interpolate = true;
    if (options.interpolate === false) {
      this.interpolate = false;
    }
    if (this.canvas == null && options.context == null) {
      if (this.container) {
        this.canvas = this.createCanvas(this.container, options.width || this.container.clientWidth, options.height || this.container.clientHeight);
      } else {
        throw "Either canvas or container option must be passed";
      }
    }
    this.patchCanvasForIE(this.canvas);
    this.context = options.context || this.canvas.getContext("2d");
    this.width = options.width || parseInt(this.context.canvas.width, 10);
    this.height = options.height || parseInt(this.context.canvas.height, 10);
    if (options.data) {
      this.update(options);
    }
  }

  Waveform.prototype.setData = function(data) {
    return this.data = data;
  };

  Waveform.prototype.setDataInterpolated = function(data) {
    return this.setData(this.interpolateArray(data, this.width));
  };

  Waveform.prototype.setDataCropped = function(data) {
    return this.setData(this.expandArray(data, this.width));
  };

  Waveform.prototype.update = function(options) {
    if (options.interpolate != null) {
      this.interpolate = options.interpolate;
    }
    if (this.interpolate === false) {
      this.setDataCropped(options.data);
    } else {
      this.setDataInterpolated(options.data);
    }
    return this.redraw();
  };

  Waveform.prototype.redraw = function() {
    var d, i, middle, t, _i, _len, _ref, _results;
    this.clear();
    this.context.fillStyle = this.innerColor;
    middle = this.height / 2;
    i = 0;
    _ref = this.data;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      t = this.width / this.data.length;
      if (typeof this.innerColor === "function") {
        this.context.fillStyle = this.innerColor(i / this.width, d);
      }
      this.context.clearRect(t * i, middle - middle * d, t, middle * d * 2);
      this.context.fillRect(t * i, middle - middle * d, t, middle * d * 2);
      _results.push(i++);
    }
    return _results;
  };

  Waveform.prototype.clear = function() {
    this.context.fillStyle = this.outerColor;
    this.context.clearRect(0, 0, this.width, this.height);
    return this.context.fillRect(0, 0, this.width, this.height);
  };

  Waveform.prototype.patchCanvasForIE = function(canvas) {
    var oldGetContext;
    if (typeof window.G_vmlCanvasManager !== "undefined") {
      canvas = window.G_vmlCanvasManager.initElement(canvas);
      oldGetContext = canvas.getContext;
      return canvas.getContext = function(a) {
        var ctx;
        ctx = oldGetContext.apply(canvas, arguments);
        canvas.getContext = oldGetContext;
        return ctx;
      };
    }
  };

  Waveform.prototype.createCanvas = function(container, width, height) {
    var canvas;
    canvas = document.createElement("canvas");
    container.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  Waveform.prototype.expandArray = function(data, limit, defaultValue) {
    var i, newData, _i, _ref;
    if (defaultValue == null) {
      defaultValue = 0.0;
    }
    newData = [];
    if (data.length > limit) {
      newData = data.slice(data.length - limit, data.length);
    } else {
      for (i = _i = 0, _ref = limit - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        newData[i] = data[i] || defaultValue;
      }
    }
    return newData;
  };

  Waveform.prototype.linearInterpolate = function(before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  Waveform.prototype.interpolateArray = function(data, fitCount) {
    var after, atPoint, before, i, newData, springFactor, tmp;
    newData = new Array();
    springFactor = new Number((data.length - 1) / (fitCount - 1));
    newData[0] = data[0];
    i = 1;
    while (i < fitCount - 1) {
      tmp = i * springFactor;
      before = new Number(Math.floor(tmp)).toFixed();
      after = new Number(Math.ceil(tmp)).toFixed();
      atPoint = tmp - before;
      newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
      i++;
    }
    newData[fitCount - 1] = data[data.length - 1];
    return newData;
  };

  Waveform.prototype.optionsForSyncedStream = function(options) {
    var innerColorWasSet, that;
    if (options == null) {
      options = {};
    }
    innerColorWasSet = false;
    that = this;
    return {
      whileplaying: this.redraw,
      whileloading: function() {
        var stream;
        if (!innerColorWasSet) {
          stream = this;
          that.innerColor = function(x, y) {
            if (x < stream.position / stream.durationEstimate) {
              return options.playedColor || "rgba(255,  102, 0, 0.8)";
            } else if (x < stream.bytesLoaded / stream.bytesTotal) {
              return options.loadedColor || "rgba(0, 0, 0, 0.8)";
            } else {
              return options.defaultColor || "rgba(0, 0, 0, 0.4)";
            }
          };
          innerColorWasSet = true;
        }
        return this.redraw;
      }
    };
  };

  Waveform.prototype.dataFromSoundCloudTrack = function(track) {
    var _this = this;
    return JSONP.get("http://waveformjs.org/w", {
      url: track.waveform_url
    }, function(data) {
      return _this.update({
        data: data
      });
    });
  };

  return Waveform;

});
