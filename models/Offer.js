const mg = require("mongoose");

const Offer = mg.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: Object,
  owner: {
    type: mg.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
