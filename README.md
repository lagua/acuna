acuna
=====
Acuna is a language for the web. It is an attempt to unify HTML, XML, JSON, javascript and CSS in a single syntax, and to provide a common practice. The name can be read as an acronym: "A concatenative unified notation attempt". The notation itself is simply called Una, which also serves as the extension for Acuna files. For a sample view master/tests/test.una


First and foremost, Una represents data, but there is more. Acuna is a programming language. It is highly transportable and agile. It has, however, two reserved keywords: USE and DEFINE. With these words the program can be constructed very modularly. USE loads a module or data from a url and binds it to a word. DEFINE creates a new word, and can be used inline or in a module. The lines following DEFINE should be used to describe the module or data.

Acuna is inspired by concatenative programming: functions are applied on a stack, and there are no temporary variables or anonymous functions. Modules can be written in Una, but they can also just be written in javascript, or any language that will parse to javascript, as long as it returns a function that will take the following arguments: *stack*, *args* & *context*. It will be assigned to a keyword using USE.

The concept of Acuna is very much related to jQuery's function chaining. You query the DOM, and run the result through a series of functions in order to process it. When the DOM is queried, Acuna associates the it with a light-weight JavaScript "widget" object, that can be used to address additional functionality and data, without touching the presentation proper.

For more info on Acuna visit http://wshager.blogspot.nl/
