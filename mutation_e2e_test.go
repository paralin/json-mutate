package mutate

import (
	"encoding/json"
	"fmt"
	"testing"
)

// Test going from before -> after -> back to before
func TestTwoWayMutationA(t *testing.T) {
	input := `{"test":[0,1,2,3,4,5]}`
	mutation := `{"test":{"$mutateIdx":{"1":"2","4":"4"},"$pull":[2]}}`
	// expectedOutput := `{"test":[0,"2"]}`
	if err := CheckTwoWay(input, mutation); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestTwoWayMutationB(t *testing.T) {
	input := `{"test":null}`
	// this will ensure order of operations
	mutation := `{"test":{"$set":[0,1,2],"$mutateIdx":{"1":"2"},"$pull":[2]}}`
	// expectedOutput := `{"test":[0,"2"]}`
	if err := CheckTwoWay(input, mutation); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func CheckTwoWay(input, inputMutation string) error {
	// Parse input
	var inputMap map[string]interface{}
	{
		var inputInterface interface{}
		if err := json.Unmarshal([]byte(input), &inputInterface); err != nil {
			return err
		}
		inputMap = inputInterface.(map[string]interface{})
	}

	var a map[string]interface{}
	{
		var inputInterface interface{}
		if err := json.Unmarshal([]byte(input), &inputInterface); err != nil {
			return err
		}
		a = inputInterface.(map[string]interface{})
	}

	var inputMutationMap map[string]interface{}
	{
		var inputInterface interface{}
		if err := json.Unmarshal([]byte(inputMutation), &inputInterface); err != nil {
			return err
		}
		inputMutationMap = inputInterface.(map[string]interface{})
	}

	// apply mutation to input (produces A)
	a, err := ApplyMutationObject(a, inputMutationMap)
	if err != nil {
		return err
	}

	// generate mutation from A to input
	reverseMutation := BuildMutation(a, inputMap)

	// apply mutation to A (produces B)
	b, err := ApplyMutationObject(a, reverseMutation)
	if err != nil {
		return err
	}

	// compare B to input
	outpBin, err := json.Marshal(b)
	if err != nil {
		return err
	}

	outpStr := string(outpBin)
	if outpStr != input {
		return fmt.Errorf("Output '%s' != expected '%s'", outpStr, input)
	}

	return nil
}
