# Install

`npm install --omit=dev`

The dir `node_modules` will be around 410MB and ~10000 files. Any suggestion to bring this size down is welcome!

# Using

Just clone this repo in your `/var/www` web root and use e.g. Chrome to open an example. Since this is mostly build-free, you don't need to run any further `npm` commands. Some examples are not yet ported tho (e.g. `Next.js` ones).

# Runtime Type Inspector Integration

Every example can be debugging by adding `?rti` to the URL. The RTI TypePanel will appear.
