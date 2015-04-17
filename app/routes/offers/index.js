import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  model: function() {
    // In donor app mode, only show offers made by this user
    //~ return this.store.all('offer');
    var current_user_id = parseInt(this.session.get('currentUser.id'));
    return this.store.filter('offer', function(offer) {
      return parseInt(offer.get('createdBy.id')) === current_user_id;
    });
  },

  afterModel: function(my_offers) {
    var route = this;
    switch(my_offers.get('length')) {
      case 0 : route.transitionTo('offers.new'); break;
      case 1 :
        if(my_offers.get('firstObject.state') === 'draft') {
          var firstOffer = my_offers.get('firstObject');
          if(firstOffer.get('itemCount') === 0) {
            route.transitionTo('offer', firstOffer);
          } else {
            route.transitionTo('offer.offer_details', firstOffer);
          }
        }
    }
  },

  renderTemplate: function() {
    this.render(); // default template
    this.render('appMenuList', {
      into: 'offers/index',
      outlet: 'appMenuList',
      controller: 'application'
    });
  }

});
