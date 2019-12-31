<template-small>
  <div>
    <carousel class="photo-wrapper" photos={opts.photos} editable={opts.editable} marker={opts.marker}></carousel>
    <h1>
      <span class="name" if={opts.marker && opts.marker.poi_name}>{opts.marker.poi_name}</span>
      <span class="no-data" if={!opts.marker || !opts.marker.poi_name}>
        <localize>template.label.notitle</localize> 
      </span>
    </h1>
    <div class={"data-wrapper": true, highlighted : opts.type !== TemplateType.Default, expanded : !parent.hasCtaLink(opts.marker, opts.cfg)}>
      <div class="tips-wrapper" if={opts.type === TemplateType.Default}>
        <blockquote>
          <span class="tips" if={parent.hasTips(opts.marker)}> {opts.marker.tips_description} </span>
          <span class="no-data" if={!parent.hasTips(opts.marker)}>
            <localize>template.label.notips</localize> 
          </span>
        </blockquote>
      </div>
      <hotel class="hotel" cfg={opts.cfg} marker={opts.marker} editable={opts.editable} if={opts.type === TemplateType.Hotel}/>
      <flight class="flight" marker={opts.marker} editable={opts.editable} if={opts.type === TemplateType.Destination}/>
      <additional-info class="contact" marker={opts.marker} if={opts.type === TemplateType.GoingOut}/>
      <tour class="tour" cfg={opts.cfg} marker={opts.marker} editable={opts.editable} if={opts.type === TemplateType.Tour}/>
    </div>
    <div class="actions-wrapper" if={parent.hasCtaLink(opts.marker, opts.cfg)}>
      <div class="cta">
        <a href={getCTALink()} 
           target="_blank" 
           onclick={parent.onCtaLink.bind(this)}
        >{parent.getCTALabel(opts.marker, opts.cfg)}</a>
      </div>
    </div>
  </div>
  <script type="es6">
    import TemplateType from "../../../scripts/enums/template"; 

    import "./components/carousel.tag";
    import "./components/hotel.tag";
    import "./components/flight.tag";
    import "./components/additional-info.tag";
    import "./components/tour.tag";

    this.TemplateType = TemplateType;

    this.getCTALink = () => {
      return this.parent.getCTALink(opts.marker, opts.cfg);
    }
  </script>
</template-small>
