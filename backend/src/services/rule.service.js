const checkRule = (valeur, seuil) => {
  if (valeur > seuil) {
    return "detecte";
  }
  return "normal";
};

module.exports = { checkRule };
