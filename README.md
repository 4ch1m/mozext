# mozext
> Extensions / Add-Ons for Mozilla Firefox and Mozilla Thunderbird

All of my **Moz**illa **Ext**ensions that I started developing in 2005.

Please check my dedicated website for more detailed information:

&rarr; [mozext.achimonline.de](http://mozext.achimonline.de/)

Table of Contents
=================

* [WebExtensions / MailExtensions](#webextensions--mailextensions)
  * [Thunderbird](#thunderbird)
  * [Firefox](#firefox)
  * [Build](#build)
    * [Overall Status](#overall-status)
    * [Instructions](#instructions)
* [XUL-/XPCOM-based Extensions (Legacy)](#xul-xpcom-based-extensions-legacy)
  * [Thunderbird](#thunderbird-1)
  * [Firefox](#firefox-1)
  * [Build](#build-1)
    * [Prerequisites](#prerequisites)
    * [Instructions](#instructions-1)
* [License](#license)

## WebExtensions / MailExtensions

### Thunderbird

* [Signature Switch ME](signatureswitch-me)
* [NestedQuote Remover ME](nestedquoteremover-me)

### Firefox

* TBD

### Build

#### Overall Status

[![Build Status](https://travis-ci.org/4ch1m/mozext.svg?branch=master)](https://travis-ci.org/4ch1m/mozext)

#### Instructions

Please check the specific README-file in each folder.

## XUL-/XPCOM-based Extensions (Legacy)

Both [Firefox 57](https://www.mozilla.org/en-US/firefox/57.0/releasenotes/) and [Thunderbird 78](https://www.thunderbird.net/en-US/thunderbird/78.0/releasenotes/) dropped support for add-ons based on XUL- and XPCOM-APIs;
so I won't continue working with this codebase.

### Thunderbird

* [Signature Switch](signatureswitch)
* [NestedQuote Remover](nestedquoteremover)
* [NewMail Execute](newmailexecute)

### Firefox

* [Save Image in Folder](saveimageinfolder)
* [Save Link in Folder](savelinkinfolder)

### Build

#### Prerequisites
* [Apache Ant](https://ant.apache.org/)
* [XMLStarlet](http://xmlstar.sourceforge.net/)

#### Instructions
Simply change to the directory of an individual extension/add-on and run the `ant`-command.
This will create an installable XPI-file.

## License
Please read the [LICENSE](LICENSE) file.
