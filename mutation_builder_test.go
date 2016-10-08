package mutate

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestTypeChange(t *testing.T) {
	input := `{"test": "hello"}`
	after := `{"test": 5}`
	expectedOutput := `{"test":5}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestSetNull(t *testing.T) {
	input := `{"test": "hello"}`
	after := `{"test": null}`
	expectedOutput := `{"test":null}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestSetNewField(t *testing.T) {
	input := `{}`
	after := `{"test": 1}`
	expectedOutput := `{"test":1}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestSetObject(t *testing.T) {
	input := `{"test": "hello"}`
	after := `{"test": {"test": 1}}`
	expectedOutput := `{"test":{"$set":{"test":1}}}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestUnsetKey(t *testing.T) {
	input := `{"test": "hello", "test2": 1}`
	after := `{"test": "hello"}`
	expectedOutput := `{"test2":{"$unset":null}}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestPush(t *testing.T) {
	input := `{"a":[0,1,2]}`
	after := `{"a":[0,1,2,3,4]}`
	expectedOutput := `{"a":{"$push":[3,4]}}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestTruncate(t *testing.T) {
	input := `{"a":[0,1,2,3,4]}`
	after := `{"a":[0,1,2]}`
	expectedOutput := `{"a":{"$truncate":3}}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestMutateIndex(t *testing.T) {
	input := `{"test": ["hello", {"test": 1}]}`
	after := `{"test": ["goodbye", {"test": 3}]}`
	expectedOutput := `{"test":{"$mutateIdx":{"0":"goodbye","1":{"test":3}}}}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestComplexSetNull(t *testing.T) {
	input := `{"test": {"test2": {"test3": [0,1,2,3]}}}`
	after := `{"test": null}`
	expectedOutput := `{"test":null}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func TestSetFirstTime(t *testing.T) {
	input := `{}`
	after := `{"test": null}`
	expectedOutput := `{"test":null}`
	if err := CheckMutationBuild(input, after, expectedOutput); err != nil {
		t.Fatal(err.Error())
		t.Fail()
	}
}

func CheckMutationBuild(input, inputMutation, expectedOutput string) error {
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

	outp := BuildMutation(inputMap, inputMutationMap)
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
