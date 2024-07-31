# What is this?

The v2 examples from: https://github.com/xenova/transformers.js/tree/main/examples

# To Do

 - Convert last examples to build-free + RTI
 - Support Transformers V3 in general
 - Port V3 examples aswell

# Install

`npm install --omit=dev`

The dir `node_modules` will be about 410MB and ~10000 files on Linux, other OS'es may vary. Any suggestion to reduce this size is welcome!

# Using

Just clone this repo in your `/var/www` web root and use e.g. Chrome to open an example. Since this is mostly build-free, you don't need to run any further `npm` commands. Some examples are not yet ported tho (e.g. `Next.js` ones).

# Runtime Type Inspector Integration

Every example can be type-debugged by adding `?rti` to the URL. The RTI `TypePanel` will appear.

More information about RTI: https://github.com/kungfooman/RuntimeTypeInspector.js