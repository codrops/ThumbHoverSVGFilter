import { gsap } from 'gsap';

export class Item {
    constructor(el) {
        this.DOM = {el: el};
        this.DOM.thumb = this.DOM.el.querySelector('.thumb');
        
        this.DOM.thumbSVG = this.DOM.thumb.querySelector('.distort');
        this.DOM.SVGFilter = this.DOM.thumbSVG.querySelector('filter');
        this.DOM.SVGImage = this.DOM.thumbSVG.querySelector('image.distort__img');
        gsap.set(this.DOM.SVGImage, {transformOrigin: '50% 50%'});
        
        // we will either animate the feTurbulence's baseFrequency value or the feDisplacementMap's scale value
        this.filterType = this.DOM.SVGFilter.dataset.type;
        // the feTurbulence elements per filter
        this.DOM.feTurbulence = this.DOM.SVGFilter.querySelector('feTurbulence');
        this.DOM.feDisplacementMap = this.DOM.SVGFilter.querySelector('feDisplacementMap');
        
        // (turbulence) baseFrequency or (displacementMap) scale current value
        this.primitiveValues = this.filterType === 'turbulence' ? {baseFrequency: 0} : {scale: 0};

        this.DOM.caption = this.DOM.thumb.querySelector('.thumb__caption');
        this.DOM.captionTitle = this.DOM.caption.querySelector('.thumb__caption-title');
        this.DOM.captionLink = this.DOM.caption.querySelector('.thumb__caption-link');
        
        this.DOM.meta = this.DOM.el.querySelector('.item__meta');
        this.DOM.metaCounter = this.DOM.meta.querySelector('.item__meta-counter');
        this.DOM.metaTitle = this.DOM.meta.querySelector('.item__meta-title');
        this.DOM.metaDetail = [...this.DOM.meta.querySelectorAll('.item__meta-detail')];

        this.createHoverTimeline();
        this.initEvents();
    }
    initEvents() {
        this.onMouseEnterFn = () => this.mouseEnter();
        this.DOM.thumb.addEventListener('mouseenter', this.onMouseEnterFn);
        this.onMouseLeaveFn = () => this.mouseLeave();
        this.DOM.thumb.addEventListener('mouseleave', this.onMouseLeaveFn);
    }
    updateFilterValues() {
        this[this.filterType === 'turbulence' ? 'updateTurbulenceBaseFrequency' : 'updateDisplacementMapScale']();
    }
    updateTurbulenceBaseFrequency(val = this.primitiveValues.baseFrequency) {
        this.DOM.feTurbulence.setAttribute('baseFrequency', val);
    }
    updateDisplacementMapScale(val = this.primitiveValues.scale) {
        this.DOM.feDisplacementMap.setAttribute('scale', val);
    }
    createHoverTimeline() {
        this.tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.7,
                ease: 'power2'
            },
            onUpdate: () => this.updateFilterValues(),
            onReverseComplete: () => {
                if ( this.filterType === 'turbulence' ) {
                    this.primitiveValues.baseFrequency = 0;
                    this.updateFilterValues();
                }
            }
        });

        if ( this.filterType === 'turbulence' ) {
            this.tl.to(this.primitiveValues, { 
                // (turbulence) baseFrequency
                startAt: {baseFrequency: 0.09},
                // animate to 0
                baseFrequency: 0
            }, 0);
        }
        else {
            this.tl.to(this.primitiveValues, { 
                // (displacementMap) scale start value
                startAt: {scale: 0},
                scale: 150
            }, 0);
        }

        this.tl.to(this.DOM.caption, {
            y: '0%'
        }, 0)
        .to([this.DOM.captionTitle,this.DOM.captionLink], {
            y: 0,
            startAt: {y: 100, opacity: 0},
            opacity: 1,
            stagger: 0.1
        }, 0)
        .to([this.DOM.metaCounter, this.DOM.metaTitle, this.DOM.metaDetail], {
            duration: 0.1,
            x: i => i % 2 == 0 ? '-5%' : '5%',
            opacity: 0,
            stagger: 0.05
        }, 0)
        .to([this.DOM.metaCounter, this.DOM.metaTitle, this.DOM.metaDetail], {
            duration: 0.5,
            ease: 'power3',
            startAt: {x: i => i % 2 == 0 ? '15%' : '-15%'},
            x: '0%',
            opacity: 1,
            stagger: 0.08
        }, 0.1);
        
        if ( navigator.userAgent.indexOf('Firefox') == -1 ) {
            this.tl.to(this.DOM.SVGImage, {
                scale: 1.2,
                //y: '-50%'
            }, 0)
        }
    }
    mouseEnter() {
        this.tl.restart();
    }
    mouseLeave() {
        this.tl.reverse();
    }
}