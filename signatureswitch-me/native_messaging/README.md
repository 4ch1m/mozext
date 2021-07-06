# TODO ...

* [MDN Web Docs | Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
* [GitHub | webextensions-examples / native-messaging](https://github.com/mdn/webextensions-examples/tree/master/native-messaging)
* [Thunderbird WebExtension APIs | ComposeDetails](https://thunderbird-webextensions.readthedocs.io/en/latest/compose.html#compose-composedetails)

### Thunderbird / Signature Switch
#### message
```
{
    tag: "your-individual-tag"
    isPlainText: true,
    type: "reply"
}
```
The values for ...

* isPlainText
* type

... are fetched from the mail's [ComposeDetails](https://thunderbird-webextensions.readthedocs.io/en/latest/compose.html#compose-composedetails) before sending the native message.

### Native app
#### response
```
{
    message: "individual content"
}
```
