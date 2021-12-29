![NestedQuote Remover](https://raw.githubusercontent.com/4ch1m/mozext/master/nestedquoteremover-me/src/_images/nestedquoteremover-64px-black.png)

# NestedQuote Remover - MailExtension
> A complete rewrite of the (XUL-based) [NestedQuote Remover](../nestedquoteremover) add-on.

## ToC

* [How To](#how-to)
  * [Setup](#setup)
  * [Install](#install)
  * [Build](#build)
* [Credits](#credits)
* [License](#license)

## How To

### Setup

```
git clone https://github.com/4ch1m/mozext.git
cd mozext
git submodule init
git submodule update
cd nestedquoteremover-me
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

* NestedQuote Remover icon courtesy of [Font Awesome](https://fontawesome.com)
* custom HTML-i18n heavily inspired by [HTML-Internationalization](https://github.com/erosman/HTML-Internationalization)

## License

Please read the [LICENSE](../LICENSE) file.
