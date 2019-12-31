<avs-requierement>
  <div class="close" onclick={hide}></div>
  <div class="requierement">
    <img src="https://storage.googleapis.com/travelcast/images/landscape.svg"/>
    <h1>Please turn your phone to continue</h1>
 
    <div onclick={hide} class="go-back">
      Go back to the page
    </div>
  </div>
  <script type="es6">
    this.hide = (e) => {
      e.stopPropagation();
      e.preventDefault();
      opts.player.exitFullscreen();
    }
  </script>
</avs-requierement>
