import config from "./config/environment";
import GoodcityRouter from "shared-goodcity/router/router";
import googlePageview from "./mixins/google-pageview";

var Router = GoodcityRouter.extend(googlePageview, {
  location: config.locationType
});

Router.map(function() {
  this.route("tour");
  this.route("register");
  this.route("faq");
  this.route("account");
  this.route("delete_account");
  this.route("support");

  this.route("offers", function() {
    this.route("index", { path: "/" });
    this.route("new", { path: "/new" });

    this.route(
      "offer",
      { resetNamespace: true, path: "/:offer_id" },
      function() {
        this.route("index", { path: "/" });
        this.route("confirm");
        this.route("ios_notification");
        this.route("submit");
        this.route("plan_delivery");
        this.route("collection_charges");
        this.route("gogovan_charges");
        this.route("cancel");

        this.route("messages");

        this.route("offer_details");
        this.route("transport_details");

        this.route(
          "delivery",
          { resetNamespace: true, path: "/delivery/:delivery_id" },
          function() {
            this.route("book_timeslot");
            this.route("available_time_slots");
            this.route("contact_details");
            this.route("thank_offer");

            this.route("book_van");
            this.route("confirm_van");
            this.route("porterage_charges");

            this.route("drop_off_schedule");

            this.route("book_self_arranged_van");
            this.route("confirm_self_arranged_van");

            this.route("cancel_booking");
          }
        );

        this.route(
          "item",
          { resetNamespace: true, path: "/items/:item_id" },
          function() {
            this.route("index", { path: "/" });
            this.route("edit");
            this.route("edit_images");
            this.route("messages");
          }
        );
      }
    );
  });
});

export default Router;
