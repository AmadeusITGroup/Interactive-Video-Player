## Table of Contents
* [Developments](#developments)
* [Getting Started](#getting-started)

## Developments

Amadeus video player is built using npm ensure it is installed on our machine before continuing. Once you have a copy of the repository locally open a terminal and install the required node.js modules using npm.

```sh
npm install
```

### Watching source changes

As you're developing, you want the build to re-run and update itself. In addition, you want to launch a local web-server. To do so, you just need to run

```sh
npm start
```

This sets up the local webserver, accessible at `http://localhost:9000`, and then watches source files, and CSS files for you and rebuilds things as they happen. You may notice that changes to `.tag` files may not always result in a complete reload. When modifying those files ensure that you also manually refresh your browser. 

If you are developing the library you may run the command

```sh
make develop-library
```

This will watch for any changes in source files, and CSS files will run the `npm run library` command and copy the outout to the Amadeus Video Solutions repository.

### Adding depenencies

During your developments you may want/need to add new depenecies ensure that you are adding them through npm. For example one may want to add the hammerjs library to do so run the following command

```sh
npm i hammerjs
```

### Building

There are 2 ways to build Amadeus Video Player depending on the use case

```sh
npm run build
```

This outputs a build/ folder that contains a pre-compiled versions of Amadeus Video Player, including a minified version and the CSS file. This file can be included in page via the `loader.js` or <script></script> tag, see first section of this document.

```sh
npm run library
```

This outputs a dist/ folder that contains all files needed for bundling tools like browserify and webpack to package Amadeus Video Player into projects.

### Testing

The Amadeus Video Player tests suite use karma and jasmine. All specs are located under the directory test. The test suite can be run with the following command

```sh
karma start
```

New functionalities should have their specs written before PR is accepted.

### Releasing

Once everything is polished and tested you can deploy a new version of the player with the following command:

```sh
make deploy-stable
```

## Getting Started

If you're ready to dive in, the [Getting Started] page and [documentation] are the best places to go for more information. If you get stuck, shoot an e-mail to nicolas.abric@amadeus.com or anthony.hock-koon@amadeus.com!

## Dependencies

Amadeus Video player is built upon various and great open source libraries. Here is the list:
* Core
  * [riot](https://github.com/riot/riot)
  * [video.js](https://github.com/videojs/video.js) 
* Other
  * [glightbox](https://github.com/mcstudios/glightbox)
  * [ismobilejs](https://github.com/kaimallea/isMobile)
  * [hammerjs](https://github.com/hammerjs/hammer.js/)
  * [moment](https://github.com/moment/moment)
  * [social-share-kit](https://github.com/darklow/social-share-kit)
* Video.js plugins (available under plugins and adapted for version 7)
  * [videojs-markers](https://github.com/spchuang/videojs-markers)
  * [videojs-resolution-switcher](https://github.com/kmoskwiak/videojs-resolution-switcher)
* Styling
  * [bootstrap](https://github.com/twbs/bootstrap)
  * [Font-Awesome](https://github.com/FortAwesome/Font-Awesome)


[Google Cloud Storage]: https://console.cloud.google.com/storage/browser/travelcast/stable/?project=travelcast-1470210075326
[documentation]: https://docs.amadeus-video-solutions.com/
[Getting Started]: ./DOC.md