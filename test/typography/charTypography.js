var charTypography = require('../../typography/charTypography');

describe("charTypography", function() {

  it("replaces char sequences", function() {
    var data = 'My (c) -- 1 +- -> b <- 2 ...';
    charTypography(data).should.eql("My © — 1 ± → b ← 2 …");
  });

  it("replaces smiles", function() {
    var data = 'Works :)) Needspacebefore:) :)Punctafter :()';
    charTypography(data).should.match(/^Works <img src=".*?" alt="Smile">\) Needspacebefore:\) :\)Punctafter <img src=".*?" alt="Sad Smile">\)$/);
  });

});
