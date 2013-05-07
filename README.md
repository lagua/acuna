Acuna
=====
Acuna is a language for the web. It is an attempt to unify HTML, XML, JSON, javascript and CSS in a single syntax, and to provide a common practice. The name can be read as an acronym: "A concatenative unified notation attempt". The notation itself is simply called Una, which also serves as the extension for Acuna files. In Una there are no commas or brackets. Strings are quoted and integers are interpreted as is. Arrays are simply lists of strings and/or integers. Nesting is achieved by using line breaks and indentation (whitespace is interpreted!). View a [sample file](tests/test.una).

First and foremost, Una represents data, but there is more. Acuna is a programming language. It is highly transportable and agile. It has, however, two reserved keywords: USE and DEFINE. With these words the program can be constructed very modularly. USE loads a module or data from a url and binds it to a word. DEFINE creates a new word, and can be used inline or in a module. The lines following DEFINE should be used to describe the module or data.

Acuna is inspired by concatenative programming: functions are applied on a stack, and there are no temporary variables or anonymous functions. Modules can be written in Una, but they can also just be written in javascript, or any language that will parse to javascript, as long as it returns a function that will take the following arguments: *stack*, *args* & *context* and returns a stack in turn. The context is provided to keep track of anything beyond the stack (i.e. metadata).

For more info on Acuna visit http://wshager.blogspot.nl/
