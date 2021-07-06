# "Native Messaging" for Signature Switch

Table of Contents
=================

* [General Documentation](#general-documentation)
* [Setup](#setup)
* [Message Specifications](#message-specifications)
    * [Signature Switch](#signature-switch)
    * [Native app](#native-app)
* [Helpers](#helpers)

## General Documentation

These sources give in-depth information on how native messaging works:

* [MDN Web Docs | Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
* [GitHub | webextensions-examples / native-messaging](https://github.com/mdn/webextensions-examples/tree/master/native-messaging)
* [Thunderbird WebExtension APIs | ComposeDetails](https://thunderbird-webextensions.readthedocs.io/en/latest/compose.html#compose-composedetails)

## Setup

Your local setup to connect Thunderbird/Signature Switch with a native app contains of three basic steps:

1. Put the *native application* ([signatureswitch.js](native-messaging-hosts/signatureswitch.js)) somewhere on your computer and make sure it's executable.  
   (Can/should be your own customized application.)
2. Put the *app manifest* ([signatureswitch.json](native-messaging-hosts/signatureswitch.json)) in the correct place (see "[Manifest location](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location)").
3. Adjust the `path`-attribute inside the *app manifest* to match with the location of **your** native application from step 1.  
   > ...  
   > "description": "Signature Switch host for native messaging",  
   > **"path": "/home/achim/signatureswitch.js",**  
   > "type": "stdio",  
   > ...

## Message Specifications

Important:
> [Each message is serialized using JSON, UTF-8 encoded and is preceded with a 32-bit value containing the message length in native byte order.](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side)

In other words... the native application needs to separate a preceding meta-data chunk from the actual payload when handling both incoming and outgoing messages.  
(Check the sample app [signatureswitch.js](native-messaging-hosts/signatureswitch.js); search for `readUInt32LE` or `writeUInt32LE`.)

### Signature Switch

The actual data being sent from Signature Switch to the native app is a JSON-object with these attributes:

```
{
    tag: "yourArbitraryTag"
    isPlainText: true,
    type: "reply"
}
```
The values for ...

* isPlainText
* type

... are fetched from the mail's [ComposeDetails](https://thunderbird-webextensions.readthedocs.io/en/latest/compose.html#compose-composedetails) before sending the native message.

### Native app

Signature Switch expects the native application to send back a JSON-object with a `message`-attribute.

```
{
    message: "individual content"
}
```

Note:
> [The maximum size of a single message from the application is 1 MB.](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side)

## Helpers

A few [test-helpers](test) in case you want to adjust the [example app](native-messaging-hosts/signatureswitch.js) or create your own:

* [message.json](test/message.json) represents a message that gets sent from Signature Switch to the native app
* [prepare-message.js](test/prepare-message.js) will do the necessary calculations for the necessary payload-length-prefix on a given input-file/message (and writes the "formatted" message to a temporary file)
* [_test.sh](test/_test.sh) prepares the message and sends it to the native app via stdin

That way you can test your native app without running Thunderbird.
