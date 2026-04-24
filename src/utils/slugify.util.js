const slugify = require("slugify");

const makeSlug = (text) => {
  return slugify(text || "", {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
};

module.exports = {
  makeSlug,
};