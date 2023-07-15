---
id: mem
title: Memory Procedures
sidebar_label: Memory Procedures
description: Mem Module contains a set of utility procedures for working with random access memory.
keywords:
  - docs
  - polygon
  - wiki
  - miden
  - mem
image: https://wiki.polygon.technology/img/thumbnail/polygon-miden.png
---

Module `std::mem` contains a set of utility procedures for working with random access memory.

| Procedure | Description |
| ----------- | ------------- |
| memcopy | Copies `n` words from `read_ptr` to `write_ptr`.<br /><br />Stack transition looks as follows:<br /><br />[n, read_ptr, write_ptr, ...] -> [...]<br /><br />Cycles: 15 + 16n |
