Mutate [![codecov](https://codecov.io/gh/paralin/mutate/branch/master/graph/badge.svg)](https://codecov.io/gh/paralin/mutate) [![Coverage Status](https://coveralls.io/repos/github/paralin/mutate/badge.svg?branch=master)](https://coveralls.io/github/paralin/mutate?branch=master) [![Build Status](https://travis-ci.org/paralin/mutate.svg?branch=master)](https://travis-ci.org/paralin/mutate) [![Go Report Card](https://goreportcard.com/badge/github.com/paralin/mutate)](https://goreportcard.com/report/github.com/paralin/mutate)
======

A mutation is a descriptor of operations on a source object to produce a desired result object. This package compares two objects and generates an object that describes what changed between the two input objects, and then can apply that mutation to the source object to produce the target object.


Mutators
========

Input objects are generic JSON (string key -> any value). To describe mutations, we reserve the `$` character as a prefix to an operation.

Given this initial state:

```json
{
  "myarr": [3, 1],
  "myarr2": [10, 11],
  "mystring": "hi",
  "myobject": {
    "mynestedstring": "hello"
  }
}
```

Add this mutation:

```json
{
  "myarr": {"$push": [5]},
  "myarr2": {"$set": [1]},
  "mystring": "hello",
  "myobject": {
    "mynestedstring": {"$set": "kappa"}
  }
}
```

The result would be:

```json
{
  "myarr": [3, 1, 5],
  "myarr2": [1],
  "mystring": "hello",
  "myobject": {
    "mynestedstring": "kappa"
  }
}
```

The following are the general rules of mutations:

 - A pure value for a non-object field implies a `$set` operation.
 - Whole object trees can never be set by pure values, a `$set` operation is required.
 - If a value object has one or more `$` prefixed fields, it is considered a mutation object and will be parsed as such.

The following are possible mutations, and will be evaluated in this order:

 - `$set`: completely overwrite the field value
 - `$push`: add to an end of an array. If the field is not currently an array, creates a new empty array and pushes the values.
 - `$pull`: remove from an array. Argument is an array of indexes to delete, pre-mutation (for example, removing `1` and `2` from `[0, 5, 2, 3, 1, 9]` would be `$pull: [4, 2]`).
 - `$truncate`: remove from an index in an array onwards.
 - `$mutateIdx`: mutate at indexes.
 - `$unset`: unset a field value.

Usage
=====

You can call `mutation := BuildMutation(oldObject, newObject)` to produce a mutation from two input objects. You can then call `result := ApplyMutationObject(oldObject, mutation)`, and `result` will be exactly equal to `newObject`.
