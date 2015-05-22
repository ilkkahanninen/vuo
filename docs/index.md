# Vuo

Vuo is a library which makes implementing Flux architecture easier.

Flux is a uni-directional dataflow application architecture developed by Facebook
and it has gained a lot of support lately especially among the React users.

The downsides of flux architecture are its verbosity and the sort of enterprisey feeling in it.
Vuo makes writing flux applications lean and fun but still keeps the good in -
actually it provides even more: automatic data validation and RESTful server requests are
baked in.

# Goals

## Terse

Nobody likes to write a lot of code to do mundane things. Small code is also easier to
understand which leads to...

## Easy to read and understand

It's all fun and games when you want to use your esoteric technique to put your
application logic to a few lines of event streams or use some other kind of black magic.
The problems arise at the exact moment when somebody else have to maintain your code.

The code needs to be so easy that a developer with light understanding of Flux can start
to use it without reading through the documentation.

## 100% vanilla flux compatible

Do you have an application with vanilla flux architecture or you want to migrate to
another flux library? Great! Vuo makes things easy. You can keep your old code and
start to refactor the code one module by time without breaking the whole application.

# Installation

`npm install vuo`

# Contact

Vuo is written by Ilkka Hänninen (ilkka.hanninen@livion.fi)

# License

The MIT License (MIT)

Copyright (c) 2015 Ilkka Hänninen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
