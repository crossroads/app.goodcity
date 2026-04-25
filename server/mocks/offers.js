module.exports = function(app) {
  var express = require("express");
  var offersRouter = express.Router();
  var image_id = "1407764294/default/test_image.jpg";

  var offers_json = {
    offers: [
      { id: "1", state: "draft", item_ids: ["1", "2"], delivery_id: null },
      { id: "2", state: "draft", delivery_id: null },
      { id: "3", language: "en", created_by_id: "1", delivery_id: null },
      {
        id: "4",
        language: "en",
        state: "under_review",
        created_by_id: "1",
        item_ids: ["4", "5"],
        delivery_id: null,
        reviewed_by_id: "2"
      }
    ],
    items: [
      {
        id: "1",
        donor_description: "example1",
        offer_id: "1",
        image_ids: ["1", "2"]
      },
      { id: "2", donor_description: "example2", offer_id: "1" },
      {
        id: "4",
        donor_description: "Velit fugit amet quos ut minima quis",
        offer_id: "4",
        donor_condition_id: "1",
        image_ids: ["1"],
        state: "submitted"
      },
      {
        id: "5",
        donor_description: "test",
        offer_id: "4",
        donor_condition_id: "1",
        image_ids: ["1"],
        state: "accepted"
      }
    ],
    images: [
      { id: "1", favourite: "false", cloudinary_id: image_id },
      { id: "2", favourite: "true", cloudinary_id: image_id }
    ],
    addresses: [
      {
        id: 1,
        street: null,
        flat: null,
        building: null,
        district_id: null,
        addressable_type: "User",
        addressable_id: 1
      }
    ],
    messages: [
      {
        id: "1",
        body: "I have made an offer.",
        state: null,
        sender_id: "1",
        is_private: false,
        offer_id: "4",
        item_id: null
      }
    ],
    users: [
      {
        id: "1",
        first_name: "Kendrick",
        last_name: "Kiehn",
        permission_id: null
      },
      {
        id: "2",
        first_name: "Jaleel",
        last_name: "Ondricka",
        permission_id: "2"
      }
    ]
  };

  var offer_json = {
    offer: { id: "1", state: "draft", item_ids: ["1", "2"], delivery_id: null },
    items: [
      {
        id: "1",
        donor_description: "example1",
        offer_id: "1",
        image_ids: ["1", "2"]
      },
      { id: "2", donor_description: "example2", offer_id: "1" },
      {
        id: "4",
        donor_description: "Velit fugit amet quos ut minima quis",
        offer_id: "4",
        donor_condition_id: "1",
        image_ids: ["1"],
        state: "submitted"
      },
      {
        id: "5",
        donor_description: "test",
        offer_id: "4",
        donor_condition_id: "1",
        image_ids: ["1"],
        state: "accepted"
      }
    ],
    images: [
      { id: "1", favourite: "false", cloudinary_id: image_id },
      { id: "2", favourite: "true", cloudinary_id: image_id }
    ],
    addresses: [
      {
        id: 1,
        street: null,
        flat: null,
        building: null,
        district_id: null,
        addressable_type: "User",
        addressable_id: 1
      }
    ],
    messages: [
      {
        id: "1",
        body: "I have made an offer.",
        state: null,
        sender_id: "1",
        is_private: false,
        offer_id: "1",
        item_id: null
      }
    ],
    users: [
      {
        id: "1",
        first_name: "Kendrick",
        last_name: "Kiehn",
        permission_id: null
      },
      {
        id: "2",
        first_name: "Jaleel",
        last_name: "Ondricka",
        permission_id: "2"
      }
    ]
  };

  var updated_offer_json = {
    offer: {
      id: "101",
      state: "submitted",
      item_ids: ["1", "2"],
      delivery_id: null
    }
  };

  offersRouter.get("/", function(req, res) {
    res.send(offers_json);
  });

  offersRouter.get("/invalid", function(req, res) {
    res.statusCode = 404;
    res.send({});
  });

  offersRouter.get("/:id", function(req, res) {
    res.send(offer_json);
  });

  offersRouter.delete("/:id", function(req, res) {
    res.send({});
  });

  offersRouter.put("/:id", function(req, res) {
    res.send(updated_offer_json);
  });

  offersRouter.post("/", function(req, res) {
    res.send({
      offers: [{ id: "3", state: "draft" }]
    });
  });

  app.use("/api/v1/offers", offersRouter);
  app.use("/api/v1/offers/:id", offersRouter);
};
