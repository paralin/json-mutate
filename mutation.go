package mutate

import (
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

//go:generate stringer -type=MutationType
type MutationType int

const (
	MutateSet MutationType = iota
	MutatePush
	MutatePull
	MutateTruncate
	MutateIdx
	MutateUnset
)

// Same order as above
var MutationKeys []string = []string{
	"$set",
	"$push",
	"$pull",
	"$truncate",
	"$mutateIdx",
	"$unset",
}

var MutationImpl []MutationImplementation = []MutationImplementation{
	&SetMutation{},
	&PushMutation{},
	&PullMutation{},
	&TruncateMutation{},
	&IndexMutation{},
	&UnsetMutation{},
}

type MutationImplementation interface {
	Apply(oldVal, arg interface{}) (interface{}, error)
}

type Mutation struct {
	MutationType MutationType
}

// Apply all mutations in a mutation object heirarchy recursively
func ApplyMutationObject(oldObj, mutations map[string]interface{}) (map[string]interface{}, error) {
	if oldObj == nil || mutations == nil || len(mutations) == 0 {
		return oldObj, nil
	}

	for k, v := range mutations {
		if v == nil {
			oldObj[k] = v
			continue
		}

		switch v.(type) {
		case map[string]interface{}:
			vsi := v.(map[string]interface{})
			if len(vsi) == 0 {
				continue
			}
			// check the first key to see if it's a mutation
			for mk, _ := range vsi {
				var newVal interface{}
				var err error
				if strings.HasPrefix(mk, "$") {
					newVal, err = ApplyMutation(oldObj[k], vsi)
					if err == nil {
						if _, ok := newVal.(*UnsetMarker); ok {
							delete(oldObj, k)
							break
						}
					}
				} else {
					// Recurse into the sub object
					ookv, ok := oldObj[k].(map[string]interface{})
					if !ok {
						return nil, errors.New("Cannot apply sub-mutation to primitive.")
					}
					newVal, err = ApplyMutationObject(ookv, vsi)
				}
				if err != nil {
					return nil, err
				}
				oldObj[k] = newVal
				break
			}
		// apply as a primitive
		default:
			oldObj[k] = v
		}
	}
	return oldObj, nil
}

// Apply a mutation object to a value
// Note: this changes the input
func ApplyMutation(oldVal interface{}, mutation map[string]interface{}) (interface{}, error) {
	// It's fastest to iterate over all known mutations in order
	for mi, mutationKey := range MutationKeys {
		arg, ok := mutation[mutationKey]
		if !ok {
			continue
		}
		mutt := &Mutation{MutationType: MutationType(mi)}
		newVal, err := mutt.Apply(oldVal, arg)
		if err != nil {
			return nil, err
		}
		oldVal = newVal
	}
	return oldVal, nil
}

// Returns a Mutation from a key like $set or nil if not found
func ParseMutation(key string) *Mutation {
	key = strings.ToLower(key)
	fi := -1
	for i, v := range MutationKeys {
		if v == key {
			fi = i
			break
		}
	}
	if fi == -1 {
		return nil
	}
	return &Mutation{
		MutationType: MutationType(fi),
	}
}

func (m *Mutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	return MutationImpl[int(m.MutationType)].Apply(oldVal, arg)
}

type SetMutation struct {
}

func (*SetMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	return arg, nil
}

type IndexMutation struct {
}

func (*IndexMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	oldArr, ok := oldVal.([]interface{})
	if !ok {
		return nil, errors.New("Cannot apply index mutation to non-slice type.")
	}

	argMap, ok := arg.(map[string]interface{})
	if !ok {
		return nil, errors.New("Index mutation arg must be a map.")
	}

	for k, v := range argMap {
		idx, err := strconv.Atoi(k)
		if err != nil {
			return nil, fmt.Errorf("Error parsing int in index mutation: %v", err)
		}
		if idx > len(oldArr)-1 || idx < 0 {
			return nil, errors.New("Index mutation idx out of range.")
		}
		vmutate, ok := v.(map[string]interface{})
		if !ok {
			// use a set
			oldArr[idx] = v
			continue
		}
		oldPos := oldArr[idx]
		var newVal interface{}
		if oldIdxObj, ok := oldPos.(map[string]interface{}); ok {
			newVal, err = ApplyMutationObject(oldIdxObj, vmutate)
		} else {
			newVal, err = ApplyMutation(oldPos, vmutate)
		}
		if err != nil {
			return nil, err
		}
		oldArr[idx] = newVal
	}
	return oldArr, nil
}

type PushMutation struct {
}

func (*PushMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	if oldVal == nil {
		return arg, nil
	}

	if arg == nil {
		return nil, errors.New("Argument of push mutation cannot be nil.")
	}

	argarr, ok := arg.([]interface{})
	if !ok {
		return nil, errors.New("Argument of push mutation must be an []interface{}")
	}

	switch oldVal.(type) {
	case []interface{}:
		return append(oldVal.([]interface{}), argarr...), nil
	default:
		return argarr, nil
	}
}

type PullMutation struct {
}

func (*PullMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	if oldVal == nil {
		return nil, nil
	}

	argArr, ok := arg.([]interface{})
	if !ok {
		return nil, errors.New("Argument to a pull mutation must be an []interface{}")
	}

	oldArr, ok := oldVal.([]interface{})
	if !ok {
		return nil, errors.New("Cannot pull from non-array field.")
	}

	// Build array of indexes
	indexes := make([]int, len(argArr))
	for i, idxi := range argArr {
		var idx int
		switch idxi.(type) {
		case float64:
			idx = int(idxi.(float64))
		case int:
			idx = idxi.(int)
		default:
			return nil, errors.New("Argument to a pull mutation must be an array of integers.")
		}

		indexes[i] = idx
	}

	indexCount := len(indexes)
	if indexCount == 0 {
		return oldVal, nil
	}

	// sort indexes
	sort.Ints(indexes)

	// build output slice
	resLen := len(oldArr) - indexCount
	res := make([]interface{}, resLen)

	// output index
	oi := 0
	// next index to ignore
	nextIgnore := indexes[0]
	// ignore index (current)
	ii := 0
	for i, val := range oldArr {
		if nextIgnore != -1 && i == nextIgnore {
			ii++
			// if we are out of indexes to ignore
			if ii == indexCount {
				nextIgnore = -1
			} else {
				nextIgnore = indexes[ii]
			}
			continue
		}

		// add to output slice
		res[oi] = val
		oi++
	}

	return res, nil
}

type TruncateMutation struct {
}

func (*TruncateMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	if oldVal == nil {
		return nil, nil
	}

	oldArr, ok := oldVal.([]interface{})
	if !ok {
		return nil, errors.New("Truncate target must be an []interface{}")
	}

	if arg == nil {
		return nil, errors.New("Argument to truncate cannot be nil.")
	}

	argValf, ok := arg.(float64)
	if !ok {
		return nil, errors.New("Argument to truncate should be a number.")
	}

	argVal := int(argValf)
	if argVal < 0 || argVal > len(oldArr)-1 {
		return nil, errors.New("Argument to truncate is out of range.")
	}

	return oldArr[0:argVal], nil
}

type UnsetMutation struct {
}

func (*UnsetMutation) Apply(oldVal, arg interface{}) (interface{}, error) {
	return &UnsetMarker{}, nil
}

type UnsetMarker struct {
}
