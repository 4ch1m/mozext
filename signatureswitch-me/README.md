![Signature Switch](https://raw.githubusercontent.com/4ch1m/mozext/master/signatureswitch-me/src/_images/signatureswitch-64px-black.png)

# Signature Switch - MailExtension | [![Build Status](https://travis-ci.org/4ch1m/mozext.svg?branch=master)](https://travis-ci.org/4ch1m/mozext)
> A complete rewrite of the (XUL-based) [Signature Switch](../signatureswitch) add-on.

## ToC

* [How To](#how-to)
  * [Setup](#setup)
  * [Install](#install)
  * [Build](#build)
* [Credits](#credits)
  * [Used Libraries](#used-libraries)
  * [Other than that](#other-than-that)
* [License](#license)

## How To

### Setup

```
git clone https://github.com/4ch1m/mozext.git
cd mozext
git submodule init
git submodule update
cd signatureswitch-me
```

### Install

```
npm install
```

### Build

```
npm run build
```
(Builds a zip-archive in a folder called `web-ext-artifacts`.)

## Credits

### Used Libraries

* [Bootstrap](https://getbootstrap.com/)
* [Bootstrap Icons](https://icons.getbootstrap.com/)
* [Popper](https://popper.js.org/)
* [MDBootstrap](https://mdbootstrap.com/)
* [mustache](https://mustache.github.io/)
* [uuid](https://www.npmjs.com/package/uuid)
* [web-ext](https://www.npmjs.com/package/web-ext)
* [jest](https://github.com/facebook/jest)
* [rewire](https://github.com/jhnns/rewire)
* [copy](https://github.com/jonschlinkert/copy)

### Other than that

* Signature Switch icon courtesy of [Font Awesome](https://fontawesome.com)
* custom HTML-i18n heavily inspired by [HTML-Internationalization](https://github.com/erosman/HTML-Internationalization)
* arrayMove-function based on [array-move](https://github.com/sindresorhus/array-move)

## License

Please read the [LICENSE](../LICENSE) file.
