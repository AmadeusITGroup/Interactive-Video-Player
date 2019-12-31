<avs-share>
  <div id={'share-'+parent.playerId} class="share-container large">
    <div class="close" onclick={parent.hide.bind(this, 'share')}></div>
    <div class="shares-wrapper">
      <h1>Share this video</h1>
      <input type="text" value="{link}" onclick="this.select()" readonly/>
      <div class="shares ssk-group">
        <a href="" class="ssk ssk-icon ssk-facebook"></a>
        <a href="" class="ssk ssk-icon ssk-twitter"></a>
        <a href="" class="ssk ssk-icon ssk-google-plus"></a>
        <a href="" class="ssk ssk-icon ssk-pinterest"></a>
      </div>
    </div>
    
  </div>
  <script type="es6">
    this.mixin('template');

    this.link = window.location.href;

    this.on("mount", () => {
      this.addResizeListener(this.el);   
      this._overlay  = this.root.querySelector('div[id^="share-"]');
      this.onResize();
    });

    this.on("updated", () => {

      if(SocialShareKit && opts.player && opts.player.videoDetails && opts.player.videoDetails.meta) {
        this.link = opts.player.videoDetails.meta.share_link || window.location.href;
        const uri = this.parent.thumbnailUrl;
        SocialShareKit.init({
          reinitialize : true,
          selector: 'div[id^="share-"] .shares .ssk',
          url: this.link,
          text:  `Watch ${opts.player.videoDetails.meta.title} on ${this.getHostName(this.link)}`,
          image : uri
        });
      }
    });

    this.on("unmount", () => {
      this.removeLsiteners();
    })

    this.getHostName = (url) => {
      const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
      if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
      }
      else {
        return null;
      }
    }

    this.getOverlay = () => {
      return this._overlay;
    } 
  </script>
</avs-share>
