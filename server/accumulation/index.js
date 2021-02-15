
const Accumulation = require('./accumulation');

module.exports = {

  // дополняем и модифицируем конструкторы
	proto(constructor) {

	},

  // создаём экземпляр адаптера нашего типа
	constructor(){

		this.accumulation = new Accumulation(this);
	}
};
