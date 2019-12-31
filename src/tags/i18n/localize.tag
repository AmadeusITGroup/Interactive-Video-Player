<localize>
  <style scoped>
    :scope {
      display: inline-block;
    }
  </style>

  <span ref="localised" name="localised"><yield /></span>

  <script type="es6">
		this.on('mount', function() {
			// Did riot use V3 refs?
			this.hasRefs = this.refs != undefined
			this.localise()
		})

    this.on('update', function() {
			this.localise()
		})
		
		this.localise = () => {
			var refs = this.hasRefs ? this.refs : this;
			var innerHTML = typeof refs.localised !== 'undefined' ? refs.localised.innerHTML : '';
			if(innerHTML.length > 0) {
				refs.localised.innerHTML = i18n.localise(refs.localised.innerHTML);
			}
		}
  </script>
</localize>
