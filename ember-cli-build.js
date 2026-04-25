/* global require, module */
var EmberApp = require("ember-cli/lib/broccoli/ember-app");
var webRelease =
  ["production", "staging"].indexOf(process.env.EMBER_ENV) !== -1;

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      quietDeps: true,
      // This app (and `shared-goodcity`) still use legacy Sass `@import`.
      // Hide that specific deprecation so we can incrementally migrate later.
      silenceDeprecations: ["import"]
    },
    sourcemaps: {
      enabled: true,
      extensions: ["js"]
    },
    minifyJS: {
      options: {
        exclude: ["**/goodcity.js"]
      }
    },
    fingerprint: {
      extensions: ["js", "css", "png", "jpg", "gif", "map"],
      exclude: ["images/donor.png"],
      enabled: webRelease
    },
    gzip: {
      keepUncompressed: true,
      extensions: ["js", "css", "map", "ttf", "ott", "eot", "svg"],
      enabled: webRelease
    }
  });

  app.import(
    "bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget.js"
  );
  app.import(
    "bower_components/blueimp-file-upload/js/jquery.iframe-transport.js"
  );
  app.import("bower_components/blueimp-file-upload/js/jquery.fileupload.js");
  app.import("bower_components/blueimp-load-image/js/load-image.all.min.js");
  app.import("bower_components/cloudinary/js/canvas-to-blob.min.js");
  app.import(
    "bower_components/blueimp-file-upload/js/jquery.fileupload-process.js"
  );
  app.import(
    "bower_components/blueimp-file-upload/js/jquery.fileupload-image.js"
  );
  app.import(
    "bower_components/blueimp-file-upload/js/jquery.fileupload-validate.js"
  );
  app.import("bower_components/cloudinary/js/jquery.cloudinary.js");

  app.import("bower_components/moment/moment.js");
  app.import("bower_components/moment/locale/zh-tw.js");
  app.import("bower_components/pickadate/lib/picker.js");
  app.import("bower_components/pickadate/lib/picker.date.js");
  app.import("bower_components/pickadate/lib/picker.time.js");

  app.import("bower_components/pickadate/lib/themes/default.css");
  app.import("bower_components/pickadate/lib/themes/default.date.css");
  app.import("bower_components/pickadate/lib/themes/default.time.css");

  // please include individual foundation js as needed
  // tabs js if included throws error on keypress when tab has focus
  app.import("bower_components/foundation/js/foundation/foundation.js");
  app.import(
    "bower_components/foundation/js/foundation/foundation.offcanvas.js"
  );
  app.import("bower_components/foundation/js/foundation/foundation.reveal.js");
  app.import("bower_components/foundation/js/foundation/foundation.joyride.js");
  app.import("bower_components/foundation/js/foundation/foundation.topbar.js");

  // app.import('bower_components/fastclick/lib/fastclick.js');
  app.import("bower_components/jquery-placeholder/jquery.placeholder.js");
  app.import("bower_components/jquery.cookie/jquery.cookie.js");
  app.import("bower_components/modernizr/modernizr.js");
  app.import("bower_components/socket.io-client/socket.io.js");
  app.import("bower_components/braintree-web/dist/braintree.js");

  app.import(
    "bower_components/lightgallery/light-gallery/css/lightGallery.css"
  );
  app.import("bower_components/lightgallery/light-gallery/js/lightGallery.js");
  app.import("bower_components/lightgallery/light-gallery/img/loading.gif", {
    destDir: "/img"
  });

  return app.toTree();
};
