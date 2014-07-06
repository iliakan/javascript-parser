var transliterate = require('../../util/transliterate');

describe("transliterate", function() {

  it("changes russian/ukrainian letters to similarly sounding latin", function() {
    transliterate('краковяк').should.be.eql('krakovyak');
    transliterate('ОГОГО').should.be.eql('OGOGO');
    transliterate('Вьюга').should.be.eql('Vyuga');
  });

});