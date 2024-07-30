#!/usr/bin/env bash
go mod tidy

go build -o libgohello.a -buildmode=c-archive main.go
