
![alt text](https://home.amadeus-video-solutions.com/wp-content/uploads/2018/05/logo-avs-1.svg "Amadeus Video Solutions")
The first video player for the travel industry.

![alt text](https://storage.googleapis.com/travelcast/images/documentation-player.png "Amadeus Video Player - Screenshot")


## Table of Contents

* [Quick Start](#quick-start)
* [Analytics](#analytics)
* [API](#api)

## Quick Start

The library version of the player is hosted on [Google Cloud Storage]. This version and its loader can be used by anyone. 

Creating an Amadeus Video Player on your page is as simple as creating a `<video>` element, but with an additional `data-interactive` attribute and a script tag. When the page loads, Amadeus Video Player library will find this element and automatically setup a player in its place. See the example below:

```html
<div style="position: relative;padding-bottom: 56.25%;height: 0;">
  <div style="position: absolute;top: 0; left: 0; width: 100%;height: 100%;">
    <video width="100%" controls
            poster="https://peach.blender.org/wp-content/uploads/bbb-splash.png?x11217" 
            data-name="Big buck Bunny" 
            data-interactive>
      <source src="https://storage.googleapis.com/travelcast/videos/trailer.ogg"/>
    </video>
  </div>
</div>
<script async defer src="https://storage.googleapis.com/travelcast/stable/loader.js"></script>
```

> The `loader.js` script is in charge of getting the latest and greatest library version and will inject both the style and the script needed by the Amadeus Video Player to your page.
> With the given example the Amadeus Video Player will act as a simple HTML5 video player.

Alternatively, if you don't want to use automatic setup, you can instanciate an Amadeus Video Player programaticcaly. The library will trigger a custom event, `onAVSLibraryReady`, once it is safe to create new player instances. Here is an exxample:

```html
<div id="player"></div>
<script>
  window.addEventListener('onAVSLibraryReady', function() {
    var player = new AmadeusVideoPlayer('div#player', {
      poster : "https://peach.blender.org/wp-content/uploads/bbb-splash.png?x11217",
      source: {
        src: "https://storage.googleapis.com/travelcast/videos/trailer.ogg"
      }
    }); 
    palyer.ready(function() {
      console.log('Your player is ready');
    })
  });
</script>
<script async defer src="https://storage.googleapis.com/travelcast/stable/loader.js"></script>
```

> Creating players programmatically allow more freedom as you will have access to all options. This is not the case with auotmatic setup.

As you can see the `AmadeusVideoPlayer` constructor accepts an `options` object. You can also add register a callback function for when your player will be ready.

If you're ready to dive in, the [documentation] is the best places to go for more information. If you get stuck, send an e-mail to nicolas.abric@amadeus.com or anthony.hock-koon@amadeus.com

## Analytics

By default the player will sent analytics to our [Google tracking code]. If requiered you can add your own Google Analytics key through the [analytics option] of the player and all events will be sent there as well.

### Events

Here is the list of player events and their description

| Name  | Description  | GA tracker type | GA category |
|---|---|---|---|
| /player/loaded | Event fired when the video player is loaded | pageview | Video |
| /player/playtime | Event fired when player pauses or when user leave the page. Elapsed time between 2 evnets, in seconds | pageview | Video |
| /player/playtime/error | Event fired when an inconsistency is detected between expected playtime and video duration | pageview | Video |
| /player/completed | Event fired when the video player breaches 90% of video duration | pageview | Video |
| /player/ended | Event fired when the video player reaches video end | pageview | Video |
| START | Event fired when the video player starts playback | event | Video |
| PAUSE | Event fired when the video player pauses playback | event | Video |
| FULLSCREEN | Event fired when the video player enters fullscreen mode | event | Video |
| CTRLBRPOI_CLICK | Event fired when user clicks on a point of interest in video player control bar | event | Poi |
| DETAILS_PANEL | Event fired when an overlay is displayed either by user's interaction or automatically, inline overlay | event | Interaction |
| DETAILS_PANEL_HIDE | Event fired when an overlay is closed either by user's interaction or automatically, inline overlay | event | Interaction |
| DEEPLINK_CLICK | Event fired when a call to action button has beeen clicked | event | Interaction |

### Dashboard

Events descirbed just above are used to create more complex computed metrics. Those metrics are the one shown in AVS dashboards. Here is the list of dashboard metrics and their description.

| Name  | Description | formula |
|---|---|---|
| Click through rate | # of users clicking on overlay's call to action, express in %   | `DEEPLINK_CLICK` / `DETAILS_PANEL` |
| Watch time | Cumulative player play time, express in hours:minutes:seconds   | sum of `/player/playtime` elapsed seconds |
| Users | # of unique visitors  | n/a |
| Video starts | # of video starts | sum of `START` |
| Completed video | # of video completed | sum of `/player/ended` |
| Play rate | # of video started out of video loaded | `START` / `/player/loaded` |
| Active users | # of users that interacted with the video | n/a |
| Avg. Interaction rate / Viewed video | # of overlay shown out of video viewed | `DETAILS_PANEL` / `/player/completed` |
| Shares | # of shares | `SHARE` |


## API

Under the hood Amadeus Video Player uses a set of methods exposed by our backend. With this API you will be able to request for videos, reversing Google place ids, getting informaion about flight fares, airports and much more. 

Ready to dive in? Get acquainted with the [Amadeus Video Player API].

[Google Cloud Storage]: https://console.cloud.google.com/storage/browser/travelcast/stable/?project=travelcast-1470210075326
[documentation]: https://docs.amadeus-video-solutions.com/
[Google tracking code]: https://support.google.com/analytics/answer/1008080?hl=en
[analytics option]: https://docs.amadeus-video-solutions.com/interfaces/options.html#analytics
[Amadeus Video Player API]: https://www.amadeus-video-solutions.com/api/swagger/index.html