export class group{
  constructor(){
    this.childs = [];
    this.MOVE_MATRIX = LIBS.get_I4();
    this.POSITION_MATRIX = LIBS.get_I4(); // node local
  }
  setup(){ this.childs.forEach(c=>c.setup && c.setup()); }
  render(parent){
    const model = LIBS.multiply(parent, this.MOVE_MATRIX);
    this.childs.forEach(c=>c.render(model));
  }
  animate(t){ this.childs.forEach(c=>c.animate && c.animate(t)); }
}
