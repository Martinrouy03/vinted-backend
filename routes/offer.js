const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");
const User = require("../models/User");
const fileUpload = require("express-fileupload");
const { isValidObjectId } = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  CLOUD_NAME: "dely6vwul",
  API_KEY: "126619167113696",
  API_SECRET: "yfYc9VWO5sKChrh_ZFiZmlzi-os",
});

const toBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const myToken = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: myToken });
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized." });
    }
  } else {
    res.status(401).json({ message: "Unauthorized." });
  }
};

router.post(
  "/offers/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      let newUpload = null;
      if (req.files) {
        const convertedFile = toBase64(req.files.picture) || null;
        newUpload = await cloudinary.uploader.upload(convertedFile, {
          folder: `vinted/offers/${req.user._id}`,
        });
      }

      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: newUpload,
        owner: req.user._id,
      });
      await newOffer.save();
      await newOffer.populate("owner", "account");
      res.status(200).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    let limitNb = 3;
    const filters = {};
    const sorting = {};
    let { title, priceMin, priceMax, sort, page } = req.query;
    if (title) {
      const myregex = new RegExp(title, "i");
      filters.product_name = myregex;
    }
    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    } else if (priceMax) {
      filters.product_price = { $lte: priceMax };
    } else if (priceMax && priceMin) {
      filters.product_price = { $gte: priceMin, $lte: priceMax };
    }
    // if (priceMin || priceMin) {
    //   filters.product_price = { $lte: priceMax || 1e10, $gte: priceMin || 0 };
    // }
    if (sort) {
      sorting.product_price = sort.replace("price-", "");
    }

    let skip = 0;
    if (page) {
      skip = (page - 1) * limitNb;
    }
    const offers = await Offer.find(filters)
      .skip(skip)
      .limit(limitNb)
      .sort(sorting)
      .populate("owner", "account");
    const count = await Offer.countDocuments(filters);
    const output = {
      count: count,
      offers: offers,
    };
    res.status(200).json(output);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", isAuthenticated, async (req, res) => {
  try {
    if (isValidObjectId(req.params.id)) {
      const offer = await Offer.findById(req.params.id).populate(
        "owner",
        "account"
      );
      res.status(200).json(offer);
    } else {
      res.status(400).json({ message: "Invalid ID." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
