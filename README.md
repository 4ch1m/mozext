# mozext
> Extensions / Add-Ons for Mozilla Firefox and Mozilla Thunderbird

Please check my dedicated website for more detailed information:

&rarr; [www.achimonline.de/mozext/](https://www.achimonline.de/mozext/)

Table of Contents
=================

* [WebExtensions / MailExtensions](#webextensions--mailextensions--)
  * [Thunderbird](#thunderbird)
  * [Firefox](#firefox)
* [Legacy XUL-/XPCOM-based Extensions](#legacy-xul-xpcom-based-extensions)
  * [Thunderbird](#thunderbird-1)
  * [Firefox](#firefox-1)
* [License](#license)


## WebExtensions / MailExtensions | [![Build Status](https://travis-ci.org/4ch1m/mozext.svg?branch=master)](https://travis-ci.org/4ch1m/mozext)

Please check the specific README-file in each folder for build-instructions.

### Thunderbird

* [Signature Switch ME](signatureswitch-me)
* [NestedQuote Remover ME](nestedquoteremover-me)

### Firefox

* TBD


## Legacy XUL-/XPCOM-based Extensions

I started developing these extensions back in 2005.

However, both [Firefox 57](https://www.mozilla.org/en-US/firefox/57.0/releasenotes/) and [Thunderbird 78](https://www.thunderbird.net/en-US/thunderbird/78.0/releasenotes/) dropped support for add-ons based on XUL- and XPCOM-APIs;
so I won't continue working with this codebase.

### Thunderbird

* [Signature Switch](signatureswitch)
* [NestedQuote Remover](nestedquoteremover)
* [NewMail Execute](newmailexecute)

### Firefox

* [Save Image in Folder](saveimageinfolder)
* [Save Link in Folder](savelinkinfolder)

To build them you'll need to have [Apache Ant](https://ant.apache.org/) and [XMLStarlet](http://xmlstar.sourceforge.net/) installed on your system.

Then simply change into the directory of an extension/add-on and run the `ant`-command.
This will create an installable XPI-file.

## License
Please read the [LICENSE](LICENSE) file.
