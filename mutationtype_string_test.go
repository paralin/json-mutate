package mutate

import "testing"

func TestMutationTypeString(t *testing.T) {
	typ := MutationType(MutatePull)
	if typ.String() != "MutatePull" {
		t.Fail()
	}
}

func TestMutationTypeStringOutOfRange(t *testing.T) {
	typ := MutationType(9999)
	if typ.String() != "MutationType(9999)" {
		t.Fail()
	}
}
