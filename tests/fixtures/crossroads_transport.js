var types = ["1/8 Truck", "2/8 Truck", "8/8 Truck"];

FactoryGuy.define('crossroads_transport', {
  default: {
    name: FactoryGuy.generate(function() {
      return types[Math.floor(Math.random()*(types.length))];
    }),
    cost: 200,
    isVanAllowed: true,
  },
  crossroads_transport_disabled: {
    name: "Disable",
    isVanAllowed: false
  },
});

export default {};
