# AkunX
Extends functionality on Akun.

AkunX has been written in a modular fashion with the intention of making it easy for
others to write their own modules that integrate with it. There are no docs currently
so if you're interested in creating new modules for it you'll be stuck using some of
the 'official' modules as examples until I get round to it.

Personally written modules can be contributed to this repo or just used to do generate
personal builds of AkunX.

### [Click to Install](https://github.com/Fiddlekins/akun-x/raw/master/dest/akun-x.user.js)
Or if you don't want automatic updates use [this version](https://github.com/Fiddlekins/akun-x/raw/master/dest/akun-x-noupdate.user.js).
### Chrome:
Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), then click the link above to install AkunX.
### Firefox:
Install [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) as well since Greasemonkey doesn't work properly anymore, then click the link above to install AkunX.

## Features
#### Settings menu
 - This can be accessed by clicking the AkunX link at the bottom of Akun's main menu
 - Here you can configure the settings of each module
 
The following are modules included with the 'official' AkunX build:
#### Anon Toggle
 - Adds a button that can be used to easily toggle between posting with and without name
#### Chapter HTML Editor
 - Adds a button beside the chapter edit button that enables editing of the raw HTML used
for the chapter
#### Image Toggle
 - Allows you to hide various types of image on the site (to avoid unwelcome PROMOTIONS)
 - Has support for a keybind that quickly toggles it on and off
#### Linker
 - Recognises plaintext URLs in posts and chapters and replaces them with hyperlinks
 - Can recognise images and videos hosted on sites specified in the settings and embed
  these directly into the page
#### Live Images
 - Adds the story cover image to the list of Live stories 

## Building AkunX
Do `npm run build` to rebuild the userscripts from the source.
