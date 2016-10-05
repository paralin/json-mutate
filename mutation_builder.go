package mutate

import (
	"reflect"
	"strconv"
)

type nullMarker struct {
}

// slice mutation. this could be WAY more efficient.
// for now, just use ($push OR $truncate) -> mutateIdx
func buildSliceMutation(oldObjSlice, newObjSlice []interface{}, res map[string]interface{}) {
	// Follow order of slice mutations

	// == MutatePush ==
	lenNew := len(newObjSlice)
	lenOld := len(oldObjSlice)
	lenDiff := lenNew - lenOld
	if lenDiff > 0 {
		pushMutation := make([]interface{}, lenDiff)
		for i := lenOld; i < lenNew; i++ {
			pushMutation[i-lenOld] = newObjSlice[i]
			// also, append to old so the following mutations are correct
			oldObjSlice = append(oldObjSlice, newObjSlice[i])
		}
		res[MutationKeys[int(MutatePush)]] = pushMutation
	} else if lenDiff < 0 {
		// == MutateTruncate ==
		res[MutationKeys[int(MutateTruncate)]] = lenNew

		// also, apply to old so the following mutations are correct
		oldObjSlice = newObjSlice[0:lenNew]
		lenOld = lenNew
	}

	// MutateIdx
	mutateIndex := make(map[string]interface{})
	for idx, v := range newObjSlice {
		mutation := doBuildMutation(oldObjSlice[idx], v)
		if mutation == nil {
			continue
		}
		mutateIndex[strconv.Itoa(idx)] = mutation
	}
	if len(mutateIndex) != 0 {
		res[MutationKeys[int(MutateIdx)]] = mutateIndex
	}
}

// map mutation
func buildMapMutation(oldObjMap, newObjMap map[string]interface{}, res map[string]interface{}) {
	for k, _ := range newObjMap {
		mutation := doBuildMutation(oldObjMap[k], newObjMap[k])
		if mutation == nil {
			// check if we are going from undefined -> nil
			if newObjMap[k] == nil {
				if _, ok := oldObjMap[k]; !ok {
					res[k] = newObjMap[k]
				}
			}
			continue
		}
		if _, ok := mutation.(*nullMarker); ok {
			res[k] = nil
		} else {
			// set mutation on result
			res[k] = mutation
		}
	}

	// Check for any fields that have been completely unset
	for k, _ := range oldObjMap {
		if _, ok := newObjMap[k]; !ok {
			mutation := make(map[string]interface{})
			mutation[MutationKeys[int(MutateUnset)]] = nil
			res[k] = mutation
		}
	}
}

// Recursively build a mutation
func BuildMutation(oldObj, newObj interface{}) map[string]interface{} {
	return doBuildMutation(oldObj, newObj).(map[string]interface{})
}

func doBuildMutation(oldObj, newObj interface{}) interface{} {
	// check if they are equal, this is probably slow.
	if reflect.DeepEqual(oldObj, newObj) {
		return nil
	}

	// if we are setting the field for the first time, or to null, just set it
	if oldObj == nil && newObj != nil {
		// res[MutationKeys[int(MutateSet)]] = newObj
		return newObj
	}

	if newObj == nil {
		return &nullMarker{}
	}

	res := make(map[string]interface{})

	nKind := reflect.TypeOf(newObj).Kind()
	isPrimitive := !(nKind == reflect.Struct || nKind == reflect.Ptr || nKind == reflect.Interface || nKind == reflect.Map || nKind == reflect.Slice)
	if isPrimitive {
		return newObj
	}

	// if the types changed, use a $set
	if reflect.TypeOf(oldObj).Kind() != nKind {
		res[MutationKeys[int(MutateSet)]] = newObj
	} else if nKind == reflect.Slice {
		buildSliceMutation(oldObj.([]interface{}), newObj.([]interface{}), res)
	} else if nKind == reflect.Map {
		buildMapMutation(oldObj.(map[string]interface{}), newObj.(map[string]interface{}), res)
	}

	if len(res) == 0 {
		return nil
	}
	return res
}
