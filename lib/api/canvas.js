'use strict';

function changeToFullScreen(canvas) {

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

function createCanvas(canvas) {
    canvas = document.getElementsByTagName('CANVAS')[0];
    if(!canvas)
        canvas = document.createElement('CANVAS');

    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    canvas.setAttribute('style', 'position:absolute; left:0px; top:0px; border-style:none;');
    return canvas;
};


class Canvas{

  constructor(props){
    this.fullscreen = props.fullscreen;
    this.canvas     = createCanvas(props.element);
    try {

      this.gl = this.canvas.getContext("experimental-webgl");

      if (!this.gl)
          console.error('Error no webGL context :(');

      if (this.fullscreen) {
          changeToFullScreen(this.canvas);
          window.onresize = () => changeToFullScreen(this.canvas);
          window.onload   = () => changeToFullScreen(this.canvas);
      }

    }catch(e){
      console.error(e);
    }
  }

  getWebGL(){
    return this.gl;
  }

};


module.exports = Canvas;
