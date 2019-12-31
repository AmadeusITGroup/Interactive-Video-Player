import * as Riot from 'riot';
import {waitsFor} from './utils';

export function hostTag(tagName:string, api:any, mixin?:string, additionalStyling?:string):Riot.TagInstance {
  const opts = Object.keys(api).reduce((accumulator, currentValue) => `${accumulator} ${currentValue}={opts.${currentValue}}`, '');
  additionalStyling = additionalStyling || '';
  Riot.tag(
    'host', 
    `<div class="theme-avs" 
          style="width: 215px;
                 height: 154px;
                 position: absolute;
                 bottom: 1rem;
                 right: 1rem;${additionalStyling}">
      <div class="avs-test-player" style="background:transparent;">
        <div class="template" style="width:100%; height:100%;">
          <${tagName} ${opts} ref="${tagName}" class="${tagName}"></${tagName}>
        </div>
      </div>
    </div>`,
    '',
    '',
    function(opts) {
      this.played = opts.played || false;
      this.openPanel = () => {console.log('Faking panel opening');}
      
      if(typeof mixin !== 'undefined') {
        this.mixin(mixin);
      }
    });
  return Riot.mount('host', api)[0] as Riot.TagInstance;
}

export function mount(id:string, tagName:string, opts:any, additionalMixin?:string, additionalStyling?:string):Promise<{host:Riot.TagInstance, tag:Riot.TagInstance}> {
  return new Promise((resolve) => {
    const fixtureStr:string = `<host id="${id}"></host>`;
    document.body.insertAdjacentHTML(
      'afterbegin', 
      fixtureStr);
    const host = hostTag(tagName, opts, additionalMixin, additionalStyling);
    const tag = host.refs[tagName] as Riot.TagInstance;
    waitsFor(() => tag.isMounted).then(() => resolve({ host: host, tag : tag }));
  });
}

export function unmount(id:string, toUnmount: {host:Riot.TagInstance, tag:Riot.TagInstance}):Promise<any> {
  return new Promise((resolve) => {
    toUnmount.host.on('unmount', resolve);
    toUnmount.tag.unmount();
    toUnmount.host.unmount();

    const el = document.querySelector(`#${id}`);
    if(el) {
      el.parentNode.removeChild(el);
    }
  });
}

export function update(tag:Riot.TagInstance, force:boolean) {
  if(force) {
    tag.currentID = null;
  }
  tag.update();
}