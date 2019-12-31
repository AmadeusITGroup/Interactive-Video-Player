
<raw>
  <script type="es6">
    this.root.innerHTML = opts.content;
    this.on('update', () => {
      this.root.innerHTML = opts.content;
    });
  </script>
</raw>