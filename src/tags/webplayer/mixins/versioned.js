class VersionedMixin  {
  getVersion() {
    let id = '';
    let keys = this.getVersioningKeys();
    const get = (p, o) =>
        p.split('.').reduce((xs, x) => (xs && xs.hasOwnProperty(x)) ? xs[x] : null, o);
    return keys.map(k => get(k, this)).reduce((accumulator, current) => `${current}${accumulator}`, '');
  }

  getVersioningKeys() { return ['opts.marker.place_id']; }
}

riot.mixin('versioned', new VersionedMixin());
