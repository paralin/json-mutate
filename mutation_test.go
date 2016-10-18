package mutate

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestSimpleMutation(t *testing.T) {
	input := `{"test": 4, "thing1": null, "thing2": {"thing3": []}}`
	mutation := `{"test": 5, "thing1": "hello", "thing2": {"thing3": {"$push": [4]}}}`
	expectedOutput := `{"test":5,"thing1":"hello","thing2":{"thing3":[4]}}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPullMutation(t *testing.T) {
	input := `{"test": {"test2": [2, 3, 4, 5]}}`
	mutation := `{"test": {"test2": {"$pull": [0, 2]}}}`
	expectedOutput := `{"test":{"test2":[3,5]}}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPullFromNil(t *testing.T) {
	input := `{"test": null}`
	mutation := `{"test": {"$pull": [0]}}`
	expectedOutput := `{"test":null}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPullNonArray(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$pull": 0}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error")
		t.Fail()
	}
}

func TestPullNonInteger(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$pull": ["0"]}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error")
		t.Fail()
	}
}

func TestPullNothing(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$pull": []}}`
	expectedOutput := `{"test":[0,1,2]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPullFromNonArray(t *testing.T) {
	input := `{"test": 0}`
	mutation := `{"test": {"$pull": [0]}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error")
		t.Fail()
	}
}

func TestSetMutation(t *testing.T) {
	input := `{"test": {"test2": [2, 3, 4, 5]}}`
	mutation := `{"test": {"test2": {"$set": [0, 2]}}}`
	expectedOutput := `{"test":{"test2":[0,2]}}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestTruncateMutation(t *testing.T) {
	input := `{"test": {"test2": [0,1,2,3,4,5]}}`
	mutation := `{"test": {"test2": {"$truncate": 3}}}`
	expectedOutput := `{"test":{"test2":[0,1,2]}}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestTruncateNil(t *testing.T) {
	input := `{"test": null}`
	mutation := `{"test": {"$truncate": 3}}`
	expectedOutput := `{"test":null}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestTruncateNonArray(t *testing.T) {
	input := `{"test": "kappa"}`
	mutation := `{"test": {"$truncate": 3}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error.")
		t.Fail()
	}
}

func TestTruncateNilArg(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$truncate": null}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error.")
		t.Fail()
	}
}

func TestTruncateNonIntArg(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$truncate": "test"}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error.")
		t.Fail()
	}
}

func TestTruncateOutOfRange(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$truncate": -1}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error.")
		t.Fail()
	}
	input = `{"test": [0,1,2]}`
	mutation = `{"test": {"$truncate": 3}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error.")
		t.Fail()
	}
}

func TestUnsetMutation(t *testing.T) {
	input := `{"test": {"test2": [0,1,2,3,4,5]}}`
	mutation := `{"test": {"test2": {"$unset": null}}}`
	expectedOutput := `{"test":{}}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestIndexMutation(t *testing.T) {
	input := `{"test": [0,1,{"test2": "kappa", "test3": {"what": "yep"}},3, [0]]}`
	mutation := `{"test": {"$mutateIdx": {"0": 2, "2": {"test2": "test","test3":{"what":null}}, "4": {"$push": [1]}}}}`
	expectedOutput := `{"test":[2,1,{"test2":"test","test3":{"what":null}},3,[0,1]]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestIndexMutationError(t *testing.T) {
	input := `{"test": [[0]]}`
	mutation := `{"test": {"$mutateIdx": {"0": {"$push": 1}}}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("TestIndexMutationError should produce an error")
		t.Fail()
	}
}

func TestPushMutationError(t *testing.T) {
	input := `{"test": [0]}`
	mutation := `{"test": {"$push": null}}`
	if err := CheckMutation(input, mutation, ""); err == nil {
		t.Fatal("This should produce an error")
		t.Fail()
	}
}

func TestEmptyMutation(t *testing.T) {
	input := `{"test": [0,1,{"test2": "kappa", "test3": {"what": "yep"}},3]}`
	mutation := `{"test": {}}`
	expectedOutput := `{"test":[0,1,{"test2":"kappa","test3":{"what":"yep"}},3]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestMutationOfPrimitive(t *testing.T) {
	input := `{"test": 0}`
	mutation := `{"test": {"$set": 4}}`
	expectedOutput := `{"test":4}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPushToNil(t *testing.T) {
	input := `{"test": null}`
	mutation := `{"test": {"$push": [4]}}`
	expectedOutput := `{"test":[4]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPushToNonArr(t *testing.T) {
	input := `{"test": 0}`
	mutation := `{"test": {"$push": [4]}}`
	expectedOutput := `{"test":[4]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestSubMutationOfPrimitive(t *testing.T) {
	input := `{"test": {"test2": 0}}`
	mutation := `{"test": {"test2": {"noexist": 4}}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Cannot apply sub-mutation to primitive." {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestIndexMutationOfObject(t *testing.T) {
	input := `{"test":{"hello":"world"}}`
	mutation := `{"test":{"$mutateIdx":{"0": "hello"}}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Cannot apply index mutation to non-slice type." {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestParseMutation(t *testing.T) {
	mut := ParseMutation(MutationKeys[0])
	if mut == nil || mut.MutationType != MutationType(0) {
		t.Fatal("ParseMutation did not produce expected output.")
		t.Fail()
	}
	mut = ParseMutation("$notexist")
	if mut != nil {
		t.Fatal("ParseMutation did not handle an unknown mutation key.")
		t.Fail()
	}
}

func TestNullBefore(t *testing.T) {
	if outp, err := ApplyMutationObject(nil, make(map[string]interface{})); outp != nil || err != nil {
		t.Fatalf("Applying a mutation to a nil object should return nil.")
		t.Fail()
	}
}

func TestInvalidMutateIdxArg(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$mutateIdx": 2}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Index mutation arg must be a map." {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestInvalidMutateIdxKey(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$mutateIdx": {"fat": "2"}}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Error parsing int in index mutation: strconv.ParseInt: parsing \"fat\": invalid syntax" {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestOutOfRangeMutateIdx(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$mutateIdx": {"-1": "2"}}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Index mutation idx out of range." {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestOutOfRangeMutateIdxB(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$mutateIdx": {"3": "2"}}}`
	if err := CheckMutation(input, mutation, ""); err == nil || err.Error() != "Index mutation idx out of range." {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestMultiMutation(t *testing.T) {
	input := `{"test": [0,1,2]}`
	mutation := `{"test": {"$mutateIdx": {"1": "2"}, "$pull": [2]}}`
	expectedOutput := `{"test":[0,"2"]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestMutateIdx(t *testing.T) {
	input := `{"test":["wow"]}`
	mutation := `{"test":{"$mutateIdx":{"0":"wow"},"$push":[1]}}`
	expectedOutput := `{"test":["wow",1]}`
	if err := CheckMutation(input, mutation, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func CheckMutation(input, inputMutation, expectedOutput string) error {
	// Parse input
	var inputMap map[string]interface{}
	{
		var inputInterface interface{}
		if err := json.Unmarshal([]byte(input), &inputInterface); err != nil {
			return err
		}
		inputMap = inputInterface.(map[string]interface{})
	}

	var inputMutationMap map[string]interface{}
	{
		var inputInterface interface{}
		if err := json.Unmarshal([]byte(inputMutation), &inputInterface); err != nil {
			return err
		}
		inputMutationMap = inputInterface.(map[string]interface{})
	}

	outp, err := ApplyMutationObject(inputMap, inputMutationMap)
	if err != nil {
		return err
	}

	outpBin, err := json.Marshal(&outp)
	if err != nil {
		return err
	}

	outpStr := string(outpBin)
	if outpStr != expectedOutput {
		return fmt.Errorf("Output '%s' != expected '%s'", outpStr, expectedOutput)
	}

	return nil
}
