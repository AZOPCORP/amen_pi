(function( window ){

  window.Crusher = Crusher;

  function Crusher( ctx, bits, reduction ) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.pro = ctx.createScriptProcessor(4096, 2, 2);
    this.bits = bits || 16;
  
    this.reduction = reduction || 0.2;
    this.init();

    
  }



  Crusher.prototype.init = function() {
    this.input.connect(this.pro);
    this.pro.onaudioprocess = this.crush.bind(this);
    return this;
  };
  
  Crusher.prototype.connect = function( node ) {
    this.pro.connect(node);
    return this;
  };
  
  Crusher.prototype.disconnect = function() {
    this.pro.disconnect();
    return this;
  };
  
  Crusher.prototype.crush = function( e ) {
    var inp = e.inputBuffer,
      out = e.outputBuffer,
      iL = inp.getChannelData(0),
      iR = inp.getChannelData(1),
      oL = out.getChannelData(0),
      oR = out.getChannelData(1),
      step = Math.pow(0.5, this.bits - 1),
      len = inp.length,
      sample = 0,
      lastL = 0,
      lastR = 0,
      i = 0;
    for ( ; i < len; ++i ) {
      if ( (sample += this.reduction) >= 1 ) {
        sample--;
        lastL = step * Math.floor(iL[i] / step);
        lastR = step * Math.floor(iR[i] / step);
      }
      oL[i] = lastL;
      oR[i] = lastR;
    }
  };
  
}(this));
