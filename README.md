passport-siphonsimple
=====================

[Siphon.IO](http://www.siphon.io/) Simple SSO strategy for Passport.

Overview
--------

This module is an interim solution for Siphon.IO related SSO functionality. It
will be superseded in normal use by a fully featured SAML implementation.

Despite this, it *is* a fully featured authentication solution, and is quite
secure. It takes advantage of public/private key signatures for requests and
responses to avoid any necessity for inter-server communication via any channel
other than the operating agent.

The server component is not open source and probably will not be released. As
such, this module is only useful if you're authenticating users with internal
Siphon.IO services, or if you want a really simple example of how to do a 
multi-step redirection-based [passport.js](http://passportjs.org/) strategy.

Installation
------------

> $ npm install passport-siphonsimple

OR

> $ git clone git://github.com/siphon-io/passport-siphonsimple.git node_modules/passport-siphonsimple

Usage
-----

This is pretty much it for how to use it.

```javascript
#!/usr/bin/env node

var express = require("express"),
    passport = require("passport"),
    SiphonSimpleStrategy = require("passport-siphonsimple");

passport.use("siphon", new SiphonSimpleStrategy({
  // this is the authentication provider URL
  provider_url: "http://provider.example.com/authenticate",
  provider_public_key: "-----BEGIN PUBLIC KEY-----\n...",
  consumer_url: "http://consumer.example.com/login",
  consumer_private_key: "-----BEGIN RSA PRIVATE KEY-----\n...",
  // this is optional - it's the expiry time in ms for requests
  request_ttl: 1000 * 60,
}));

// ... express app setup ...

app.get("/login", passport.authenticate("siphon", {
  successRedirect: "/",
  failureRedirect: "/login",
}));
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([siphon-io](http://github.com/siphon-io))
* Email ([opensource@siphon.io](mailto:opensource@siphon.io))
