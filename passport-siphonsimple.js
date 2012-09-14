#!/usr/bin/env node

var crypto = require("crypto"),
    passport = require("passport"),
    url = require("url"),
    util = require("util");

var SiphonSimpleStrategy = module.exports = function SiphonSimpleStrategy(options) {
  for (var k in options) {
    this[k] = options[k];
  }

  if (typeof this.request_ttl !== "number") {
    this.request_ttl = 1000 * 60;
  }
}

util.inherits(SiphonSimpleStrategy, passport.Strategy);

SiphonSimpleStrategy.prototype.authenticate = function(req, options) {
  if (req.param("response") && req.param("signature")) {
    var response;

    try {
      response = JSON.parse(Buffer(req.param("response"), "base64").toString());
    } catch (e) {
      return this.error(e);
    }

    if (!response.valid_from || !response.valid_to || !response.token || !response.user) {
      return this.error(Error("response missing required fields"));
    }

    response.valid_from = new Date(response.valid_from);
    response.valid_to = new Date(response.valid_to);

    if (!response.valid_from || !response.valid_to) {
      return this.error(Error("response validity times invalid"));
    }

    var now = new Date();

    if (response.valid_from > now || response.valid_to < now) {
      return this.error(Error("response has expired"));
    }

    if (response.token !== req.session.token) {
      return this.error(Error("token is incorrect"));
    }

    if (!crypto.createVerify("RSA-SHA256").update(Buffer(req.param("response"), "base64")).verify(this.provider_public_key, req.param("signature"), "base64")) {
      return this.error(Error("signature is incorrect"));
    }

    req.authentication = {
      state: response.state,
    };

    if (response.user) {
      return this.success(response.user);
    } else {
      return this.fail(response.error);
    }
  }

  req.session.token = crypto.randomBytes(40).toString("hex");

  var request = Buffer(JSON.stringify({
    token: req.session.token,
    state: req.authentication.state,
    valid_from: new Date().toISOString(),
    valid_to: new Date(new Date().valueOf() + this.request_ttl).toISOString(),
    redirect_to: this.consumer_url,
  }));

  var request_url = url.parse(this.provider_url, true);

  request_url.query.request = request.toString("base64");
  request_url.query.signature = crypto.createSign("RSA-SHA256").update(request).sign(this.consumer_private_key, "base64");

  return this.redirect(url.format(request_url));
};
