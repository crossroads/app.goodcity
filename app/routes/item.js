import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  model: function(params) {
    if (params.item_id === "new") {
      return null;
    }
    var item = this.store.getById("item", params.item_id);
    return (item ? item : this.resourceNotFound("item"));
  }
});
