This directory contains heuristic functions for evaluating listings. Each file
in the directory should export one or more functions which receive as arguments
an ad and a callback function. The callback receives two arguments: an error and
a numeric score. The score should be from 0 (bad) to 100 (perfect). If the
error parameter is given as non-null, score calculation will be retried later.

No registration or configuration of functions is necessary. If it's in this
directory and it's a .js file, it will be used.
