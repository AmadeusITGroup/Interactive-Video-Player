<template-large>
  <div class={"flex-container" : true}>
    <carousel class="col" photos={opts.photos} editable={opts.editable} marker={opts.marker}></carousel>
    <div class="col">
      <div class={
          "details-wrapper": true, 
          "default" :  opts.type === TemplateType.Default,  
          "expanded" : !parent.hasCtaLink(opts.marker, opts.cfg), 
          "shrinked" : opts.type === TemplateType.Mixed}>
        <h1>
          <span class="name" if={opts.marker && opts.marker.poi_name}>{opts.marker.poi_name}</span>
          <span class="no-data" if={!opts.marker || !opts.marker.poi_name}>
            <localize>template.label.notitle</localize> 
          </span>
        </h1>
        <div class="tips-wrapper" if={opts.type !== TemplateType.Mixed}>
          <blockquote>
            <span class="tips" if={parent.hasTips(opts.marker)}> {opts.marker.tips_description} </span>
            <span class="no-data" if={!parent.hasTips(opts.marker)}>
              <localize>template.label.notips</localize> 
            </span>
          </blockquote>
        </div>
      </div>
      <div class={"map-wrapper": true, "flex-container": true, expanded: opts.type === TemplateType.Default || opts.type === TemplateType.Mixed , highlighted :opts.type === TemplateType.Hotel}>
        <static-map class={col : opts.type === TemplateType.Hotel} marker={opts.marker} cfg={opts.cfg}/>
        <hotel class="col hotel" cfg={opts.cfg} marker={opts.marker} editable={opts.editable} if={opts.type === TemplateType.Hotel}/>
      </div>
      <div class={"data-wrapper": true, highlighted : opts.type !== TemplateType.Hotel} 
           if={opts.type !== TemplateType.Default}>
        <div class="flex-container" if={opts.type === TemplateType.Destination || opts.type === TemplateType.Mixed}>
          <flight class="col flight" marker={opts.marker} editable={opts.editable}/>
          <budget class="col budget" marker={opts.marker} editable={opts.editable}/>
        </div>

        <div class="flex-container" if={opts.type === TemplateType.Hotel || opts.type === TemplateType.GoingOut}>
          <address class="col address" marker={opts.marker} />
          <additional-info class="col contact" marker={opts.marker} />
        </div>

        <div class="flex-container" if={opts.type === TemplateType.Tour}>
          <tour class="tour" cfg={opts.cfg} marker={opts.marker} editable={opts.editable}/>
        </div>
      </div>
      <div class="actions-wrapper" if={parent.hasCtaLink(opts.marker, opts.cfg)}>
        <div class="cta">
          <a href={getCTALink()} target="_blank" onclick={parent.onCtaLink.bind(this)}>
            {parent.getCTALabel(opts.marker, opts.cfg)}
          </a>
        </div>
      </div>
    </div>
  </div>
  <script type="es6">
    import TemplateType from "../../../scripts/enums/template"; 
    
    import "./components/carousel.tag";
    import "./components/map/static.tag";
    import "./components/hotel.tag";
    import "./components/flight.tag";
    import "./components/budget.tag";
    import "./components/address.tag";
    import "./components/additional-info.tag";
    import "./components/tour.tag";

    this.TemplateType = TemplateType;

    this.getCTALink = () => {
      return this.parent.getCTALink(opts.marker, opts.cfg);
    }
  </script>
</template-large>
